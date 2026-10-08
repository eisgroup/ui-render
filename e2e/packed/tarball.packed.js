/**
 * THE PUBLISHED PACKAGE IN A BROWSER. Run by scripts/test-packed-browser.js (`npm run test:pack:browser`),
 * which builds the page from the packed tarball: the published bundle, bundled by a host with its own React,
 * and the published `static/all.css`. See playwright.packed.config.js.
 *
 * What only this can see. The server smoke renders the bundle to a string, so it never runs an effect, a
 * handler or a stylesheet; the browser suite runs the demo, which mounts `src/`. Here the shipped files have
 * to render, respond and be styled, and the stylesheet has to leave the host page alone: §9.9-H8's rule that it
 * touches only its own wrapper, checked on the artifact rather than on the build pipeline.
 */
const { test, expect } = require('@playwright/test')

const PAGE = process.env.PACKED_PAGE
const EXPECT_REACT = process.env.PACKED_EXPECT_REACT

test('the published bundle and stylesheet render, respond and stay inside their wrapper', async ({ page }) => {
    expect(PAGE, 'run through `npm run test:pack:browser`, which builds the page').toBeTruthy()

    const errors = []
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
    page.on('console', message => {
        if (message.type() === 'error') errors.push(`console: ${message.text()}`)
    })
    // react-dom reports its version to a DevTools hook it finds, in production builds too; this one records it.
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
    await page.goto(PAGE)

    const widget = page.locator('.ui-render')
    await expect(widget.getByText('packed tarball smoke')).toBeVisible()
    expect(await page.evaluate(() => window.__reactVersions), 'the host React rendered it').toEqual([EXPECT_REACT])

    // Styled inside the wrapper, and nothing outside it: the host's own `.padding` element and its body.
    const paddingOf = locator => locator.evaluate(element => getComputedStyle(element).paddingTop)
    expect(await paddingOf(widget.locator('.padding').first())).not.toBe('0px')
    expect(await paddingOf(page.locator('#outside'))).toBe('0px')
    expect(await page.evaluate(() => getComputedStyle(document.body).marginTop)).toBe('8px')

    // It responds: the form-bound input takes typing, the checkbox toggles, the dropdown opens. The checkbox is
    // the presentational `Checkbox`, which reads no form value (docs/SUPPORTED-VIEWS.md), so it starts unticked
    // whatever `flag` holds in the data.
    const amount = widget.locator('input[name="rows.0.amount"]')
    await amount.fill('7')
    await expect(amount).toHaveValue('7')
    const flag = widget.getByLabel('A flag')
    await expect(flag).not.toBeChecked()
    await flag.click()
    await expect(flag).toBeChecked()
    const group = widget.getByRole('combobox')
    await group.click()
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await expect(widget.getByRole('option')).not.toHaveCount(0)

    await expect(widget.getByText('first row')).toBeVisible()
    expect(errors).toEqual([])
})
