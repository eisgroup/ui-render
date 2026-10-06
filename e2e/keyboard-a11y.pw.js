/**
 * KEYBOARD AND SCREEN-READER WIRING — the tooltip's contract, and the bones step 3 needs.
 * =============================================================================================
 *
 * TWO JOBS, and they are different in kind.
 *
 * (1) THE TOOLTIP. This file recorded the a11y gap as a DEFECT while it stood: no `role="tooltip"`,
 *     no `aria-describedby`, no focus-open, and therefore no keyboard path to a tooltip's content
 *     in the product at all. §9.7-F1 step 2 part 3 CLOSED all of it, and the tests below now
 *     assert the positive: focus opens the bubble, it carries `role="tooltip"` and an id, and the
 *     trigger points at it. That happened because click-to-open was dropped — with click gone and
 *     hover unavailable to a keyboard, the wiring stopped being optional.
 *
 *     ONE LIMIT WORTH KNOWING BEFORE READING THE ASSERTIONS: focus-open reaches a focusable
 *     trigger only. A tooltip on a `<span>` or a `<div>` is hover-only, and nothing here adds a
 *     `tabindex` to change that.
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

        // Opened by HOVER, and that choice is the whole integrity of this test. Opening by FOCUS
        // and then focusing the input blurs the trigger, `onBlur` closes the bubble at that
        // instant, and `Escape` on the next line acts on an already-closed tooltip — the final
        // assertion passes on the blur and Escape is never exercised. Hovering leaves the trigger
        // unfocused, so moving focus into the input costs nothing and the bubble is still open
        // when the key is pressed.
        await page.locator('[data-harness-trigger="keyboard"]').hover()
        await expect(page.locator(ANY_BUBBLE).first()).toBeVisible({ timeout: TIMING.OPEN_BY_MS * 4 })
        // Focus inside a native text input, which consumes most keys itself — jsdom has no native
        // focus semantics, so "does Escape still reach the document handler" is only answerable here.
        await page.locator('[data-harness="kbd-after"]').focus()
        // Still open with focus elsewhere: without this the test cannot tell Escape from the setup.
        await expect(page.locator(ANY_BUBBLE).first()).toBeVisible()

        await page.keyboard.press('Escape')
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

        // The `alert` WAS SUIR announcing the selected value, and this assertion used to read
        // `not.toBeEmpty()` on it. §9.5 expected every one of these to be gone after step 3; it is,
        // so the assertion inverts rather than disappearing — the absence is the thing being
        // gated now, in a real browser's accessibility tree rather than only in jsdom's attributes.
        expect(DROPDOWN.ALERT_ANNOUNCES_SELECTED_VALUE).toBe(false)
        await expect(page.locator('#dropdown [role="alert"]')).toHaveCount(0)
    })

    test('[R] options exist in the DOM whether the list is open or closed', async ({ page }) => {
        await openExample(page)
        const control = page.locator('#dropdown [role="combobox"]').first()
        const options = page.locator('#dropdown [role="option"]')

        await expect(control.locator('xpath=..')).toHaveClass(DROPDOWN.DROPDOWN_CLASS)
        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_CLOSED)
        await expect(options).toHaveCount(DROPDOWN.OPTIONS_PRESENT_WHEN_CLOSED.dropdownView)

        await control.click()
        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_OPEN)
        await expect(options, '"open" is a CSS state here, not presence').toHaveCount(DROPDOWN.ROLES.option)

        await page.keyboard.press('Escape')
        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_CLOSED)
    })

    /**
     * THE OTHER HALF OF THE SAME FACT, and the half that was missing. The test above measures
     * `view: "Dropdown"`, where `mapper.tsx` passes `lazyLoad={false}`; this measures
     * `view: "Select"`, the MAJORITY path, where the wrapper's `lazyLoad = true` default means SUIR
     * mounts no options until the list opens. Without this, "options exist when closed" read as a
     * property of the component when it is a property of one entry point.
     */
    test('[R] ...but a `view: "Select"` mounts none of them until it opens', async ({ page }) => {
        await page.goto('/examples#selectCascading')
        await page.locator('#selectCascading.expanded').waitFor()
        const control = page.locator('#selectCascading [role="combobox"]').first()
        // Its options live in the listbox beside it, inside the same dropdown element.
        const options = control.locator('xpath=..').locator('[role="option"]')

        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_CLOSED)
        await expect(options).toHaveCount(DROPDOWN.OPTIONS_PRESENT_WHEN_CLOSED.selectView)

        await control.click()
        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_OPEN)
        await expect(options.first(), 'opening is what mounts them on this path').toBeVisible()
    })

    test('[I] the combobox is reachable by Tab and opens from the keyboard', async ({ page }) => {
        await openExample(page)
        const control = page.locator('#dropdown [role="combobox"]').first()
        await expect(control).toHaveAttribute('tabindex', '0')
        expect(DROPDOWN.TAB_REACHABLE).toBe(true)

        await control.focus()
        expect(await activeElement(page)).toMatchObject({ role: 'combobox' })
        await page.keyboard.press('ArrowDown')
        await expect(control).toHaveAttribute('aria-expanded', DROPDOWN.ARIA_EXPANDED_OPEN)
    })

    test('[I] the combobox wiring, and the name this example does not give it', async ({ page }) => {
        await openExample(page)
        const control = page.locator('#dropdown [role="combobox"]').first()
        const has = async attributes => {
            const present = []
            for (const attribute of attributes) {
                if (await control.getAttribute(attribute) !== null) present.push(attribute)
            }
            return present
        }

        expect(await has(DROPDOWN.WIRED_ARIA.always)).toEqual(DROPDOWN.WIRED_ARIA.always)
        await control.focus()
        await page.keyboard.press('ArrowDown')
        expect(await has(DROPDOWN.WIRED_ARIA.whileOpen)).toEqual(DROPDOWN.WIRED_ARIA.whileOpen)

        // The list it points at is the listbox beside it, not one inside it.
        const listId = await control.getAttribute('aria-controls')
        await expect(page.locator(`#${listId}`)).toHaveAttribute('role', 'listbox')
        expect(await control.evaluate((node, id) => {
            const list = document.getElementById(id)
            return node.parentElement === list.parentElement && !node.contains(list)
        }, listId)).toBe(true)

        expect(await has(DROPDOWN.UNNAMED_IN_THIS_EXAMPLE), 'the example declares no label').toEqual([])
    })

    /**
     * THE ONE THAT LEFT THE LIST FIRST, asserted on its own because it moves. `aria-activedescendant`
     * is how the control says where its keyboard cursor is, and it is what
     * replaced the `role="alert"` announcement. jsdom pins the attribute; only a browser can say
     * that the accessibility tree agrees — that the id resolves to a node the tree exposes as an
     * option, and that the cursor MOVES rather than being emitted once.
     */
    test('[I] the open combobox names its cursor with `aria-activedescendant`', async ({ page }) => {
        await openExample(page)
        const control = page.locator('#dropdown [role="combobox"]').first()

        await control.focus()
        await expect(control).not.toHaveAttribute('aria-activedescendant', /./)

        await page.keyboard.press('ArrowDown')
        const first = await control.getAttribute('aria-activedescendant')
        expect(first).toBeTruthy()
        await expect(page.locator(`#${first}`)).toHaveAttribute('role', 'option')
        expect(await page.locator(`#${first}`).evaluate(node => node.textContent)).toBeTruthy()

        await page.keyboard.press('ArrowDown')
        const second = await control.getAttribute('aria-activedescendant')
        expect(second, 'the cursor has to move, not just exist').not.toBe(first)
        await expect(page.locator(`#${second}`)).toHaveAttribute('role', 'option')

        // Closing takes the cursor with it: there is no cursor when there is no open list.
        await page.keyboard.press('Escape')
        await expect(control).not.toHaveAttribute('aria-activedescendant', /./)
    })
})

