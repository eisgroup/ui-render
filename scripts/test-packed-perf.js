const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { pathToFileURL } = require('url')
const webpack = require('webpack')
const { ROOT, createPackedConsumer } = require('./packed-workspace')

/**
 * What the published package's documents cost in a browser: `npm run test:perf`, after `npm run build-lib`.
 *
 * In the same throwaway host as the packed smokes (./packed-workspace.js), webpack bundles
 * ./fixtures/packed-perf-entry.js with this repository's React and the packed package, beside the package's own
 * `static/all.css`. playwright.perf.config.js then opens the page once per document and measures each action's
 * main-thread busy time (e2e/perf/scenarios.perf.js). The medians are written to `--out`
 * (test-results-perf/perf-results.json by default) and printed.
 *
 * `--tarball=<file>` measures a tarball packed elsewhere instead of this repository's dist/, such as one packed from
 * another commit, so that two versions are compared on one machine with one harness.
 */
const FIXTURES = path.join(__dirname, 'fixtures')

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>eis-ui-render: what a document costs in a browser</title>
<link rel="stylesheet" href="static/all.css">
</head>
<body>
<div id="host"></div>
<script src="bundle.js"></script>
</body>
</html>
`

function bundle (consumer, page) {
    return new Promise((resolve, reject) => {
        webpack({
            mode: 'production',
            context: consumer,
            entry: './perf-entry.js',
            output: { path: page, filename: 'bundle.js' },
            devtool: false,
            performance: { hints: false },
        }, (error, stats) => {
            if (error) return reject(error)
            if (stats.hasErrors()) return reject(new Error(stats.toString({ all: false, errors: true })))
            resolve()
        })
    })
}

function flag (name) {
    const given = process.argv.slice(2).find(argument => argument.startsWith(`--${name}=`))
    return given ? given.slice(name.length + 3) : null
}

/** The medians, one line per action. */
function report (out) {
    const results = JSON.parse(fs.readFileSync(out, 'utf8'))
    for (const [scenario, actions] of Object.entries(results)) {
        const line = Object.entries(actions).map(([action, { median }]) => `${action} ${median} ms`).join(', ')
        console.log(`perf: ${scenario}: ${line}`)
    }
}

async function main () {
    const tarball = flag('tarball')
    const out = path.resolve(flag('out') || path.join(ROOT, 'test-results-perf', 'perf-results.json'))
    fs.mkdirSync(path.dirname(out), { recursive: true })
    // So that a run that fails before it writes reports nothing, not the last run's numbers.
    fs.rmSync(out, { force: true })
    const { workspace, consumer, packageDir, linked } = createPackedConsumer({ tarball })
    try {
        fs.copyFileSync(path.join(FIXTURES, 'packed-perf-entry.js'), path.join(consumer, 'perf-entry.js'))
        fs.copyFileSync(path.join(FIXTURES, 'packed-mount-root.js'), path.join(consumer, 'packed-mount.js'))
        const page = path.join(consumer, 'page')
        fs.cpSync(path.join(packageDir, 'static'), path.join(page, 'static'), { recursive: true })
        fs.writeFileSync(path.join(page, 'index.html'), PAGE)
        await bundle(consumer, page)
        const version = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version
        console.log(`perf page: ${path.join(page, 'index.html')} (eis-ui-render ${version}${tarball ? ` from ${tarball}` : ''}, react ${linked.react})`)

        const result = spawnSync('npx', ['playwright', 'test', '--config', 'playwright.perf.config.js'], {
            cwd: ROOT,
            stdio: 'inherit',
            env: {
                ...process.env,
                PERF_PAGE: pathToFileURL(path.join(page, 'index.html')).href,
                PERF_OUT: out,
            },
        })
        if (fs.existsSync(out)) report(out)
        return result.status === null ? 1 : result.status
    } finally {
        fs.rmSync(workspace, { recursive: true, force: true })
    }
}

main()
    .then(code => { process.exitCode = code })
    .catch(error => {
        console.error(error.message)
        process.exitCode = 1
    })
