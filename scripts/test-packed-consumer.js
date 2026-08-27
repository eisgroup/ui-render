const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

/**
 * Packed-tarball consumer smoke (§0.7).
 *
 * `test-public-types.js` checks the declarations that dist/ emits; this checks the artifact npm actually
 * publishes. The consumer lives outside the repository and gets only the three externals (react, react-dom,
 * moment) linked in, so a dependency that is neither bundled nor declared cannot be satisfied by the
 * repository's own node_modules and fails loudly.
 *
 * Peer-range matrix: `--react-dir=<node_modules>` (or PACKED_CONSUMER_REACT_DIR) takes the externals from
 * another install instead of this repository's, so the artifact can be smoked against a React that is not
 * installed here -- the peer range is a claim about the artifact, not about the checked-in lockfile.
 * Externals the override does not provide still come from this repository, and with no argument the harness
 * links exactly what it always did.
 */
const ROOT = path.resolve(__dirname, '..')
const FIXTURES = path.join(__dirname, 'fixtures')
const EXTERNALS = ['react', 'react-dom', 'moment']
const REACT_DIR_FLAG = '--react-dir='

function parseReactDir () {
    let raw = process.env.PACKED_CONSUMER_REACT_DIR || ''
    for (const argument of process.argv.slice(2)) {
        if (!argument.startsWith(REACT_DIR_FLAG)) {
            throw new Error(`unknown argument ${argument}; expected ${REACT_DIR_FLAG}<node_modules dir>`)
        }
        raw = argument.slice(REACT_DIR_FLAG.length)
    }
    if (!raw) return null
    const resolved = path.resolve(raw)
    if (!fs.existsSync(path.join(resolved, 'react', 'package.json'))) {
        throw new Error(`${resolved} holds no react package; point --react-dir at a node_modules directory`)
    }
    return resolved
}

/** The override wins for what it carries; everything else keeps coming from this repository. */
function externalSource (reactDir, external) {
    const candidate = reactDir && path.join(reactDir, external)
    if (candidate && fs.existsSync(path.join(candidate, 'package.json'))) return candidate
    return path.join(ROOT, 'node_modules', external)
}

function packageVersion (packageDir) {
    return JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version
}

/**
 * Deep paths hosts consume: the root payload they copy to their web root, and the dist re-export. Each must
 * resolve to real rules, so a stub pointing at a stub (or at nothing) cannot pass; `font.css` is a single
 * `@font-face` block, hence its own floor.
 */
const CSS_ENTRIES = ['dist/static/all.css', 'dist/static/font.css', 'static/all.css', 'static/font.css']
const REAL_CSS_MIN_BYTES = { 'all.css': 100 * 1024, 'font.css': 200 }

function run (command, args, options) {
    const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options })
    if (result.status !== 0) {
        process.stderr.write(result.stdout || '')
        process.stderr.write(result.stderr || '')
        throw new Error(`${command} ${args.join(' ')} failed`)
    }
    return result.stdout
}

/** Resolve a stylesheet through its `@import` chain and return the file that finally holds the rules. */
function resolveStylesheet (packageDir, relativePath, seen = []) {
    const absolute = path.join(packageDir, relativePath)
    if (!fs.existsSync(absolute)) {
        throw new Error(`${relativePath} is missing from the tarball (chain: ${[...seen, relativePath].join(' -> ')})`)
    }
    const contents = fs.readFileSync(absolute, 'utf8')
    const imported = contents.match(/@import\s+['"]([^'"]+)['"]/)
    if (!imported) return { relativePath, contents }
    const next = path.posix.join(path.posix.dirname(relativePath), imported[1])
    if (seen.includes(next)) throw new Error(`circular @import chain: ${[...seen, relativePath, next].join(' -> ')}`)
    return resolveStylesheet(packageDir, next, [...seen, relativePath])
}

