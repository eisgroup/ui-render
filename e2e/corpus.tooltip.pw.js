/**
 * THE CORPUS TOOLTIP, IN REAL CHROME — every tooltip a meta can declare.
 * =============================================================================================
 *
 * Three entry points, all three driven here:
 *   1. a string `tooltip` attribute on a `Button` node — `buttonIcon`, reachable in ONE step;
 *   2. the same attribute inside the `all` example's `Factors` tab — the deep use site, behind ten
 *      clip/scroll ancestors, which is the only place clipping can be measured on real markup;
 *   3. `view: 'Tooltip'` with a `children` node — the sibling declaration in the same tab.
 *
 * WHY (2) AND (3) NEED TWO CLICKS AND WHY THAT IS NOT WORKED AROUND. Their `Tabs` panel is
 * inactive, and `Tabs` renders only `contents[activeIndex]`, so the panel mounts on click. §9.5
 * treats this as a blocker ("nothing in the demo renders a `TooltipPop`") but it is only true of the
 * INITIAL state: `/examples#all` auto-expands (Examples.jsx reads `window.location.hash`) and one
 * click on the `Factors` tab mounts the panel. Activating the branch by default was considered and
 * rejected — it would rewrite ~240 lines of the `all` snapshot, move `ROLE_CENSUS.all`, and change
 * what the public demo shows, to buy a click. Adding a whole new example was rejected too: nine
 * enforced touchpoints (the manifest length, the registry length, the 38-snapshot baseline, the role
 * census, the bound-name count, the nameless-control count, and the generated prop page).
 *
 * (1) is the one thing that DID change: one `tooltip:` line on `src/demo/examples/button-icon_meta.js`.
 * Measured free — a closed tooltip adds nothing to the document — and it exists so this leg does
 * not depend solely on a 749-line meta and a tab click.
 *
 * READ e2e/reference.js FIRST. Every expected value lives there with an [R] / [I] / [R->I] tag, and
 * the tags are what stop this file being a tripwire on the replacement.
 */
const { test, expect, BUBBLE, ANY_BUBBLE, rectOf, adjacency, clipAncestorsOf, paintOf, isInsideWidget, tooltipA11yWiring } = require('./fixtures')
const { BUBBLE_CLASS, CORPUS, TIMING, DISMISSAL, WIDGET } = require('./reference')

const bubble = (page) => page.locator(BUBBLE).first()
/** Either shape. `[I]` tests use this so the planned inline convergence can be judged. */
const anyBubble = (page) => page.locator(ANY_BUBBLE).first()

/** Open an example accordion by its manifest id. */
async function openExample (page, id) {
    await page.goto(`/examples#${id}`)
    await page.locator(`#${id}.expanded`).waitFor()
}

/** The `all` example's `Factors` tab. Scoped to `.tabs__item` because the JSON viewers below the
 *  example also render the literal text "Factors" out of the meta they display. */
async function openFactorsTab (page) {
    await openExample(page, 'all')
    await page.locator('.tabs__item').filter({ hasText: /^Factors$/ }).click()
}

async function openByHover (page, trigger) {
    await trigger.hover()
    // Either shape, and by VISIBILITY not presence: the portal mounts on open while the inline
    // bubble is always in the DOM under `display: none`. This helper is why the assertion-level
    // fix alone was not enough — every test using it failed here, before its own assertions ran.
    await anyBubble(page).waitFor({ state: 'visible', timeout: TIMING.OPEN_BY_MS * 4 })
}

const pageErrorsOf = (errors) => errors.filter((error) => error.kind === 'pageerror')

