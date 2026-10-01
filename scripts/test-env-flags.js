const fs = require('fs')
const os = require('os')
const path = require('path')
const vm = require('vm')
const { pathToFileURL } = require('url')

/**
 * Build-level env-flag harness.
 *
 * WHAT IT CATCHES. `src/core/utils/_envs.ts` derives NODE_ENV / __PROD__ / __DEV__ from whatever `process.env`
 * becomes AFTER a bundler has rewritten it, and `src/core/common/variables/index.ts` builds FILE.PATH_IMAGES from
 * those flags. No jest suite can see that: jest runs the source against Node's real `process.env`. This compiles
 * the SOURCE with each REAL webpack config and evaluates the output in a realm that, like a browser, has no
 * `process` global -- so it measures what ships, not what jest sees.
 *
 * WHAT IT CHANGES IN THE REAL CONFIGS, AND NOTHING ELSE:
 *   - `entry` -> scripts/fixtures/env-flags-entry.js (imports the source, publishes globalThis.__probe)
 *   - `output.path` -> a temp dir (every other output field -- UMD library, filename, publicPath -- is kept)
 *   - plugins that would touch the repo are dropped: the library's inline plugin (its hooks delete and rewrite
 *     the root static/) and CopyPlugin. DefinePlugin, ProvidePlugin, Dotenv and MiniCssExtractPlugin are KEPT,
 *     and the harness refuses to run if a config stops carrying the ones it is supposed to carry.
 * The caller's shell cannot leak in: NODE_ENV, REACT_APP_*, PUBLIC_PATH and OUTPUT_DIR are scrubbed before any
 * build, and each case sets only what its npm script (or playwright.config.js) sets.
 *
 * Exit 0: every assertion held. Exit 1: an assertion failed (the table says which). Exit 2: the harness broke.
 *
 *   node scripts/test-env-flags.js                 all cases
 *   node scripts/test-env-flags.js demo-production one or more case names
 */
const ROOT = path.resolve(__dirname, '..')
const ENTRY = path.join(__dirname, 'fixtures', 'env-flags-entry.js')
const SCRUBBED = /^(NODE_ENV|REACT_APP_.*|PUBLIC_PATH|OUTPUT_DIR)$/

function scrubEnv () {
    for (const key of Object.keys(process.env)) if (SCRUBBED.test(key)) delete process.env[key]
}

const CASES = [
    {
        name: 'library-production',
        script: 'npm run build-lib / watch-lib: webpack --mode production --config webpack.library.config.mjs',
        config: 'webpack.library.config.mjs',
        mode: 'production',
        env: {},
        kind: 'library',
    },
    {
        name: 'library-development',
        script: 'webpack --mode development --config webpack.library.config.mjs (no npm script; a dev build of the lib)',
        config: 'webpack.library.config.mjs',
        mode: 'development',
        env: {},
        kind: 'library',
    },
    {
        name: 'demo-development',
        script: 'npm start: webpack serve --mode development --config webpack.demo.config.mjs (compiled, not served)',
        config: 'webpack.demo.config.mjs',
        mode: 'development',
        cliEnv: { WEBPACK_SERVE: true },
        env: {},
        kind: 'demo',
    },
    {
        name: 'demo-production',
        script: 'npm run build: webpack --mode production --config webpack.demo.config.mjs',
        config: 'webpack.demo.config.mjs',
        mode: 'production',
        cliEnv: { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true },
        env: {},
        kind: 'demo',
    },
    {
        name: 'demo-e2e',
        script: 'playwright.config.js webServer: same build with PUBLIC_PATH=/ REACT_APP_BASE_NAME=/ OUTPUT_DIR=build-e2e',
        config: 'webpack.demo.config.mjs',
        mode: 'production',
        cliEnv: { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true },
        env: { PUBLIC_PATH: '/', REACT_APP_BASE_NAME: '/', OUTPUT_DIR: 'build-e2e' },
        kind: 'demo',
    },
]

/**
 * The values that are CORRECT for each case -- what ships, per the decisions recorded in docs/UPGRADE-PLAN.md:
 * the library's environment is frozen to production on purpose (webpack.library.config.mjs) and a name-only
 * Image loads from the web root there; the demo follows its build mode, and its homepage is its publicPath.
 */