function assertStylesheets (packageDir) {
    for (const entry of CSS_ENTRIES) {
        const { relativePath, contents } = resolveStylesheet(packageDir, entry)
        const minBytes = REAL_CSS_MIN_BYTES[path.posix.basename(entry)]
        if (Buffer.byteLength(contents) < minBytes) {
            throw new Error(
                `${entry} resolves to ${relativePath} at ${Buffer.byteLength(contents)} B,`
                + ` below the ${minBytes} B floor for real rules`
            )
        }
        // url() targets are relative to the file that declares them, which is the resolved one, not the entry.
        const base = path.posix.dirname(relativePath)
        for (const [, reference] of contents.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
            if (/^(data:|https?:|\/\/)/.test(reference)) continue
            const asset = path.join(packageDir, base, reference.split(/[?#]/)[0])
            if (!fs.existsSync(asset)) {
                throw new Error(`${relativePath} references ${reference}, which the tarball does not ship`)
            }
        }
        console.log(`packed stylesheet: ${entry} -> ${relativePath} resolved with all assets present`)
    }
}

const reactDir = parseReactDir()
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'eis-ui-render-packed-'))

try {
    // dist/ is built by the caller (npm run build-lib); --ignore-scripts keeps prepack from rebuilding it here.
    const stdout = run('npm', [
        'pack', '--json', '--ignore-scripts', '--pack-destination', workspace,
    ], { cwd: ROOT })
    // npm prints the JSON array last; anything before it is notice noise.
    const start = stdout.indexOf('[')
    if (start === -1) throw new Error('npm pack produced no JSON payload')
    const tarball = path.join(workspace, JSON.parse(stdout.slice(start))[0].filename)

    const extracted = path.join(workspace, 'extracted')
    fs.mkdirSync(extracted)
    run('tar', ['-xzf', tarball, '-C', extracted])

    const consumer = path.join(workspace, 'consumer')
    const modules = path.join(consumer, 'node_modules')
    fs.mkdirSync(modules, { recursive: true })
    // A real copy, not a symlink: Node resolves symlinked packages by realpath, which would let the bundle
    // reach the repository's node_modules and hide a missing dependency.
    fs.cpSync(path.join(extracted, 'package'), path.join(modules, 'eis-ui-render'), { recursive: true })
    const linked = {}
    for (const external of EXTERNALS) {
        const source = externalSource(reactDir, external)
        // Node resolves a symlinked package by realpath, so each external keeps loading its own transitive
        // dependencies (react-dom 16 finds react 16 next to it, not this repository's react 18).
        fs.symlinkSync(source, path.join(modules, external))
        linked[external] = packageVersion(source)
        console.log(`packed external: ${external} ${linked[external]} from ${source}`)
    }
    // An override that carries react but not react-dom would silently pair mismatched renderers, which fails
    // later with a React error that says nothing about the harness.
    if (linked.react.split('.')[0] !== linked['react-dom'].split('.')[0]) {
        throw new Error(`react ${linked.react} and react-dom ${linked['react-dom']} must share a major version`)
    }
    fs.copyFileSync(path.join(FIXTURES, 'packed-consumer.js'), path.join(consumer, 'index.js'))

    const packageDir = path.join(modules, 'eis-ui-render')
    assertStylesheets(packageDir)

    const output = run(process.execPath, ['index.js'], {
        cwd: consumer,
        // The fixture refuses to render unless the React that actually loaded is the one linked above.
        env: { ...process.env, PACKED_CONSUMER_EXPECT_REACT: linked.react },
    })
    const lines = output.trim().split('\n')
    if (lines[lines.length - 1] !== 'ok') throw new Error(`unexpected consumer output: ${output}`)
    for (const line of lines.slice(0, -1)) console.log(`packed consumer: ${line}`)
    console.log(
        `packed runtime: server-rendered the published bundle on react ${linked.react}`
        + ' with only react, react-dom and moment'
    )
} finally {
    fs.rmSync(workspace, { recursive: true, force: true })
}