test.describe('corpus: the string `tooltip` attribute, one step from a fresh load', () => {
    test('[R->I] opening it writes no coordinates and raises one uncaught popper error', async ({ page, pageErrors }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()

        expect(pageErrorsOf(pageErrors), 'the page must be error-free before any tooltip opens').toEqual([])
        expect(await page.locator(BUBBLE).count(), 'a closed tooltip adds nothing to the document').toBe(0)

        await openByHover(page, trigger)
        await expect(bubble(page)).toHaveText('Open popup')

        // The defect, in its scroll-independent form: popper never wrote a position.
        //
        // @Note: this deliberately does NOT string-match the inline style. An earlier version
        //  asserted `style` contains `left: 0px` / `top: 0px` and `transform === 'none'`, which is a
        //  CSS *serialization form*, not the fact. Review measured popper emitting the equivalent
        //  `inset: auto auto 0px 0px; transform: translate(0px, 0px)` under the same defect — same
        //  meaning, different spelling — so the spec failed and its message announced the defect was
        //  FIXED when it was not. A popper or SUIR bump would reproduce that false signal. What
        //  actually discriminates is the resolved offset plus the absence of a placement attribute.
        const wrapper = await bubble(page).evaluate((element) => {
            const parent = element.parentElement
            const paint = getComputedStyle(parent)
            const matrix = new DOMMatrixReadOnly(paint.transform === 'none' ? '' : paint.transform)
            return {
                // Numeric, so `0px` and `auto`-plus-`inset` reduce to the same answer.
                offsetX: Math.round((parseFloat(paint.left) || 0) + matrix.m41),
                offsetY: Math.round((parseFloat(paint.top) || 0) + matrix.m42),
                placement: parent.getAttribute('data-popper-placement')
                    || element.getAttribute('data-popper-placement'),
            }
        })
        expect(CORPUS.WRAPPER_HAS_NO_COORDINATES, 'reference.js says coordinates ARE written now — update this spec, not the reference').toBe(true)
        // Popper never ran to completion, so it never stamped the placement it resolved.
        expect(wrapper.placement).toBeNull()
        expect({ offsetX: wrapper.offsetX, offsetY: wrapper.offsetY }).toEqual({ offsetX: 0, offsetY: 0 })

        // ...so the bubble is nowhere near the thing it describes.
        const triggerRect = await rectOf(trigger)
        const bubbleRect = await rectOf(bubble(page))
        const near = adjacency(bubbleRect, triggerRect)
        expect(
            near.centreDistance,
            `the bubble should be adjacent to its trigger; measured ${JSON.stringify(near)}`,
        ).toBeGreaterThan(CORPUS.MIN_CENTRE_DISTANCE_PX)

        // One uncaught error per open, from popper's clipping-parent lookup in the flip modifier.
        const errors = pageErrorsOf(pageErrors)
        expect(errors).toHaveLength(CORPUS.PAGE_ERRORS_PER_OPEN)
        expect(errors[0].message).toMatch(CORPUS.PAGE_ERROR_PATTERN)
    })

    test('[R] popper writes no data-popper-* attribute, so the resolved placement is readable only from the className', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())

        await expect(bubble(page)).toHaveClass(BUBBLE_CLASS.topLeft)
        const withPopperAttributes = await page.evaluate(() => Array.from(document.querySelectorAll('*'))
            .filter((element) => Array.from(element.attributes).some((a) => a.name.startsWith('data-popper'))).length)
        expect(withPopperAttributes).toBe(CORPUS.POPPER_DATA_ATTRIBUTE_COUNT)
    })

    test('[R->I] the bubble portals outside `.ui-render`, so our CSS does not paint it', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())

        // The join `css.tooltip-contract.test.js` cannot make: `Element.matches()` proves a selector
        // matches, never that anything painted. This is computed style on the node that ships.
        expect(await isInsideWidget(bubble(page))).toEqual({
            insideUiRender: CORPUS.INSIDE_UI_RENDER,
            portalParent: CORPUS.PORTAL_PARENT_TAG,
        })
        const paint = await paintOf(bubble(page))
        expect(paint).toMatchObject(CORPUS.PAINT)
    })

    test('[R->I] the open bubble has no screen-reader wiring at all', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()
        await openByHover(page, trigger)

        const wiring = await tooltipA11yWiring(page, trigger)
        expect(wiring).toMatchObject(CORPUS.A11Y)
        expect(wiring.wired, 'no role="tooltip" and no aria-describedby — an accessibility defect, not a contract').toBe(false)
    })
})

