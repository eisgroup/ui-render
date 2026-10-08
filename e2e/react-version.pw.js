/**
 * THE PAGE RENDERS WITH THE REACT THIS RUN NAMES.
 * =============================================================================================
 *
 * The browser suite runs on the installed React 18 (playwright.config.js) and on the React 19 fixture
 * (playwright.react19.config.js, which sets `REACT_FIXTURE`). An alias that stopped applying would build
 * the second run on 18 and report it green, so each run checks the React the page renders with, as the
 * per-React jest legs check theirs (scripts/fixtures/react-legacy/harness.js).
 *
 * How it reads the version without touching the demo: react-dom announces itself, in production builds
 * too, to a `__REACT_DEVTOOLS_GLOBAL_HOOK__` it finds on the page, passing its version. The hook below only
 * records that. React calls the hook's other methods from inside a try/catch, and they do nothing here.
 */
const { test, expect } = require('./fixtures')
const floors = require('../scripts/fixtures/react-legacy/floors')

const fixture = process.env.REACT_FIXTURE
const expected = fixture ? floors[fixture].react : require('react/package.json').version

test(`[I] the page renders with React ${expected}`, async ({ page }) => {
    await page.addInitScript(() => {
        window.__reactVersions = []
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            supportsFiber: true,
            renderers: new Map(),
            inject (renderer) {
                window.__reactVersions.push(renderer.version)
                return window.__reactVersions.length
            },
            checkDCE () {},
            onScheduleFiberRoot () {},
            onCommitFiberRoot () {},
            onCommitFiberUnmount () {},
            onPostCommitFiberRoot () {},
        }
    })
    await page.goto('/examples')
    await expect(page.locator('#ui-render')).not.toBeEmpty()
    expect(await page.evaluate(() => window.__reactVersions)).toEqual([expected])
})