test.describe('tabs and disclosures: the keyboard', () => {
    // Added 2026-10-06, when tabs took the WAI-ARIA Tabs pattern and an Expand's title became the
    // button of the disclosure pattern. Until then neither had a role, a tab stop or a key.
    test('[I] a tab bar is a tablist; an arrow moves focus to the next tab, selects it, and the focus ring paints', async ({ page }) => {
        await page.goto('/examples#tabs')
        await page.locator('#tabs.expanded').waitFor()
        const tabs = page.locator('#tabs [role="tablist"] [role="tab"]')
        await expect(tabs).toHaveCount(2)
        await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')

        await tabs.nth(0).focus()
        await page.keyboard.press('ArrowRight')

        expect(await activeElement(page)).toMatchObject({ role: 'tab' })
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
        await expect(tabs.nth(1)).toHaveAttribute('tabindex', '0')
        // The global `:focus` rule draws the ring as a box-shadow (`_mixins.less`, `.outline()`).
        const ring = locator => locator.evaluate(element => getComputedStyle(element).boxShadow)
        expect(await ring(tabs.nth(1))).not.toBe('none')

        // A click focuses a tab too, and draws no ring: it is kept for the keyboard (`:focus-visible`).
        await tabs.nth(0).click()
        await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
        expect(await activeElement(page)).toMatchObject({ role: 'tab' })
        expect(await ring(tabs.nth(0))).toBe('none')
    })

    test('[I] an Expand title is a button in the tab order that Enter toggles', async ({ page }) => {
        await page.goto('/examples#expandList')
        await page.locator('#expandList.expanded').waitFor()
        const title = page.locator('#expandList [role="button"][aria-expanded]').first()
        await expect(title).toHaveAttribute('tabindex', '0')
        const before = await title.getAttribute('aria-expanded')

        await title.focus()
        await page.keyboard.press('Enter')

        await expect(title).toHaveAttribute('aria-expanded', before === 'true' ? 'false' : 'true')
    })
})
