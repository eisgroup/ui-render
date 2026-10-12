/**
 * WHAT THE PUBLISHED PACKAGE'S DOCUMENTS COST IN A BROWSER. scripts/test-packed-perf.js runs this config against a page
 * it builds from the packed tarball (`npm run test:perf`), and passes the page in PERF_PAGE and the results file in
 * PERF_OUT. It is not meant to run on its own. Its spec has a suffix of its own, so playwright.config.js, which collects
 * `*.pw.js`, never picks it up. Chromium only: the measure is the DevTools protocol's `Performance.getMetrics`.
 */
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './e2e/perf',
    testMatch: '**/*.perf.js',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    forbidOnly: !!process.env.CI,
    outputDir: 'test-results-perf',
    reporter: [['list']],
    timeout: 180_000,
    expect: { timeout: 10_000 },
    use: {
        actionTimeout: 15_000,
        viewport: { width: 1280, height: 900 },
        trace: 'off',
        screenshot: 'only-on-failure',
        video: 'off',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    ],
})
