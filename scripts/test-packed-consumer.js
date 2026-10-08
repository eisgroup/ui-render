const fs = require('fs')
const path = require('path')
const { run, createPackedConsumer } = require('./packed-workspace')

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
const FIXTURES = path.join(__dirname, 'fixtures')
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

/**
 * Deep paths hosts consume: the root payload they copy to their web root, and the dist re-export. Each must
 * resolve to real rules, so a stub pointing at a stub (or at nothing) cannot pass; `font.css` is a single
 * `@font-face` block, hence its own floor.
 */
const CSS_ENTRIES = ['dist/static/all.css', 'dist/static/font.css', 'static/all.css', 'static/font.css']
const REAL_CSS_MIN_BYTES = { 'all.css': 100 * 1024, 'font.css': 200 }

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
const { workspace, consumer, packageDir, linked } = createPackedConsumer({ reactDir })

try {
    fs.copyFileSync(path.join(FIXTURES, 'packed-consumer.js'), path.join(consumer, 'index.js'))
    fs.copyFileSync(path.join(FIXTURES, 'packed-meta.js'), path.join(consumer, 'packed-meta.js'))
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
