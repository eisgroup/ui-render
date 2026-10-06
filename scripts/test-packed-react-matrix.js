const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

/**
 * Peer-range matrix (§0.7).
 *
 * `peerDependencies` claims React 16.14 through 19, but the repository develops on one React, so until now
 * the claim was only ever exercised at that one version. This re-runs the packed-consumer smoke against
 * each other end of the declared range: the Reacts the per-React jest legs run on, from their fixtures
 * (`scripts/fixtures/react-legacy/floors.js` names them), which `npm ci` installs from the lockfile.
 *
 * It installed those versions from the registry into a throwaway directory until 2026-10-06. The fixtures
 * hold the same versions, pinned by the lockfile with their integrity, so the smoke needs no network,
 * cannot resolve a different patch from the one the legs test, and has one list of versions to keep.
 *
 * This checks the published artifact rather than the suite, because a peer range is a claim about what we
 * publish. Server rendering exercises module resolution, the render path and the CSS payload -- not events,
 * effect timing or anything else needing a DOM. Running the Jest suite on those Reacts is a separate, gating
 * leg per version -- `npm run test:react16`, `test:react17`, `test:react19` -- so the two are complementary,
 * not alternatives.
 *
 * Usage: `node scripts/test-packed-react-matrix.js [version ...]`. With no arguments it covers the declared
 * range, from the fixtures; pass versions (e.g. `20.0.0`) to probe headroom outside it, which installs
 * them from the registry into a throwaway directory, never into this repository's node_modules.
 */
const ROOT = path.resolve(__dirname, '..')
const floors = require('./fixtures/react-legacy/floors')

/**
 * The installed version is covered by `npm run test:pack:consumer`; these are the ends it never sees, each
 * from the fixture of its jest leg.
 */
const DECLARED_RANGE = Object.values(floors).map(floor => ({
    version: floor.react,
    reactDir: path.join(ROOT, floor.fixtureDir, 'node_modules'),
    fixture: floor.fixtureDir,
}))

function installedReactVersion () {
    return require(path.join(ROOT, 'node_modules', 'react', 'package.json')).version
}

function run (command, args, options) {
    const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'inherit', ...options })
    if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`)
}

/** Installs a version that no fixture holds into the throwaway workspace; returns its node_modules. */
function install (version, workspace) {
    const target = path.join(workspace, `react-${version}`)
    fs.mkdirSync(target, { recursive: true })
    // A private manifest keeps npm from walking up and treating this repository as the install root.
    fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({
        name: `eis-ui-render-peer-react-${version}`,
        private: true,
        version: '1.0.0',
    }, null, 2))

    run('npm', [
        'install', `react@${version}`, `react-dom@${version}`,
        '--no-audit', '--no-fund', '--no-package-lock', '--loglevel=error',
    ], { cwd: target })
    return path.join(target, 'node_modules')
}

/** A fixture must hold the version its leg pins: a missing or drifted one fails here, by name. */
function fixtureModules ({ version, reactDir, fixture }) {
    const manifest = path.join(reactDir, 'react', 'package.json')
    if (!fs.existsSync(manifest)) {
        throw new Error(`${fixture} holds no react: run \`npm ci\`, which installs the legs' fixtures`)
    }
    const installed = JSON.parse(fs.readFileSync(manifest, 'utf8')).version
    if (installed !== version) {
        throw new Error(`${fixture} holds react ${installed}, but floors.js pins ${version}: run \`npm ci\``)
    }
    return reactDir
}

function verify (target, workspace) {
    console.log(`\n=== react ${target.version} ===`)
    const modules = target.reactDir ? fixtureModules(target) : install(target.version, workspace)
    // The smoke asserts the version that actually loaded, so a resolution slip back to this repository's
    // React fails there rather than passing as a false positive here.
    run(process.execPath, [
        path.join(__dirname, 'test-packed-consumer.js'),
        `--react-dir=${modules}`,
    ], { cwd: ROOT })
}

if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) {
    // The packed-consumer smoke packs with `--ignore-scripts`, so a missing build fails downstream with an
    // opaque tarball/CSS error. CI runs this after "Build library"; a standalone local run may not have.
    console.error('dist/index.js is missing -- run `npm run build-lib` before `npm run test:pack:peers`.')
    process.exit(1)
}

const requested = process.argv.slice(2)
const targets = requested.length ? requested.map(version => ({ version })) : DECLARED_RANGE
const versions = targets.map(target => target.version).join(', ')
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'eis-ui-render-peer-matrix-'))

try {
    console.log(`peer range under test: ${versions} (installed: react ${installedReactVersion()})`)
    for (const target of targets) verify(target, workspace)
    console.log(`\npeer-range matrix passed: the packed artifact server-rendered on ${versions}`)
} finally {
    fs.rmSync(workspace, { recursive: true, force: true })
}