function expectations (testCase) {
    const is = (key, value) => [`${key} === ${JSON.stringify(value)}`, probe => probe[key] === value]
    const checks = [['FILE.PATH_IMAGES has no "undefined"', probe => !String(probe.PATH_IMAGES).includes('undefined')]]
    if (testCase.kind === 'library') {
        checks.push(is('NODE_ENV', 'production'), is('__PROD__', true), is('__DEV__', false), is('PATH_IMAGES', '/static/images/'))
    }
    if (testCase.kind === 'demo' && testCase.mode === 'development') {
        checks.push(is('NODE_ENV', 'development'), is('__DEV__', true), is('__PROD__', false), is('PATH_IMAGES', '/static/images/'))
    }
    if (testCase.name === 'demo-production') {
        checks.push(is('NODE_ENV', 'production'), is('__PROD__', true), is('HOMEPAGE', '/ui-render'),
            is('PATH_IMAGES', '/ui-render/static/images/'), is('ROUTE_BASE', '/ui-render/'))
    }
    if (testCase.name === 'demo-e2e') {
        checks.push(is('NODE_ENV', 'production'), is('__PROD__', true), is('HOMEPAGE', ''),
            is('PATH_IMAGES', '/static/images/'), is('ROUTE_BASE', '/'))
    }
    return checks
}

async function loadConfig (testCase, webpack) {
    const module = await import(pathToFileURL(path.join(ROOT, testCase.config)).href)
    const exported = module.default
    const config = typeof exported === 'function'
        ? exported(testCase.cliEnv || {}, { mode: testCase.mode, env: testCase.cliEnv || {} })
        : { ...exported }
    // `--mode` on the CLI overrides the object's own `mode`, exactly as webpack-cli applies it.
    config.mode = testCase.mode
    return config
}

function isInlineRepoPlugin (plugin) {
    return plugin && plugin.constructor === Object && typeof plugin.apply === 'function'
}

function preparePlugins (testCase, config, classes) {
    const kept = config.plugins.filter(plugin => !(plugin instanceof classes.CopyPlugin) && !isInlineRepoPlugin(plugin))
    const dropped = config.plugins.length - kept.length
    const has = Class => kept.some(plugin => plugin instanceof Class)
    const required = testCase.kind === 'library'
        ? [['DefinePlugin', classes.DefinePlugin], ['ProvidePlugin', classes.ProvidePlugin], ['MiniCssExtractPlugin', classes.MiniCssExtractPlugin]]
        : [['Dotenv', classes.Dotenv], ...(testCase.mode === 'production' ? [['MiniCssExtractPlugin', classes.MiniCssExtractPlugin]] : [])]
    for (const [name, Class] of required) {
        if (!has(Class)) throw new Error(`${testCase.config} (${testCase.mode}) no longer carries ${name}; the harness is stale`)
    }
    const expectedDrops = testCase.kind === 'library' ? 2 : 1
    if (dropped !== expectedDrops) {
        throw new Error(`${testCase.name}: expected to drop ${expectedDrops} repo-touching plugin(s), dropped ${dropped}`)
    }
    return kept
}

function compile (webpack, config) {
    return new Promise((resolve, reject) => {
        const compiler = webpack(config)
        compiler.run((error, stats) => {
            compiler.close(closeError => {
                if (error || closeError) return reject(error || closeError)
                if (stats.hasErrors()) return reject(new Error(stats.toString({ all: false, errors: true })))
                resolve(stats)
            })
        })
    })
}

/** A browser-shaped realm: window/document/location stubs, and deliberately NO `process`. */
function browserRealm () {
    const location = {
        href: 'http://localhost/', origin: 'http://localhost', protocol: 'http:', host: 'localhost',
        hostname: 'localhost', port: '', pathname: '/', search: '', hash: '',
    }
    const element = () => ({
        style: {}, setAttribute () {}, getAttribute () { return null }, appendChild () {}, removeChild () {},
        addEventListener () {}, removeEventListener () {},
    })
    const document = {
        location, readyState: 'complete', currentScript: null,
        head: element(), body: element(), documentElement: element(),
        createElement: element, createTextNode: () => ({}),
        getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [],
        addEventListener () {}, removeEventListener () {},
    }
    const sandbox = {
        document, location, navigator: { userAgent: 'test-env-flags' }, console,
        setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
        addEventListener () {}, removeEventListener () {},
        // The library is UMD with react/react-dom/moment external. With no module/exports/define in the realm
        // the wrapper reads them from `root[...]`, so they are provided there, as a browser global would be.
        react: require('react'), 'react-dom': require('react-dom'), moment: require('moment'),
    }
    const context = vm.createContext(sandbox)
    vm.runInContext('window = globalThis; self = globalThis', context)
    return context
}

