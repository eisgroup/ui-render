/**
 * THE VIEWS A USER ACTS ON THAT NO OTHER SPEC DRIVES — date input, popup, slider, toggle, checkbox,
 * dropdown by pointer, table sorting and pages, progress steps. Added 2026-10-06 with the view map,
 * `e2e/view-coverage.js`.
 * =============================================================================================
 *
 * Before this file the browser leg drove the tooltip, the dropdown's keyboard, tabs, one Expand
 * and the upload zone. Every other view a user acts on was covered by jsdom alone, and by the
 * manual checklist of docs/UPGRADE-PLAN.md §5, which a person ran in Chrome once per React
 * upgrade. These tests run that checklist on every PR, and each asserts something jsdom cannot:
 * where a thing lands, what paints on top of what, what a real pointer hits, what the cascade
 * draws on focus.
 *
 * The values live in e2e/reference.js and carry its tags. This file found two defects and pinned
 * them `[R->I]`: what the popup offered a keyboard and a screen reader, and a checkbox id two
 * instances shared. Both were fixed on 2026-10-06, and their tests flipped to `[I]`. A third, a
 * calendar above the popup only by the grace of the shell's animation, was fixed the same day.
 */
const { test, expect, rectOf, isWithin, topmostAt, activeElement } = require('./fixtures')
const { DATE_INPUT, POPUP, SLIDER, TOGGLE, CHECKBOX, POINTER_DROPDOWN, TABLE, PROGRESS_STEPS } = require('./reference')

const openExample = async (page, id) => {
    await page.goto(`/examples#${id}`)
    await page.locator(`#${id}.expanded`).waitFor()
}

const centre = rect => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/** The layout viewport, scrollbars excluded: what `position: fixed; inset: 0` fills. */
const viewportRect = page => page.evaluate(() => ({
    top: 0, left: 0, right: document.documentElement.clientWidth, bottom: document.documentElement.clientHeight,
}))

/** Whether the element a pointer would hit at the centre of `locator` lies inside `selector`. */
const hitsOwnCentre = async (page, locator, selector) => {
    const { x, y } = centre(await rectOf(locator))
    return page.evaluate(([px, py, sel]) => {
        const element = document.elementFromPoint(px, py)
        return Boolean(element && element.closest(sel))
    }, [x, y, selector])
}

