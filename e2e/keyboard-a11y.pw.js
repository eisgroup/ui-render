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

    /**
     * INVERTED, and it was ALSO PASSING FOR THE WRONG REASON, which is the more useful half of this
     * note: the old body counted `BUBBLE` — the semantic-ui-react portal selector — which matches
     * nothing once the tooltip is in-house. So "focus does not open it" stayed green after focus
     * started opening it. Any assertion that a bubble is ABSENT has to use `ANY_BUBBLE`, or it
     * proves only that SUIR is gone.
     *
     * No delay on this path: the 500 ms is a hover affordance, so a cursor crossing the control
     * does not flash a bubble. Arriving by Tab is deliberate and there is nothing to debounce.
     */
    test('[I] focusing the trigger opens it immediately — the keyboard path to the content', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()
        const trigger = page.locator('[data-harness-trigger="keyboard"]')

        await trigger.focus()
        expect(await activeElement(page)).toMatchObject({ tag: 'button', harness: 'keyboard' })
        expect(KEYBOARD.FOCUS_OPENS).toBe(true)
        // Visible BEFORE the hover delay could have elapsed, which is what makes this the focus
        // path rather than "the pointer happened to be there".
        await expect(page.locator(ANY_BUBBLE).first()).toBeVisible({ timeout: TIMING.STILL_CLOSED_AT_MS })
    })

    /**
     * INVERTED. Part 2 measured no `role`, no `id` and no `aria-describedby` anywhere — recorded as
     * an accessibility defect rather than as a contract to preserve, and the reason `A11Y_WIRED`
     * existed as a named fact at all.
     */
    test('[I] the open bubble is exposed as a tooltip and pointed at by its trigger', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()
        const trigger = page.locator('[data-harness-trigger="keyboard"]')
        await trigger.hover()
        await page.locator(ANY_BUBBLE).first().waitFor({ timeout: TIMING.OPEN_BY_MS * 4 })

        const wiring = await tooltipA11yWiring(page, trigger)
        expect(KEYBOARD.A11Y_WIRED).toBe(true)
        expect(wiring.roleTooltipCount).toBe(1)
        // Equal to the bubble's own id, never to a literal: the id is a per-instance counter, so a
        // literal would pin the counter instead of the wiring.
        expect(wiring.triggerAriaDescribedBy).toBe(wiring.bubbleId)
        expect(wiring.bubbleId, 'the bubble needs an id for anything to point at it').toBeTruthy()
        // Playwright's own role query is the closest thing to an AT view available here.
        await expect(page.getByRole('tooltip')).toHaveCount(1)
    })

    test('[I] Escape closes an open bubble from an unrelated native input', async ({ page }) => {
        await page.goto('/harness/tooltip?section=keyboard')
        await page.locator('[data-harness-section="keyboard"]').waitFor()

        // Opened by FOCUS, where part 2 opened by click — the click gesture is gone, and a
        // dismissal test that opens with it would fail on its setup and read as a dismissal
        // regression. Focus is also the honest setup here: this test is about the keyboard.
        await page.locator('[data-harness-trigger="keyboard"]').focus()
        await expect(page.locator(ANY_BUBBLE).first()).toBeVisible({ timeout: TIMING.OPEN_BY_MS })
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