function evaluate (outputPath, stats) {
    const json = stats.toJson({ all: false, entrypoints: true })
    const assets = json.entrypoints.main.assets.map(asset => asset.name).filter(name => name.endsWith('.js'))
    if (assets.length === 0) throw new Error('the main entrypoint emitted no JavaScript')
    const realm = browserRealm()
    const processBefore = vm.runInContext('typeof process', realm)
    for (const name of assets) {
        vm.runInContext(fs.readFileSync(path.join(outputPath, name), 'utf8'), realm, { filename: name })
    }
    const processAfter = vm.runInContext('typeof process', realm)
    const probe = vm.runInContext('globalThis.__probe', realm)
    if (!probe) throw new Error(`the bundle ran but did not publish globalThis.__probe (loaded: ${assets.join(', ')})`)
    return { probe: { ...probe }, assets, processBefore, processAfter }
}

async function main () {
    scrubEnv()
    process.chdir(ROOT) // the configs resolve `./src/...`, `.env.*` and templates against the cwd
    const only = process.argv.slice(2)
    const unknown = only.filter(name => !CASES.some(testCase => testCase.name === name))
    if (unknown.length) throw new Error(`unknown case(s): ${unknown.join(', ')}; known: ${CASES.map(c => c.name).join(', ')}`)
    const selected = only.length ? CASES.filter(testCase => only.includes(testCase.name)) : CASES

    const webpack = require('webpack')
    const classes = {
        DefinePlugin: webpack.DefinePlugin,
        ProvidePlugin: webpack.ProvidePlugin,
        CopyPlugin: require('copy-webpack-plugin'),
        MiniCssExtractPlugin: require('mini-css-extract-plugin'),
        Dotenv: require('dotenv-webpack'),
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'eis-ui-render-env-flags-'))
    const failures = []
    try {
        for (const testCase of selected) {
            scrubEnv()
            Object.assign(process.env, testCase.env)
            let result
            try {
                const config = await loadConfig(testCase, webpack)
                const outputPath = path.join(workspace, testCase.name)
                config.entry = ENTRY
                config.output = { ...config.output, path: outputPath }
                config.plugins = preparePlugins(testCase, config, classes)
                config.infrastructureLogging = { level: 'error' }
                const stats = await compile(webpack, config)
                const conflicting = stats.compilation.warnings.filter(w => /Conflicting values/.test(String(w.message)))
                result = { ...evaluate(outputPath, stats), conflictingDefines: conflicting.length }
            } finally {
                scrubEnv()
            }

            const checks = [
                ['realm has no process global (before and after load)', () => result.processBefore === 'undefined' && result.processAfter === 'undefined'],
                ...expectations(testCase),
            ]
            console.log(`\n=== ${testCase.name} -- ${testCase.script}`)
            console.log(`    loaded ${result.assets.join(', ')}; DefinePlugin "Conflicting values" warnings: ${result.conflictingDefines}`)
            for (const key of ['NODE_ENV', '__PROD__', '__DEV__', '__TEST__', 'HOMEPAGE', 'PATH_IMAGES', 'ROUTE_BASE', 'ENV', 'bundleTypeofProcess']) {
                console.log(`    ${key.padEnd(20)} ${JSON.stringify(result.probe[key])}`)
            }
            for (const [label, check] of checks) {
                const ok = check(result.probe)
                console.log(`    ${ok ? 'PASS' : 'FAIL'}  ${label}`)
                if (!ok) failures.push(`${testCase.name}: ${label} (got ${JSON.stringify(result.probe)})`)
            }
        }
    } finally {
        fs.rmSync(workspace, { recursive: true, force: true })
    }

    if (failures.length) {
        console.log(`\n${failures.length} env-flag assertion(s) FAILED:`)
        for (const failure of failures) console.log(`  - ${failure}`)
        process.exitCode = 1
    } else {
        console.log(`\nall env-flag assertions passed for ${selected.map(c => c.name).join(', ')}`)
    }
}

main().catch(error => {
    console.error(error && error.stack ? error.stack : error)
    process.exitCode = 2
})