test.describe('date input: the calendar overlay', () => {
    // `tableForm` is the one example with `type: 'date'`, the field the §5 checklist exercised.
    const field = page => page.locator('#tableForm input[name="dataKind.period[0].startDate"]')
    const calendar = page => page.locator('.ui-render-picker-dropdown:not(.ui-render-picker-dropdown-hidden)')

    const openCalendar = async (page, block) => {
        await openExample(page, 'tableForm')
        await field(page).evaluate((element, where) => element.scrollIntoView({ block: where }), block)
        await field(page).click()
        await expect(calendar(page)).toBeVisible()
    }

    test('[I] a click opens the calendar under the input, inside the viewport, and it paints', async ({ page, pageErrors }) => {
        await openCalendar(page, 'center')

        const input = await rectOf(field(page))
        const overlay = await rectOf(calendar(page))
        await expect(calendar(page)).toHaveClass(DATE_INPUT.PLACEMENT_CLASS.roomBelow)
        expect(overlay.top - input.bottom, 'directly below the input').toBeGreaterThanOrEqual(0)
        expect(overlay.top - input.bottom).toBeLessThanOrEqual(DATE_INPUT.MAX_GAP_PX)
        expect(Math.abs(overlay.left - input.left), 'left edges aligned').toBeLessThanOrEqual(1)
        expect(isWithin(overlay, await viewportRect(page))).toBe(true)

        // Mounted in `<body>`, outside `.ui-render`, and styled anyway: postcss.config.js exempts the
        // `.ui-render-*` rules from the scoping wrapper for exactly this portal.
        expect(await calendar(page).evaluate(element => element.closest('.ui-render') !== null)).toBe(DATE_INPUT.INSIDE_UI_RENDER)
        const panel = calendar(page).locator('.ui-render-picker-panel')
        expect(await panel.evaluate((element) => {
            const style = getComputedStyle(element)
            return { backgroundColor: style.backgroundColor, borderTopWidth: style.borderTopWidth }
        })).toEqual(DATE_INPUT.PANEL_PAINT)
        expect(await hitsOwnCentre(page, panel, '.ui-render-picker-panel'), 'nothing paints over it').toBe(true)
        expect(pageErrors).toEqual([])
    })

    test('[I] with no room below the input it opens above, still inside the viewport', async ({ page }) => {
        await openCalendar(page, 'end')

        const input = await rectOf(field(page))
        const overlay = await rectOf(calendar(page))
        await expect(calendar(page)).toHaveClass(DATE_INPUT.PLACEMENT_CLASS.noRoomBelow)
        expect(input.top - overlay.bottom, 'directly above the input').toBeGreaterThanOrEqual(0)
        expect(input.top - overlay.bottom).toBeLessThanOrEqual(DATE_INPUT.MAX_GAP_PX)
        expect(isWithin(overlay, await viewportRect(page))).toBe(true)
    })

    test('[I] a click on a day writes it in the display format and closes the calendar', async ({ page }) => {
        await openCalendar(page, 'center')
        await expect(field(page)).toHaveValue(DATE_INPUT.INITIAL_VALUE)

        await calendar(page).locator(`td[title="${DATE_INPUT.PICKED_DAY}"]`).click()

        await expect(field(page)).toHaveValue(DATE_INPUT.PICKED_VALUE)
        await expect(calendar(page)).toBeHidden()
    })

    test('[I] a click outside closes the calendar and leaves the value alone', async ({ page }) => {
        await openCalendar(page, 'center')

        await page.locator('#tableForm thead th').first().click()

        await expect(calendar(page)).toBeHidden()
        await expect(field(page)).toHaveValue(DATE_INPUT.INITIAL_VALUE)
    })
})

test.describe('popup: the modal a `popupOpen` action opens', () => {
    const trigger = page => page.locator('#popupContent').getByRole('button', { name: 'Open Popup 1' })
    const popup = page => page.locator('.app__popup')

    const open = async (page) => {
        await openExample(page, 'popupContent')
        await trigger(page).click()
        await expect(popup(page)).toBeVisible()
    }

    test('[I] the backdrop covers the viewport, and the box paints above it', async ({ page }) => {
        await open(page)
        const viewport = await viewportRect(page)

        expect(await rectOf(page.locator('.app__popup__backdrop'))).toMatchObject(viewport)
        expect((await topmostAt(page, 2, viewport.bottom - 2)).className, 'a corner is the backdrop').toContain('app__popup__backdrop')
        const box = page.locator('.app__popup__box')
        expect(isWithin(await rectOf(box), viewport)).toBe(true)
        expect(await hitsOwnCentre(page, box, '.app__popup__box'), 'the box is on top of it').toBe(true)
    })

    test('[I] a click on the backdrop closes it, and so does Ok', async ({ page }) => {
        await open(page)
        await page.mouse.click(2, 2)
        await expect(popup(page)).toHaveCount(0)

        await trigger(page).click()
        await popup(page).getByRole('button', { name: 'Ok' }).click()
        await expect(popup(page)).toHaveCount(0)
    })

    test('[I] the keyboard: a dialog that takes focus and keeps it, Escape closes it, and focus goes back to the trigger', async ({ page }) => {
        await openExample(page, 'popupContent')
        await trigger(page).focus()
        await page.keyboard.press('Enter')
        await expect(popup(page)).toBeVisible()

        const focusInside = () => page.evaluate(() => Boolean(document.activeElement && document.activeElement.closest('.app__popup [role="dialog"]')))
        await expect(page.getByRole('dialog')).toHaveCount(POPUP.DIALOG_ROLE_COUNT)
        await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
        await expect(page.getByRole('dialog')).toHaveAccessibleName(POPUP.ACCESSIBLE_NAME)
        expect(await focusInside(), 'opening moves focus into it').toBe(POPUP.FOCUS_MOVES_IN)

        // Round the dialog and past its ends, both ways: every stop is inside it.
        const controls = await page.getByRole('dialog').locator('input, button, [tabindex="0"]').count()
        for (const key of ['Tab', 'Shift+Tab']) {
            for (let press = 0; press < controls + 2; press += 1) {
                await page.keyboard.press(key)
                expect(await focusInside(), `${key} #${press + 1} stays inside it`).toBe(POPUP.TAB_STAYS_IN)
            }
        }

        await page.keyboard.press('Escape')
        await expect(popup(page)).toHaveCount(POPUP.ESCAPE_CLOSES ? 0 : 1)
        expect(await activeElement(page), 'closing gives focus back to the trigger').toMatchObject({ tag: 'button', text: 'Open Popup 1' })
    })

    test('[I] a date field inside it opens its calendar above it, where a click picks a day', async ({ page }) => {
        await open(page)
        const field = popup(page).locator(`input[name="${POPUP.DATE_FIELD}"]`)
        const calendar = page.locator('.ui-render-picker-dropdown:not(.ui-render-picker-dropdown-hidden)')
        await field.click()
        await expect(calendar).toBeVisible()

        const panel = calendar.locator('.ui-render-picker-panel')
        expect(await hitsOwnCentre(page, panel, '.ui-render-picker-panel'), 'the calendar paints above the dialog').toBe(POPUP.CALENDAR_ABOVE)
        // And on its own z-index, not on the shell's: while `.app`'s fade-in is in effect the shell is a
        // stacking context, which the popup's z-index cannot reach out of.
        await page.evaluate(() => { for (const shell of document.querySelectorAll('.app')) shell.style.animation = 'none' })
        expect(await hitsOwnCentre(page, panel, '.ui-render-picker-panel'), 'also with no stacking context around the popup').toBe(POPUP.CALENDAR_ABOVE)

        await calendar.locator('td.ui-render-picker-cell-in-view').first().click()
        await expect(calendar).toBeHidden()
        await expect(field).not.toHaveValue('')
        await expect(popup(page), 'the click stayed with the calendar').toBeVisible()
    })
})

