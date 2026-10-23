/**
 * THE SCROLLBARS INSIDE THE WIDGET — how thick the stylesheet draws them, and that a host's rule can change that.
 * =============================================================================================
 *
 * `scrollbar.less` styles the bars of everything that scrolls inside `.ui-render` through `::-webkit-scrollbar`,
 * which Chromium and WebKit read and Firefox does not. jsdom draws no scrollbar, so only a browser can measure one.
 *
 * Playwright launches Chromium with `--hide-scrollbars`, which hides a styled bar too: a container whose bars a
 * rule made 8 px thick measured 0. This file launches it without that flag.
 */
const { test, expect, drawsWebkitScrollbars } = require('./fixtures')
const { SCROLLBAR } = require('./reference')

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

// A table wider than the page scrolls sideways in the container around it, and a block with a height of its own
// scrolls down. The demo page renders the data and meta files it is given.
const COLUMNS = Array.from({ length: 30 }, (_, index) => `column${index}`)
const data = { rows: [Object.fromEntries(COLUMNS.map(id => [id, `A value in ${id}`]))] }
const meta = {
    view: 'Col',
    items: [
        { view: 'Table', name: 'rows', headers: COLUMNS.map(id => ({ id, label: `The header of ${id}` })) },
        {
            view: 'Col',
            className: 'scrolls-down',
            style: { height: 100, overflow: 'auto' },
            items: Array.from({ length: 20 }, (_, index) => ({ view: 'Text', label: `Line ${index}` })),
        },
    ],
}

const upload = (page, kind, json) => page.locator(`.test-${kind} input[type="file"]`)
    .setInputFiles({ name: `${kind}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(json)) })

/** How thick an element's bars are: what its box takes beyond its client area, less its borders. 0 for no bar. */
const barsOf = locator => locator.evaluate((element) => {
    const style = getComputedStyle(element)
    const px = property => parseFloat(style[property])
    return {
        vertical: element.offsetWidth - element.clientWidth - px('borderLeftWidth') - px('borderRightWidth'),
        horizontal: element.offsetHeight - element.clientHeight - px('borderTopWidth') - px('borderBottomWidth'),
    }
})

/** The bars a user meets: under the table, and beside the block. */
const renderAndMeasure = async (page) => {
    await upload(page, 'data', data)
    await upload(page, 'meta', meta)
    await expect(page.getByRole('columnheader', { name: `The header of ${COLUMNS[0]}`, exact: true })).toBeVisible()
    return {
        underTheTable: (await barsOf(page.locator('.ui-render .overflow-scroll:has(> div > table)'))).horizontal,
        besideTheBlock: (await barsOf(page.locator('.ui-render .scrolls-down'))).vertical,
    }
}

test.describe('scrollbars inside the widget', () => {
    test.skip(({ browserName }) => !drawsWebkitScrollbars(browserName),
        'Firefox does not read ::-webkit-scrollbar: see drawsWebkitScrollbars in e2e/fixtures.js')

    test(`[I] a table that scrolls sideways and a block that scrolls down have ${SCROLLBAR.THICKNESS_PX} px bars`, async ({ page, pageErrors }) => {
        await page.goto('/demo')

        expect(await renderAndMeasure(page)).toEqual({ underTheTable: SCROLLBAR.THICKNESS_PX, besideTheBlock: SCROLLBAR.THICKNESS_PX })
        expect(pageErrors).toEqual([])
    })

    test('[I] a host\'s rule after the stylesheet sets their thickness without `!important`', async ({ page }) => {
        await page.goto('/demo')
        await page.addStyleTag({ content: `.ui-render ::-webkit-scrollbar { width: ${SCROLLBAR.HOST_THICKNESS_PX}px; height: ${SCROLLBAR.HOST_THICKNESS_PX}px; }` })

        expect(await renderAndMeasure(page)).toEqual({ underTheTable: SCROLLBAR.HOST_THICKNESS_PX, besideTheBlock: SCROLLBAR.HOST_THICKNESS_PX })
    })
})