test.describe('corpus: the `all` example, at the deep use site', () => {
    /**
     * Split from the markup facts below on purpose. That both declarations reach their own text is
     * an obligation any implementation owes; the `.content` wrapper and the `ui top left …` class
     * string are semantic-ui-react's spelling of it, and the inline replacement will not emit
     * either. Reviewing the two in one body made the test unpassable after the convergence even
     * with the locator fixed, which is how a reference turns into a tripwire on its own plan.
     */
    test('[I] both declarations in the `Factors` tab render their own text', async ({ page }) => {
        await openFactorsTab(page)

        // (2) the string `tooltip` attribute on the Apply button.
        await openByHover(page, page.getByRole('button', { name: 'Apply' }))
        await expect(anyBubble(page)).toHaveText('Insert Changes')

        await page.mouse.move(4, 4)
        await expect(anyBubble(page)).not.toBeVisible()

        // (3) `view: 'Tooltip'` with a `children` node.
        await openByHover(page, page.getByRole('button', { name: 'Reset' }))
        await expect(anyBubble(page)).toHaveText('Remove Changes')
    })

    test('[R] and Semantic spells them with a `.content` wrapper and its own class string', async ({ page }) => {
        await openFactorsTab(page)

        // A string `tooltip` becomes `content`, which Semantic wraps; an element child does not
        // get the wrapper (measured in part 1) — so only the Apply path carries it.
        await openByHover(page, page.getByRole('button', { name: 'Apply' }))
        await expect(bubble(page).locator(`div.${CORPUS.CONTENT_CHILD_CLASS}`)).toHaveCount(1)

        await page.mouse.move(4, 4)
        await expect(page.locator(BUBBLE)).toHaveCount(0)

        await openByHover(page, page.getByRole('button', { name: 'Reset' }))
        await expect(bubble(page)).toHaveClass(BUBBLE_CLASS.topLeft)
    })

    test('[I] the trigger sits behind a deep stack of clip/scroll ancestors', async ({ page }) => {
        await openFactorsTab(page)
        const ancestors = await clipAncestorsOf(page.getByRole('button', { name: 'Apply' }))

        // A floor rather than an equality: the depth is a property of the `all` example's layout,
        // and the point is that a real use site HAS this depth, so an inline rewrite meets all of
        // it. Four of these are inside the widget (`tabs__content`, `tabs`, the Expand/AnimateHeight
        // `overflow: hidden` wrapper, `ui__render`) and the rest belong to the demo shell.
        expect(ancestors.length).toBeGreaterThanOrEqual(WIDGET.MIN_CORPUS_CLIP_ANCESTORS)
        expect(ancestors.some((a) => a.overflow.includes('hidden')), 'at least one ancestor clips').toBe(true)
        expect(ancestors.map((a) => a.tag)).toContain('body')
    })

    test('[R->I] the same defect at the deep site: no coordinates, one error per open', async ({ page, pageErrors }) => {
        await openFactorsTab(page)
        const trigger = page.getByRole('button', { name: 'Apply' })
        const before = pageErrorsOf(pageErrors).length
        await openByHover(page, trigger)

        const near = adjacency(await rectOf(bubble(page)), await rectOf(trigger))
        expect(near.centreDistance).toBeGreaterThan(CORPUS.MIN_CENTRE_DISTANCE_PX)
        expect(pageErrorsOf(pageErrors).length - before).toBe(CORPUS.PAGE_ERRORS_PER_OPEN)
    })
})

test.describe('corpus: interaction, in real time with a real pointer', () => {
    test('[I] hover opens after our 500 ms delay, not semantic-ui-react\'s 50 ms', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()

        await trigger.hover()
        await page.waitForTimeout(TIMING.STILL_CLOSED_AT_MS)
        await expect(anyBubble(page), `still closed at ${TIMING.STILL_CLOSED_AT_MS} ms`).not.toBeVisible()
        await expect(anyBubble(page)).toBeVisible({ timeout: TIMING.OPEN_BY_MS })
    })

    test('[I] leaving before the delay elapses cancels the pending open', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()

        await trigger.hover()
        await page.waitForTimeout(TIMING.CANCEL_AFTER_MS)
        await page.mouse.move(4, 4)
        await page.waitForTimeout(TIMING.OPEN_BY_MS)
        await expect(anyBubble(page), 'a cancelled open must not fire later').not.toBeVisible()
    })

    test('[I] the pointer leaving the trigger closes it', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())

        await page.mouse.move(4, 4)
        await expect(anyBubble(page)).not.toBeVisible({ timeout: TIMING.CLOSED_AFTER_LEAVE_BY_MS * 3 })
        expect(DISMISSAL.pointerLeavesTrigger).toBe('closes')
    })

    test('[R] the pointer travelling onto the bubble closes it — the `hoverable: false` defect', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())
        const rect = await rectOf(bubble(page))

        // Geometric, and therefore inexpressible in jsdom: the pointer crosses the gap and lands on
        // the bubble itself. Nothing in the bubble can be read, hovered or selected.
        await page.mouse.move((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2)
        await expect(page.locator(BUBBLE)).toHaveCount(0)
        expect(DISMISSAL.pointerMovesOntoBubble).toBe('closes')
    })

    test('[R] on a real meta node the tooltip is a SECOND consumer of the same click', async ({ page }) => {
        // semantic-ui-react's default `on` is `['click', 'hover']`, so every tooltip is also a click
        // target. In this corpus every tooltipped node ALREADY has its own action (`onClick: 'popup'`
        // on `buttonIcon`, `onClick: 'reset'` on this one), so the click path through meta is
        // confounded by design and does not behave like the component's own toggle: measured here,
        // the second click does NOT close the bubble, where a plain `<button>` on the harness page
        // toggles cleanly (harness.tooltip.pw.js). That is the evidence behind part 2's open `on`
        // decision — dropping `'click'` and adding `'focus'` removes the collision AND the keyboard
        // gap in one change. The crisp dismissal contract is asserted on the harness for exactly
        // this reason.
        await openFactorsTab(page)
        const trigger = page.getByRole('button', { name: 'Reset' })

        await trigger.click()
        await expect(page.locator(BUBBLE)).toHaveCount(1, { timeout: TIMING.OPEN_BY_MS * 2 })
        await trigger.click()
        await page.waitForTimeout(TIMING.CLOSED_AFTER_LEAVE_BY_MS)
        expect(
            await page.locator(BUBBLE).count(),
            'a second click on a node that owns its own onClick does not toggle the tooltip shut',
        ).toBe(1)
    })
})