test.describe('slider: a real pointer on the real track', () => {
    // The first slider of the example: 0 to 100, step 1.
    const handle = page => page.locator('#slider [role="slider"]').first()
    const rail = page => page.locator('#slider .app__slider__rail').first()

    /** Where the handle's centre should be for `value`, on the rail's own box. */
    const xOf = (box, value) => box.left + box.width * (value - SLIDER.MIN) / (SLIDER.MAX - SLIDER.MIN)
    /** The handle eases to a new value (`transition: left 100ms`), so its position is polled. */
    const expectHandleAt = (page, x) => expect.poll(async () => Math.abs(centre(await rectOf(handle(page))).x - x))
        .toBeLessThanOrEqual(SLIDER.HANDLE_OFF_POSITION_MAX_PX)

    test('[I] dragging the handle carries it with the pointer, and the value is the position', async ({ page }) => {
        await openExample(page, 'slider')
        await handle(page).scrollIntoViewIfNeeded()
        const box = await rectOf(rail(page))
        const start = centre(await rectOf(handle(page)))
        const target = box.left + box.width * SLIDER.DRAG_TO_FRACTION

        await page.mouse.move(start.x, start.y)
        await page.mouse.down()
        await page.mouse.move(target, start.y, { steps: 8 })
        await page.mouse.up()

        await expect(handle(page)).toHaveAttribute('aria-valuenow', String(SLIDER.DRAGGED_VALUE))
        await expectHandleAt(page, target)
    })

    test('[I] the keys step the value, and the handle moves by that share of the track', async ({ page }) => {
        await openExample(page, 'slider')
        await handle(page).scrollIntoViewIfNeeded()
        const box = await rectOf(rail(page))
        const value = Number(await handle(page).getAttribute('aria-valuenow'))
        await handle(page).focus()

        await page.keyboard.press('ArrowRight')
        await expect(handle(page)).toHaveAttribute('aria-valuenow', String(value + SLIDER.STEP))
        await expectHandleAt(page, xOf(box, value + SLIDER.STEP))

        await page.keyboard.press('End')
        await expect(handle(page)).toHaveAttribute('aria-valuenow', String(SLIDER.MAX))
        await expectHandleAt(page, box.right)

        await page.keyboard.press('Home')
        await expect(handle(page)).toHaveAttribute('aria-valuenow', String(SLIDER.MIN))
        await expectHandleAt(page, box.left)
    })
})

