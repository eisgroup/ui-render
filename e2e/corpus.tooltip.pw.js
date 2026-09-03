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
    /**
     * THE DEFECT THIS STEP EXISTED TO FIX, now inverted into the invariant. What part 2 measured
     * here, at every use site a meta can declare: popper wrote no coordinates at all, stamped no
     * resolved placement, left the bubble ~730 px from its trigger, and raised one uncaught
     * `TypeError` per open from its flip modifier's clipping-parent lookup. Cause: SUIR clones the
     * trigger with a `ref` and nothing reachable from a meta can hold one, so popper's reference
     * element was `null` and `getClippingParents(null)` threw before a coordinate was written.
     *
     * @Note: the old version deliberately avoided string-matching the inline style, because a
     *  `left: 0px` / `transform: none` assertion is a CSS SERIALIZATION FORM rather than the fact —
     *  popper emits the equivalent `inset: auto auto 0px 0px; transform: translate(0px, 0px)` under
     *  the same defect, so the spec would have announced the defect FIXED while it stood. The
     *  positive form has no such trap: a measured centre-to-centre distance means the same thing
     *  however the position is spelled.
     */
    test('[I] opening it places the bubble beside its trigger and raises nothing', async ({ page, pageErrors }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()

        expect(pageErrorsOf(pageErrors), 'the page must be error-free before any tooltip opens').toEqual([])
        expect(await page.locator(ANY_BUBBLE).count(), 'a closed tooltip adds nothing to the document').toBe(0)

        await openByHover(page, trigger)
        await expect(anyBubble(page)).toHaveText('Open popup')

        const near = adjacency(await rectOf(anyBubble(page)), await rectOf(trigger))
        expect(
            near.centreDistance,
            `the bubble should be adjacent to its trigger; measured ${JSON.stringify(near)}`,
        ).toBeLessThan(CORPUS.MAX_CENTRE_DISTANCE_PX)
        expect(near.gapAbove, 'and immediately above it').toBeGreaterThanOrEqual(0)

        expect(pageErrorsOf(pageErrors)).toHaveLength(CORPUS.PAGE_ERRORS_PER_OPEN)
    })

    /**
     * Kept from part 2 with its reason replaced. Then: popper stamped no `data-popper-*` attribute
     * even when it positioned correctly, so the resolved placement was readable ONLY from the
     * className — which is why the flip contract was a class assertion. Now: there is no popper,
     * so the count is 0 for a stronger reason, and the class carries the REQUESTED placement.
     * Weak on its own — the count was already 0 — so it is paired with the class string, which did
     * change (`ui top left inverted popup transition visible` -> `tooltip no-wrap top show
     * inverted`) and is the assertion that would catch a silent revert.
     */
    test('[I] no popper attributes anywhere, and the class carries the requested placement', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())

        await expect(anyBubble(page)).toHaveClass(BUBBLE_CLASS.top)
        const withPopperAttributes = await page.evaluate(() => Array.from(document.querySelectorAll('*'))
            .filter((element) => Array.from(element.attributes).some((a) => a.name.startsWith('data-popper'))).length)
        expect(withPopperAttributes).toBe(CORPUS.POPPER_DATA_ATTRIBUTE_COUNT)
    })

    /**
     * INVERTED, and this is the assertion that proves the CSS reaches the bubble at all. Part 2
     * measured the bubble portaled into `document.body`, outside `.ui-render` — so prefixwrap,
     * which scopes every rule under that class, left all 13 `.ui.popup` rules unable to match and
     * the live tooltip was unstyled text: transparent background, no border, no padding,
     * `z-index: auto`. The bubble is a sibling of its trigger now, and every one of those values
     * is a painted one.
     */
    test('[I] the bubble is inside `.ui-render`, and our CSS paints it', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())

        // The join `css.tooltip-contract.test.js` cannot make: `Element.matches()` proves a selector
        // matches, never that anything painted. This is computed style on the node that ships.
        expect(await isInsideWidget(anyBubble(page))).toEqual({
            insideUiRender: CORPUS.INSIDE_UI_RENDER,
            portalParent: CORPUS.PORTAL_PARENT_TAG,
        })
        expect(await paintOf(anyBubble(page))).toMatchObject(CORPUS.PAINT)
        // The step's hazard, measured on the node that ships rather than in the stylesheet: without
        // it the bubble sits under the pointer and the tooltip flickers.
        expect(await anyBubble(page).evaluate((element) => getComputedStyle(element).pointerEvents))
            .toBe(CORPUS.POINTER_EVENTS)
    })

    /**
     * INVERTED. Part 2 measured no `role`, no `id` and no `aria-describedby` anywhere — a defect,
     * recorded as one rather than as a contract to preserve. The wiring exists BECAUSE
     * click-to-open was dropped: with click gone and hover unavailable to a keyboard, this and
     * focus-open are the only path to the content.
     *
     * `aria-describedby` is asserted EQUAL to the bubble's own id rather than to a literal — the id
     * is a per-instance counter, so a literal would pin the counter instead of the wiring.
     */
    test('[I] the open bubble is wired to its trigger for assistive technology', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        const trigger = page.locator('#buttonIcon button.button').first()
        await openByHover(page, trigger)

        const bubbleId = await anyBubble(page).getAttribute('id')
        expect(bubbleId, 'the bubble needs an id for anything to point at it').toBeTruthy()
        expect({
            roleTooltipCount: await page.locator('[role="tooltip"]').count(),
            bubbleRole: await anyBubble(page).getAttribute('role'),
        }).toEqual(CORPUS.A11Y)
        expect(await trigger.getAttribute('aria-describedby')).toBe(bubbleId)
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

    /**
     * REPLACED, not deleted: part 2 pinned Semantic's spelling — a `div.content` wrapper for a
     * string or number body and NO wrapper for an element or function one, a conditional structure
     * that `UIRender.overlay-behavior.test.js` had to read through visible text. The replacement
     * has no wrapper on either path, so the body is the bubble's own children and the structure is
     * the same whatever the body is.
     */
    test('[I] the body is the bubble\'s own children, with no wrapper element on either path', async ({ page }) => {
        await openFactorsTab(page)

        // The Apply path is the STRING one, which is the path that used to get the wrapper.
        await openByHover(page, page.getByRole('button', { name: 'Apply' }))
        expect(await anyBubble(page).evaluate((element) => element.children.length))
            .toBe(CORPUS.CHILD_ELEMENT_COUNT)

        await page.mouse.move(4, 4)
        await expect(anyBubble(page)).not.toBeVisible()

        // ...and the ELEMENT path, which never had the wrapper, is now identical rather than
        // merely similar — same child count, same class string.
        await openByHover(page, page.getByRole('button', { name: 'Reset' }))
        expect(await anyBubble(page).evaluate((element) => element.children.length))
            .toBe(CORPUS.CHILD_ELEMENT_COUNT)
        await expect(anyBubble(page)).toHaveClass(BUBBLE_CLASS.top)
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

    /**
     * The same inversion at the DEEP site, and it is the one that matters most: part 2 measured
     * 2538-3006 px between bubble and trigger here, against ~730 px at `buttonIcon`, because the
     * distance was really the distance to the document origin and this site sits far down the page.
     * Measured now: 40 px at both, i.e. the geometry no longer depends on where on the page the
     * trigger is.
     */
    test('[I] the deep site places its bubble just as closely, and raises nothing', async ({ page, pageErrors }) => {
        await openFactorsTab(page)
        const trigger = page.getByRole('button', { name: 'Apply' })
        const before = pageErrorsOf(pageErrors).length
        await openByHover(page, trigger)

        const near = adjacency(await rectOf(anyBubble(page)), await rectOf(trigger))
        expect(near.centreDistance, `measured ${JSON.stringify(near)}`)
            .toBeLessThan(CORPUS.MAX_CENTRE_DISTANCE_PX)
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

    /**
     * UNCHANGED, and now for a reason rather than by omission. Part 2 recorded this as the
     * `hoverable: false` defect — SUIR could have made the bubble hoverable and nothing passed the
     * prop. It still closes, and it cannot do otherwise: the bubble must keep `pointer-events:
     * none` (the step's hazard — without it the bubble sits under the pointer and the tooltip
     * flickers), so the pointer over the bubble is really over whatever is behind it, `mouseleave`
     * fires on the host, and it closes. Hoverable text and a non-interactive bubble are mutually
     * exclusive; the bubble stays non-interactive.
     */
    test('[R] the pointer travelling onto the bubble still closes it', async ({ page }) => {
        await openExample(page, 'buttonIcon')
        await openByHover(page, page.locator('#buttonIcon button.button').first())
        const rect = await rectOf(anyBubble(page))

        // Geometric, and therefore inexpressible in jsdom: the pointer crosses the gap and lands on
        // the bubble itself. Nothing in the bubble can be read, hovered or selected.
        await page.mouse.move((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2)
        await expect(anyBubble(page)).not.toBeVisible({ timeout: TIMING.CLOSED_AFTER_LEAVE_BY_MS * 3 })
        expect(CORPUS.TRAVEL_ONTO_BUBBLE_CLOSES).toBe(true)
    })

    /**
     * OBLIGATION 2, measured where the problem actually was. Part 2 recorded the collision: SUIR's
     * default `on` is `['click', 'hover']`, and every tooltipped node in this corpus ALREADY owns
     * its action (`onClick: 'popup'` on `buttonIcon`, `onClick: 'reset'` here), so one gesture
     * served both and the tooltip arrived after the action had run. Worse, the tooltip did not even
     * toggle cleanly on that path — the second click did NOT close it, where a plain `<button>` on
     * the harness page toggled fine.
     *
     * The click belongs to the node again. Two routes had to be closed for that, and the second was
     * found only here: dropping the `click` gesture, and then suppressing the focus-open that a
     * mouse click produces on a `<button>` — without which the removal changed nothing a user sees.
     */
    test('[I] a click on a real meta node no longer opens the tooltip', async ({ page }) => {
        await openFactorsTab(page)
        const trigger = page.getByRole('button', { name: 'Reset' })
        const box = await trigger.boundingBox()

        // By coordinate, then leaving at once: a click cannot avoid hovering first, and a lingering
        // pointer would open the bubble by HOVER 500 ms later.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.up()
        await page.mouse.move(4, 4)
        await expect(anyBubble(page)).not.toBeVisible()

        await page.waitForTimeout(TIMING.OPEN_BY_MS * 2)
        expect(
            await page.locator(ANY_BUBBLE).count(),
            'the gesture belongs to the node\'s own action, by neither the click nor the focus route',
        ).toBe(0)
    })
})
