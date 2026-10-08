/**
 * THE PUBLISHED PACKAGE IN A BROWSER. scripts/test-packed-browser.js runs this config, against a page it builds
 * from the packed tarball (`npm run test:pack:browser`), and passes the page in PACKED_PAGE. It is not meant to
 * run on its own. Its spec has a suffix of its own, so playwright.config.js, which collects `*.pw.js`, never
 * picks it up.
 */
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './e2e/packed',
    testMatch: '**/*.packed.js',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    forbidOnly: !!process.env.CI,
    outputDir: 'test-results-packed',
    reporter: process.env.CI
        ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-packed' }]]
        : [['list']],
    timeout: 45_000,
    expect: { timeout: 7_000 },
    use: {
        actionTimeout: 7_000,
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    ],
})
