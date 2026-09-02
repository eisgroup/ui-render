/**
 * KEYBOARD AND SCREEN-READER WIRING — the tooltip's current state, and the bones step 3 needs.
 * =============================================================================================
 *
 * TWO JOBS, and they are different in kind.
 *
 * (1) THE TOOLTIP, as it is. §9.5 records that the open tooltip carries neither `role="tooltip"`
 *     nor `aria-describedby` and does not open on focus. That is recorded here as a DEFECT — the
 *     current state — and NOT as a contract to preserve. There is no keyboard path to a tooltip's
 *     content in this product at all: `on` is `['click', 'hover']`, and a click on any real meta
 *     node is already spoken for by that node's own action. Step 2 part 1 verified in jsdom that
 *     `['hover', 'focus']` closes the gap immediately, and `tooltip.less:30` already reveals the
 *     inline bubble on `*:focus > &`, so this is a decision rather than a workstream.
 *
 * (2) THE `Dropdown` BONES for step 3. §9.5 makes a keyboard/a11y matrix mandatory for step 3,
 *     which is F1's largest step, and the expensive half of such a matrix is the harness plus the
 *     probes — `tabThrough`, `activeElement` and the role/ARIA readers in e2e/fixtures.js, all
 *     written against roles and computed geometry rather than against the tooltip. Building them now
 *     is most of step 3's value, so the starting state is measured and written down in
 *     e2e/reference.js `DROPDOWN`. NOTHING here is ticked against step 3: the matrix is step 3's
 *     work, and this leg was built for step 2.
 *
 * Playwright reads the accessibility TREE Chromium exposes. "A screen reader announces the text" is
 * not checkable here and never will be — NVDA / JAWS / VoiceOver stay manual. §9.5 carries that
 * limit explicitly so this leg is not overclaimed.
 */
const { test, expect, BUBBLE, ANY_BUBBLE, activeElement, tabThrough, tooltipA11yWiring } = require('./fixtures')
const { KEYBOARD, DROPDOWN, TIMING } = require('./reference')

test.describe('tooltip: keyboard', () => {
    test('[I] the trigger is reachable by Tab, in DOM order between the two inputs', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()
        await page.locator('[data-harness="kbd-before"]').focus()

        const stops = await tabThrough(page, 2)
        expect(KEYBOARD.TRIGGER_IS_TAB_REACHABLE).toBe(true)
        expect(stops[0]).toMatchObject({ tag: 'button', harness: 'keyboard' })
        expect(stops[1]).toMatchObject({ tag: 'input', harness: 'kbd-after' })
    })

    test('[R->I] focusing the trigger does not open it — there is no keyboard path to the content', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()
        const trigger = page.locator('[data-harness-trigger="keyboard"]')

        await trigger.focus()
        expect(await activeElement(page)).toMatchObject({ tag: 'button', harness: 'keyboard' })
        // Well past the 500 ms hover delay, so this is "focus does not open it", not "not yet".
        await page.waitForTimeout(TIMING.OPEN_BY_MS)
        expect(KEYBOARD.FOCUS_OPENS).toBe(false)
        expect(await page.locator(BUBBLE).count(), 'an accessibility defect, not a contract to preserve').toBe(0)
    })

    test('[R->I] the open bubble is invisible to assistive technology', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()
        const trigger = page.locator('[data-harness-trigger="keyboard"]')
        await trigger.hover()
        await page.locator(BUBBLE).first().waitFor({ timeout: TIMING.OPEN_BY_MS * 4 })

        const wiring = await tooltipA11yWiring(page, trigger)
        expect(KEYBOARD.A11Y_WIRED).toBe(false)
        expect(wiring.wired).toBe(false)
        expect(wiring.triggerAriaDescribedBy).toBeNull()
        expect(wiring.roleTooltipCount).toBe(0)
        // Playwright's own role query is the closest thing to an AT view available here, and it
        // agrees: nothing about the bubble is exposed as a tooltip.
        await expect(page.getByRole('tooltip')).toHaveCount(0)
    })

    test('[I] Escape closes an open bubble from an unrelated native input', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()

        await page.locator('[data-harness-trigger="keyboard"]').click()
        await expect(page.locator(ANY_BUBBLE).first()).toBeVisible({ timeout: TIMING.CLICK_OPENS_WITHIN_MS })
        // Focus inside a native text input, which consumes most keys itself — jsdom has no native
        // focus semantics, so "does Escape still reach the document handler" is only answerable here.
        await page.locator('[data-harness="kbd-after"]').focus()
        await page.keyboard.press('Escape')
        expect(KEYBOARD.ESCAPE_CLOSES_FROM_UNRELATED_ELEMENT).toBe(true)
        await expect(page.locator(ANY_BUBBLE).first()).not.toBeVisible()
    })
})

test.describe('dropdown: the step 3 starting state', () => {
    const openExample = async (page) => {
        await page.goto('/examples#dropdown')
        await page.locator('#dropdown.expanded').waitFor()
    }

    test('[R] the role census of one rendered dropdown', async ({ page }) => {
        await openExample(page)
        const roles = await page.locator('#dropdown').evaluate((root) => {
            const counts = {}
            root.querySelectorAll('[role]').forEach((element) => {
                const role = element.getAttribute('role')
                counts[role] = (counts[role] || 0) + 1
            })
            return counts
        })
        expect(roles).toEqual(DROPDOWN.ROLES)

        // The `alert` is SUIR announcing the selected value. §9.5 expects every one of these to be
        // gone after step 3, so the assertion is here to make that visible rather than to bless it.
        expect(DROPDOWN.ALERT_ANNOUNCES_SELECTED_VALUE).toBe(true)
        const alert = page.locator('#dropdown [role="alert"]').first()
        await expect(alert).not.toBeEmpty()
    })

    test('[R] options exist in the DOM whether the list is open or closed', async ({ page }) => {
        await openExample(page)
        const listbox = page.locator('#dropdown [role="listbox"]').first()
        const options = page.locator('#dropdown [role="option"]')

        await expect(listbox).toHaveClass(DROPDOWN.LISTBOX_CLASS)
        await expect(listbox).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_CLOSED)
        await expect(options).toHaveCount(DROPDOWN.ROLES.option)
        expect(DROPDOWN.OPTIONS_PRESENT_WHEN_CLOSED).toBe(true)

        await listbox.click()
        await expect(listbox).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_OPEN)
        await expect(options, '"open" is a CSS state here, not presence').toHaveCount(DROPDOWN.ROLES.option)

        await page.keyboard.press('Escape')
        await expect(listbox).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_CLOSED)
    })

    test('[I] the listbox is reachable by Tab and opens from the keyboard', async ({ page }) => {
        await openExample(page)
        const listbox = page.locator('#dropdown [role="listbox"]').first()
        await expect(listbox).toHaveAttribute('tabindex', '0')
        expect(DROPDOWN.TAB_REACHABLE).toBe(true)

        await listbox.focus()
        expect(await activeElement(page)).toMatchObject({ role: 'listbox' })
        await page.keyboard.press('ArrowDown')
        await expect(listbox).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_OPEN)
    })

    test('[R->I] the combobox wiring it does not have', async ({ page }) => {
        await openExample(page)
        const listbox = page.locator('#dropdown [role="listbox"]').first()
        await listbox.click()

        // A defect inventory, so step 3's replacement can be judged by how much of it disappears.
        const present = []
        for (const attribute of DROPDOWN.MISSING_ARIA) {
            if (await listbox.getAttribute(attribute) !== null) present.push(attribute)
        }
        expect(present, 'reference.js lists these as ABSENT; if one appeared, update the reference').toEqual([])
    })
})
