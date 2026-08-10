const { spawnSync } = require('child_process')

/**
 * Packaging budget gate (§0.7).
 *
 * Runs against the *manifest npm would publish*, not the working tree, so `files` mistakes, a re-introduced
 * asset mirror or an unnoticed bundle jump fail here instead of in a consumer's install.
 *
 * Budgets sit deliberately close to the measured baseline: they are a change detector, not headroom. Raise a
 * limit only together with the reason the artifact legitimately grew.
 */
const BUDGETS = {
    files: 330,
    unpackedBytes: 8 * 1024 * 1024,
    packedBytes: 3 * 1024 * 1024,
}

/** Individual files large enough that a size jump matters on its own. */
const FILE_BUDGETS = {
    'dist/index.js': 480 * 1024,
    'dist/index.js.map': 2560 * 1024,
    'static/all.css': 440 * 1024,
    'static/all.css.map': 1024 * 1024,
}

/** Must exist, or the tarball is unusable in one of the two supported consumption paths. */
const REQUIRED = [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/static/all.css',
    'static/all.css',
    'static/font.css',
    'static/fonts/icons/fonts/iconsOpenL.woff',
    'static/images/flags/pl.svg',
]

/** `dist/static/` stylesheets re-export the root payload; real bytes there mean the mirror is back. */
const RE_EXPORTS = ['dist/static/all.css', 'dist/static/font.css']
const RE_EXPORT_MAX_BYTES = 1024

/** Assets duplicated above this size are what made the tarball 11 MB before deduplication. */
const DUPLICATE_MIN_BYTES = 64 * 1024

function readManifest () {
    // --ignore-scripts keeps `prepack` from recursing into this check; the caller builds dist/ first.
    const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    })
    if (result.status !== 0) {
        process.stderr.write(result.stderr)
        throw new Error('npm pack --dry-run failed')
    }
    // npm prints the JSON array last; anything before it is notice noise.
    const start = result.stdout.indexOf('[')
    if (start === -1) throw new Error('npm pack --dry-run produced no JSON payload')
    return JSON.parse(result.stdout.slice(start))[0]
}

function mb (bytes) {
    return `${(bytes / 1048576).toFixed(2)} MB`
}

function findDuplicates (files) {
    const byName = new Map()
    for (const file of files) {
        if (file.size < DUPLICATE_MIN_BYTES) continue
        const key = `${file.path.split('/').pop()}:${file.size}`
        if (!byName.has(key)) byName.set(key, [])
        byName.get(key).push(file.path)
    }
    return [...byName.values()].filter(paths => paths.length > 1)
}

const manifest = readManifest()
const sizes = new Map(manifest.files.map(file => [file.path, file.size]))
const failures = []

const measured = [
    ['files', manifest.entryCount, BUDGETS.files, String],
    ['unpacked size', manifest.unpackedSize, BUDGETS.unpackedBytes, mb],
    ['packed size', manifest.size, BUDGETS.packedBytes, mb],
]
for (const [label, actual, limit, format] of measured) {
    const status = actual <= limit ? 'ok' : 'OVER'
    console.log(`${label.padEnd(14)} ${format(actual).padStart(10)} / ${format(limit).padStart(10)}  ${status}`)
    if (actual > limit) failures.push(`${label}: ${format(actual)} exceeds budget ${format(limit)}`)
}

for (const [path, limit] of Object.entries(FILE_BUDGETS)) {
    const actual = sizes.get(path)
    if (actual === undefined) {
        failures.push(`${path}: expected in the tarball but missing`)
    } else if (actual > limit) {
        failures.push(`${path}: ${mb(actual)} exceeds budget ${mb(limit)}`)
    }
}

for (const path of REQUIRED) {
    if (!sizes.has(path)) failures.push(`${path}: missing from the tarball`)
}

for (const path of RE_EXPORTS) {
    const actual = sizes.get(path)
    if (actual !== undefined && actual > RE_EXPORT_MAX_BYTES) {
        failures.push(`${path}: ${actual} B — expected a re-export stub, not a second copy of the stylesheet`)
    }
}

for (const paths of findDuplicates(manifest.files)) {
    failures.push(`duplicated asset shipped ${paths.length}×: ${paths.join(', ')}`)
}

if (failures.length) {
    console.error(`\npackaging budget failed:`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
}

console.log(`\npackaging budget passed (${manifest.entryCount} files, ${mb(manifest.unpackedSize)} unpacked)`)
