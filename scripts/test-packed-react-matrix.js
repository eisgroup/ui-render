const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

/**
 * Peer-range matrix (§0.7).
 *
 * `peerDependencies` claims React 16.14 through 18, but `npm ci` installs exactly one React, so until now
 * the claim was only ever exercised at that one version. This installs the other ends of the declared range
 * into a throwaway directory -- never this repository's node_modules -- and re-runs the packed-consumer
 * smoke against each.
 *
 * This checks the published artifact rather than the suite, because a peer range is a claim about what we
 * publish. Server rendering exercises module resolution, the render path and the CSS payload -- not events,
 * effect timing or anything else needing a DOM. Running the Jest suite on React 16 is a separate, gating
 * leg -- `npm run test:react16` -- so the two are complementary, not alternatives.
 *
 * Usage: `node scripts/test-packed-react-matrix.js [version ...]`. With no arguments it covers the declared
 * range below; pass versions (e.g. `19.2.0`) to probe headroom outside it.
 */
const ROOT = path.resolve(__dirname, '..')

/** The installed version is covered by `npm run test:pack:consumer`; these are the ends it never sees. */
const DECLARED_RANGE = ['16.14.0', '17.0.2']

function installedReactVersion () {
    return require(path.join(ROOT, 'node_modules', 'react', 'package.json')).version
}

function run (command, args, options) {
    const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'inherit', ...options })
    if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`)
}

function verify (version, workspace) {
    const target = path.join(workspace, `react-${version}`)
    fs.mkdirSync(target, { recursive: true })
    // A private manifest keeps npm from walking up and treating this repository as the install root.
    fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({
        name: `eis-ui-render-peer-react-${version}`,
        private: true,
        version: '1.0.0',
    }, null, 2))

    console.log(`\n=== react ${version} ===`)
    run('npm', [
        'install', `react@${version}`, `react-dom@${version}`,
        '--no-audit', '--no-fund', '--no-package-lock', '--loglevel=error',
    ], { cwd: target })
    // The smoke asserts the version that actually loaded, so a resolution slip back to this repository's
    // React fails there rather than passing as a false positive here.
    run(process.execPath, [
        path.join(__dirname, 'test-packed-consumer.js'),
        `--react-dir=${path.join(target, 'node_modules')}`,
    ], { cwd: ROOT })
}

if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) {
    // The packed-consumer smoke packs with `--ignore-scripts`, so a missing build fails downstream with an
    // opaque tarball/CSS error. CI runs this after "Build library"; a standalone local run may not have.
    console.error('dist/index.js is missing -- run `npm run build-lib` before `npm run test:pack:peers`.')
    process.exit(1)
}

const requested = process.argv.slice(2)
const versions = requested.length ? requested : DECLARED_RANGE
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'eis-ui-render-peer-matrix-'))

try {
    console.log(`peer range under test: ${versions.join(', ')} (installed: react ${installedReactVersion()})`)
    for (const version of versions) verify(version, workspace)
    console.log(`\npeer-range matrix passed: the packed artifact server-rendered on ${versions.join(', ')}`)
} finally {
    fs.rmSync(workspace, { recursive: true, force: true })
}