test.describe('toggle: the switch a user sees is the label of a checkbox kept off-screen', () => {
    const input = page => page.locator('#inputToggle input.checkbox.toggle').first()
    const label = page => input(page).locator('xpath=following-sibling::label[1]')
    const paintOfSwitch = locator => locator.evaluate((element) => {
        const style = getComputedStyle(element)
        return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow }
    })

    test('[I] a click on the switch flips it and repaints it, and keyboard focus draws its ring', async ({ page }) => {
        await openExample(page, 'inputToggle')
        // The checkbox is far off-screen, so the label is all a pointer can reach.
        expect((await rectOf(input(page))).right).toBeLessThan(0)
        await expect(input(page)).toBeChecked()
        await page.mouse.move(0, 0)
        expect((await paintOfSwitch(label(page))).backgroundColor).toBe(TOGGLE.BACKGROUND.checked)

        await label(page).click()
        await expect(input(page)).not.toBeChecked()
        await input(page).blur()
        await page.mouse.move(0, 0)
        expect(await paintOfSwitch(label(page))).toEqual({ backgroundColor: TOGGLE.BACKGROUND.unchecked, boxShadow: 'none' })

        await input(page).focus()
        expect((await paintOfSwitch(label(page))).boxShadow, 'focus on the hidden input rings the switch').not.toBe('none')
        await page.keyboard.press('Space')
        await expect(input(page)).toBeChecked()
    })
})

test.describe('checkbox: a native control and its label', () => {
    const rowsExpanded = (page, root) => Promise.all(CHECKBOX.ROW_TITLES.map(title => page.locator(root)
        .getByRole('button', { name: title, exact: true }).first().getAttribute('aria-expanded')))

    test('[I] the Expand All checkbox in a table header opens every row, and closes them again', async ({ page }) => {
        await openExample(page, 'tableNested')
        const label = page.locator('#tableNested label', { hasText: CHECKBOX.LABEL })
        expect(await rowsExpanded(page, '#tableNested')).toEqual(['false', 'false'])

        await label.click()
        await expect.poll(() => rowsExpanded(page, '#tableNested')).toEqual(['true', 'true'])
        await label.click()
        await expect.poll(() => rowsExpanded(page, '#tableNested')).toEqual(['false', 'false'])
    })

    test('[I] with the same table twice in a document, the label inside the popup checks its own box', async ({ page }) => {
        await openExample(page, 'popupContent')
        await page.locator('#popupContent').getByRole('button', { name: 'Open Popup 1' }).click()
        await expect(page.locator('.app__popup')).toBeVisible()
        const boxes = page.locator(`input[id^="${CHECKBOX.DERIVED_ID}"]`)
        const states = () => boxes.evaluateAll(inputs => inputs.map(input => ({
            id: input.id, inPopup: Boolean(input.closest('.app__popup')), checked: input.checked,
        })))
        await expect.poll(states).toEqual(CHECKBOX.IN_POPUP_DOCUMENT.before)

        await page.locator('.app__popup label', { hasText: CHECKBOX.LABEL }).click()

        await expect.poll(states).toEqual(CHECKBOX.IN_POPUP_DOCUMENT.afterClickInPopup)
        await expect.poll(() => rowsExpanded(page, '.app__popup')).toEqual(['true', 'true'])
        expect(await rowsExpanded(page, '#popupContent')).toEqual(['false', 'false'])
    })
})

