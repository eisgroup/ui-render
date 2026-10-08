/**
 * THE BROWSER SUITE ON REACT 19.3.0, the top of the declared peer range: `npm run test:e2e:react19`.
 * The jest suite has run on 19 since 2026-09-30 (`npm run test:react19`). This is the browser leg's half: the
 * demo is built on the React 19 fixture (`REACT_FIXTURE=react19`, see webpack.demo.config.mjs) and the two
 * Chromium projects of playwright.config.js run against it. `e2e/react-version.pw.js` checks the React the page
 * renders with, as the jest legs' harness does, so an alias that stopped applying fails here instead of
 * running the suite on 18 twice.
 *
 * Its own port, build directory and report folders. Outside CI, playwright.config.js reuses a server it finds
 * on its port, and on the same port this leg would be served the React 18 build.
 */
const base = require('./playwright.config')

process.env.REACT_FIXTURE = 'react19'

const PORT = 3198
const BASE_URL = `http://127.0.0.1:${PORT}`
const OUTPUT_DIR = 'build-e2e-react19'

/** The base command with this leg's directory and port, failing loudly if its shape no longer matches. */
function command (baseCommand) {
    const next = baseCommand
        .replace(/serve build-e2e /, `serve ${OUTPUT_DIR} `)
        .replace(/--listen \d+/, `--listen ${PORT}`)
    if (!next.includes(`serve ${OUTPUT_DIR} `) || !next.includes(`--listen ${PORT}`)) {
        throw new Error(`playwright.react19.config.js could not retarget the webServer command: ${baseCommand}`)
    }
    return next
}

module.exports = {
    ...base,
    outputDir: 'test-results-react19',
    reporter: process.env.CI
        ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-react19' }]]
        : [['list']],
    use: { ...base.use, baseURL: BASE_URL },
    projects: base.projects.filter(({ name }) => name === 'chromium' || name === 'chromium-touch'),
    webServer: {
        ...base.webServer,
        command: command(base.webServer.command),
        env: { ...base.webServer.env, OUTPUT_DIR, REACT_FIXTURE: 'react19' },
        url: `${BASE_URL}/`,
    },
}
