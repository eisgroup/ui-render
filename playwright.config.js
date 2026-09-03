/**
 * PLAYWRIGHT — the browser leg of the contract suite (docs/UPGRADE-PLAN.md §9.5, §9.7-F1 step 2).
 * =============================================================================================
 *
 * WHY THIS EXISTS. The jest suites cannot express a single positional fact: every
 * `getBoundingClientRect()` in jsdom is 0x0, so "the bubble lands next to its trigger", "it flips
 * at a viewport edge", "it is not clipped", "it paints", "it stacks above its neighbour" are all
 * vacuous there. §9.5 enumerates ten such gaps and §9.7-F1 step 2 promotes them from debt to a
 * blocker for the tooltip replacement. This leg is what closes them.
 *
 * WHAT IT IS FOR, PRECISELY. It runs BEFORE the `TooltipPop` -> in-house-`Tooltip` swap, so its job
 * is to RECORD what semantic-ui-react's `Popup` does in real Chrome, not to demand that the
 * replacement reproduce it. Every assertion in e2e/ is tagged in `e2e/reference.js`:
 *
 *   R    reference   — current behaviour, captured so the swap has something to be compared against.
 *                     The replacement is EXPECTED to change these; the diff to reference.js is the
 *                     reviewable record of what it changed.
 *   I    invariant   — must hold before and after. Breaking one is a regression.
 *   R->I defect      — currently broken, pinned at its broken value so this suite is green today.
 *                     Part 2 flips it to the invariant, and that flip is the evidence it fixed
 *                     something. Same pattern as `FIXED_PROP_LEAKS` / `NAMELESS_CONTROLS` in jest.
 *
 * A suite that failed wholesale on the planned replacement would be a tripwire on the plan, not a
 * gate. Read `e2e/reference.js` before changing anything here.
 *
 * RUNNING IT.
 *   npm run test:e2e:install   once per machine — downloads Chromium into the Playwright cache.
 *                              Measured: 567 MB on disk, made of a 196 MB headless shell (a 94.7 MiB
 *                              download; this is what a headless run launches), a 368 MB full
 *                              browser that `--headed` / `--ui` debugging needs, and 2.5 MB of
 *                              ffmpeg. Deliberately NOT a postinstall hook: `npm ci` stays exactly
 *                              as fast as it is today for everyone who never runs this leg, and the
 *                              price is one clear Playwright error ("Please run: npx playwright
 *                              install") the first time you forget.
 *   npm run test:e2e           builds the demo and runs the suite headless.
 *   npm run test:e2e -- --ui   interactive.
 *
 * WHY IT SERVES A PRODUCTION BUILD, NOT `npm start`.
 * The corpus tooltip THROWS on every open (see reference.js, CORPUS.PAGE_ERRORS_PER_OPEN). webpack-dev-server
 * turns an unhandled error into `iframe#webpack-dev-server-client-overlay`, which is
 * `position: fixed; inset: 0; z-index: 2147483647` — it covers the app, `elementFromPoint` returns
 * the iframe and every subsequent interaction is intercepted. Disabling that overlay would take a
 * real debugging affordance away from humans to suit a test runner. A production build has no
 * overlay, is closer to what ships, and costs one `webpack --mode production`.
 *
 * The build is root-relative (`PUBLIC_PATH=/`, `REACT_APP_BASE_NAME=/`) and lands in `build-e2e/`
 * so it neither collides with the `/ui-render/`-prefixed GitHub Pages build in `build/` nor needs
 * a base-path-aware `serve` invocation. Both overrides default to today's values when unset, so
 * `npm run build` is byte-for-byte unchanged. `--single` is the SPA fallback that `serve build`
 * lacks — which is why `npm run serve-build` cannot currently serve `/examples` at all.
 */
const { defineConfig, devices } = require('@playwright/test')

const PORT = 3199
const BASE_URL = `http://127.0.0.1:${PORT}`

module.exports = defineConfig({
    testDir: './e2e',
    // The repo root is a jest `roots` entry and jest's default testMatch claims `**/*.spec.js` and
    // `**/*.test.js`, so those names here would be collected by `npx jest` and fail. `*.pw.js` is
    // claimed by neither runner's defaults; `jest.config.js` also ignores `e2e/` outright, so both
    // halves of the fence stand on their own.
    testMatch: '**/*.pw.js',
    // Reference capture, not a load test. Serial keeps the measurements comparable and keeps the
    // one shared static server honest; the whole suite is well under a minute.
    fullyParallel: false,
    workers: 1,
    // A retry would hide exactly the thing this leg is for. Two known flake sources are removed at
    // the fixture level instead (network fonts, animation timing) — see e2e/fixtures.js.
    retries: 0,
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
    timeout: 45_000,
    expect: { timeout: 7_000 },
    use: {
        baseURL: BASE_URL,
        // Fail fast on a missing element rather than burning the whole 45 s test budget on it.
        // Review measured the cost of not doing this: simulating the planned convergence made the
        // leg run for over ten minutes instead of failing in seconds, because every portal-shaped
        // `waitFor` fell back to the test timeout. Step 2's first run is EXPECTED to turn the `[R]`
        // tests red, and against `timeout-minutes: 20` in CI a slow red reads as a hung job.
        actionTimeout: 7_000,
        // Fixed viewport: three assertions are about viewport edges, so the viewport is part of the
        // measurement rather than an ambient setting.
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
            testIgnore: '**/*.touch.pw.js',
        },
        {
            // Emulation, not a device: `hasTouch` is what makes a `tap()` dispatch touch events at
            // all. §9.5 records that on SUIR's `['click', 'hover']` default a single tap fires BOTH
            // paths, and that is the fact this project captures. It is not evidence about iOS
            // Safari — see the "what this leg still cannot see" list in §9.5.
            name: 'chromium-touch',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 800 },
                hasTouch: true,
                isMobile: false,
            },
            testMatch: '**/*.touch.pw.js',
        },
    ],
    webServer: {
        command: `npx webpack --mode production --config webpack.demo.config.mjs`
            + ` && npx serve build-e2e --single --listen ${PORT} --no-clipboard`,
        env: { PUBLIC_PATH: '/', REACT_APP_BASE_NAME: '/', OUTPUT_DIR: 'build-e2e' },
        url: `${BASE_URL}/`,
        reuseExistingServer: !process.env.CI,
        // A cold production build of the demo measured ~16 s locally; a 2-core CI runner is slower.
        timeout: 240_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
})