test.describe('dropdown: the pointer', () => {
    const control = page => page.locator('#dropdown [role="combobox"]').first()

    test('[I] a click on an option selects it and closes the list; a click outside closes it and keeps the value', async ({ page }) => {
        await openExample(page, 'dropdown')
        await expect(control(page)).toHaveText(POINTER_DROPDOWN.INITIAL)

        await control(page).click()
        await expect(control(page)).toHaveAttribute('aria-expanded', 'true')
        await page.locator('#dropdown [role="option"]', { hasText: POINTER_DROPDOWN.PICKED }).click()
        await expect(control(page)).toHaveAttribute('aria-expanded', 'false')
        await expect(control(page)).toHaveText(POINTER_DROPDOWN.PICKED)

        await control(page).click()
        await expect(control(page)).toHaveAttribute('aria-expanded', 'true')
        await page.locator('#dropdown .json-tree').first().click({ position: { x: 2, y: 2 } })
        await expect(control(page)).toHaveAttribute('aria-expanded', 'false')
        await expect(control(page)).toHaveText(POINTER_DROPDOWN.PICKED)
    })
})

test.describe('table: sorting and pages', () => {
    test('[I] a sortable header cycles descending, ascending, unsorted, and the rows follow', async ({ page }) => {
        await openExample(page, 'all')
        const section = page.locator('#all [role="button"][aria-expanded]', { hasText: TABLE.SORT_SECTION })
        await section.click()
        await expect(section).toHaveAttribute('aria-expanded', 'true')
        const table = section.locator('xpath=..').locator('table').first()
        const header = table.locator('thead th', { hasText: TABLE.SORT_COLUMN })
        const column = await header.evaluate(th => [...th.parentElement.children].indexOf(th))
        const values = () => table.locator('tbody tr').evaluateAll((rows, index) => rows
            .map(row => row.children[index] && row.children[index].textContent.replace(/[^\d.-]/g, ''))
            .filter(text => text !== '' && text !== undefined)
            .map(Number), column)
        const unsorted = await values()

        for (const step of TABLE.SORT_CYCLE) {
            await header.locator('[role="button"]').click()
            await expect(header).toHaveAttribute('aria-sort', step)
            const now = await values()
            if (step === 'ascending') expect(now).toEqual([...unsorted].sort((a, b) => a - b))
            if (step === 'descending') expect(now).toEqual([...unsorted].sort((a, b) => b - a))
            if (step === 'none') expect(now).toEqual(unsorted)
        }
    })

    test('[I] the pager marks the page it is on, and each page holds its own rows', async ({ page }) => {
        await openExample(page, 'tablePagination')
        const pager = page.locator('#tablePagination nav[aria-label="Pagination"]')
        const firstCells = () => page.locator('#tablePagination tbody tr').evaluateAll(rows => rows.map(row => row.children[0].textContent.trim()))

        await pager.getByRole('button', { name: 'Page 3' }).click()
        await expect(pager.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
        expect(await firstCells()).toEqual(TABLE.PAGE_3_ROWS)

        const next = pager.getByRole('button', { name: 'Next page' })
        while (await next.isEnabled()) await next.click()
        await expect(pager.getByRole('button', { name: `Page ${TABLE.PAGE_COUNT}` })).toHaveAttribute('aria-current', 'page')
        expect(await firstCells()).toEqual(TABLE.LAST_PAGE_ROWS)
    })
})

test.describe('progress steps', () => {
    test('[I] a click on a step makes it current, shows its content, and fills the bars up to it', async ({ page }) => {
        await openExample(page, 'all')
        const steps = page.locator('#all .app__progress-steps').first()
        const step = index => steps.locator('.app__progress__step').nth(index)
        // Each bar is a wrapper and a fill whose width is the value (`ProgressBar.tsx`); it eases there.
        const filled = () => steps.locator('.app__progress--bar__wrapper').evaluateAll(wrappers => wrappers.map((wrapper) => {
            const fill = wrapper.querySelector('.app__progress__bar')
            return Math.round(fill.getBoundingClientRect().width) >= Math.round(wrapper.getBoundingClientRect().width) - 1
        }))

        await step(PROGRESS_STEPS.CLICKED).locator('button').click()

        await expect(step(PROGRESS_STEPS.CLICKED)).toHaveClass(/\bactive\b/)
        await expect(steps.locator('.tabs__content')).toHaveText(PROGRESS_STEPS.CLICKED_CONTENT)
        await expect.poll(filled).toEqual(PROGRESS_STEPS.BARS_FILLED_AFTER_CLICK)
    })
})
