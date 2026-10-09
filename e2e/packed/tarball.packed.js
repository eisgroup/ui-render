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

    const widget = page.locator('#host > .ui-render')
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

/**
 * THE LONG SELECT, against what 0.34.3 did (scripts/fixtures/packed-meta.js, `listMeta`), in a container scaled
 * to 0.8 (scripts/test-packed-browser.js), which is where a list that scrolls by viewport pixels goes wrong. It
 * opens with its selection in view, keeps the keyboard cursor in view, chooses the highlighted option when Tab
 * leaves it and closes, and its options are legible on its `inverted` background.
 */
test('the long select keeps its selection and cursor in view, Tab chooses and closes, and it is legible', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
    await page.goto(PAGE)

    const document = page.locator('#list > .ui-render')
    const control = document.getByRole('combobox')
    const list = document.getByRole('listbox')
    // Whether the element fills a whole row of the list's visible window, measured from both boxes.
    const inView = option => option.evaluate(element => {
        const menu = element.closest('[role="listbox"]').getBoundingClientRect()
        const box = element.getBoundingClientRect()
        return box.top >= menu.top - 1 && box.bottom <= menu.bottom + 1
    })

    await control.click()
    await expect(control).toHaveAttribute('aria-expanded', 'true')
    const selected = list.locator('[role="option"][aria-selected="true"]')
    await expect(selected).toHaveText('Option 30')
    expect(await inView(selected), 'the selection opens in view').toBe(true)

    for (let i = 0; i < 6; i += 1) await control.press('ArrowDown')
    const cursor = page.locator(`#${await control.getAttribute('aria-activedescendant')}`)
    await expect(cursor).toHaveText('Option 36')
    expect(await inView(cursor), 'the cursor stays in view').toBe(true)

    // Legible: the option's label against the list's background, by the WCAG contrast ratio. An option that lost
    // the theme's `.text` colour was near-black on the inverted dark grey, about 1.6:1.
    const contrast = await cursor.locator('.text').evaluate(element => {
        const channels = colour => colour.match(/[\d.]+/g).slice(0, 3).map(Number)
        const luminance = colour => {
            const [r, g, b] = channels(colour).map(value => {
                const c = value / 255
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
            })
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        const text = luminance(getComputedStyle(element).color)
        const background = luminance(getComputedStyle(element.closest('[role="listbox"]')).backgroundColor)
        return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05)
    })
    expect(contrast, 'the option label is legible on the list').toBeGreaterThan(4.5)

    await control.press('Tab')
    await expect(document.locator('input[name="after"]')).toBeFocused()
    await expect(control).toHaveAttribute('aria-expanded', 'false')
    await expect(control).toHaveText('Option 36')
    expect(errors).toEqual([])
})
