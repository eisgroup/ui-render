const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { pathToFileURL } = require('url')
const webpack = require('webpack')
const { ROOT, createPackedConsumer } = require('./packed-workspace')

/**
 * Packed-tarball BROWSER smoke: `npm run test:pack:browser`, after `npm run build-lib`.
 *
 * test-packed-consumer.js renders the published bundle on the server, and the browser suite drives the demo,
 * which mounts `src/`. Neither loads what a host ships, the published bundle and the published stylesheet, in
 * a browser. This does. In the same throwaway host as the server smoke (./packed-workspace.js), webpack bundles
 * ./fixtures/packed-browser-entry.js with the host's React and the published package. The page links the
 * package's own `static/all.css`, the payload hosts copy to their web root, and carries a host element of its
 * own outside the widget. Playwright then opens the page, from disk, under playwright.packed.config.js.
 *
 * ON EVERY REACT OF THE PEER RANGE. With no argument the host gets this repository's React (18). `--react-dir=<dir>`
 * takes the externals from another install, as the server smoke does, and `--peers` (`npm run test:pack:browser:peers`)
 * runs the page once on each React the jest legs pin, 16.14, 17 and 19, from their fixtures. Every 0.34.x host runs
 * React 16.14, which no other gate drives in a browser: the jest legs run jsdom, and the demo mounts through
 * `createRoot`. The host mounts through `ReactDOM.render` on 16 and 17 (./fixtures/packed-mount-legacy.js).
 */
const FIXTURES = path.join(__dirname, 'fixtures')

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>eis-ui-render: the packed tarball in a browser</title>
<link rel="stylesheet" href="static/all.css">
</head>
<body>
<p id="outside" class="padding">The host page, outside the widget.</p>
<div id="host"></div>
<!-- Scaled, as a host's zoomed panel or animated popup is: the list scrolls by its own pixels, not the page's. -->
<div style="transform: scale(0.8); transform-origin: top left"><div id="list"></div></div>
<div id="tall" style="height: 200px; overflow: auto"></div>
<div id="popup"></div>
<!-- #host's document a second time, as a host that shows one form twice: each keeps its own ids and labels. -->
<div id="twin"></div>
<script src="bundle.js"></script>
</body>
</html>
`

function bundle (consumer, page) {
    return new Promise((resolve, reject) => {
        webpack({
            mode: 'production',
            context: consumer,
            entry: './browser-entry.js',
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

const REACT_DIR_FLAG = '--react-dir='

/** The React installs to run the page on: this repository's, one given with `--react-dir`, or the pinned peers. */
function reactDirs () {
    const args = process.argv.slice(2)
    if (args.includes('--peers')) {
        const floors = require('./fixtures/react-legacy/floors')
        return Object.values(floors).map(floor => path.join(ROOT, floor.fixtureDir, 'node_modules'))
    }
    const given = args.find(argument => argument.startsWith(REACT_DIR_FLAG))
    return [given ? path.resolve(given.slice(REACT_DIR_FLAG.length)) : null]
}

async function runOn (reactDir) {
    const { workspace, consumer, packageDir, linked } = createPackedConsumer({ reactDir })
    try {
        fs.copyFileSync(path.join(FIXTURES, 'packed-browser-entry.js'), path.join(consumer, 'browser-entry.js'))
        fs.copyFileSync(path.join(FIXTURES, 'packed-meta.js'), path.join(consumer, 'packed-meta.js'))
        const legacyRoot = Number(linked['react-dom'].split('.')[0]) < 18
        fs.copyFileSync(
            path.join(FIXTURES, legacyRoot ? 'packed-mount-legacy.js' : 'packed-mount-root.js'),
            path.join(consumer, 'packed-mount.js'),
        )
        const page = path.join(consumer, 'page')
        fs.cpSync(path.join(packageDir, 'static'), path.join(page, 'static'), { recursive: true })
        fs.writeFileSync(path.join(page, 'index.html'), PAGE)
        await bundle(consumer, page)
        console.log(`packed browser page: ${path.join(page, 'index.html')} (react ${linked.react}, ${legacyRoot ? 'ReactDOM.render' : 'createRoot'})`)

        const result = spawnSync('npx', ['playwright', 'test', '--config', 'playwright.packed.config.js'], {
            cwd: ROOT,
            stdio: 'inherit',
            env: {
                ...process.env,
                PACKED_PAGE: pathToFileURL(path.join(page, 'index.html')).href,
                PACKED_EXPECT_REACT: linked.react,
            },
        })
        return result.status === null ? 1 : result.status
    } finally {
        fs.rmSync(workspace, { recursive: true, force: true })
    }
}

async function main () {
    let failed = 0
    for (const reactDir of reactDirs()) {
        if (await runOn(reactDir) !== 0) failed += 1
    }
    return failed ? 1 : 0
}

main()
    .then(code => { process.exitCode = code })
    .catch(error => {
        console.error(error.message)
        process.exitCode = 1
    })
