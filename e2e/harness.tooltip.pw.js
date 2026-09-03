/**
 * GEOMETRY — everything the corpus cannot express, on /harness/tooltip.
 * =============================================================================================
 *
 * The corpus gives one tooltip location and, crucially, no trigger that can hold a `ref`. Popper's
 * reference element is therefore always `null` there, its clipping-parent lookup throws, and NO
 * coordinates are ever written (corpus.tooltip.pw.js pins that). So flip, overflow, stacking and
 * scroll behaviour are not merely hard to observe from meta — they are unobservable, because the
 * positioning never runs.
 *
 * This file drives the SAME `TooltipPop` with a plain `<button>` trigger, which is the only shape
 * semantic-ui-react can attach a ref to. Everything it records is therefore a fact about the
 * component's positioning as configured, and the contrast with the corpus file is the diagnosis.
 *
 * It also carries the in-house `Tooltip` reference — the convergence target — because nothing else
 * in the repo gates it in a browser and part 2 is judged against not regressing it.
 *
 * Expected values live in e2e/reference.js with [R] / [I] / [R->I] tags. The harness page's own
 * header explains why each section is shaped the way it is.
 */
const { test, expect, BUBBLE, ANY_BUBBLE, INLINE_BUBBLE, rectOf, adjacency, isWithin, paintOf, topmostAt, paintedTopmostAt } = require('./fixtures')
const { BUBBLE_CLASS, INLINE, TIMING, WIDGET } = require('./reference')

const bubble = (page) => page.locator(BUBBLE).first()
/** Either shape. `[I]` tests use this so the planned inline convergence can be judged. */
const anyBubble = (page) => page.locator(ANY_BUBBLE).first()

async function section (page, name) {
    await page.goto(`/harness/tooltip?section=${name}`)
    await page.locator(`[data-harness-section="${name}"]`).waitFor()
}

async function open (page, id) {
    const trigger = page.locator(`[data-harness-trigger="${id}"]`)
    await trigger.hover()
    // Either shape, and by VISIBILITY not presence: the portal mounts on open while the inline
    // bubble is always in the DOM under `display: none`. This helper is why the assertion-level
    // fix alone was not enough — every test using it failed here, before its own assertions ran.
    await anyBubble(page).waitFor({ state: 'visible', timeout: TIMING.OPEN_BY_MS * 4 })
    return trigger
}

test.describe('harness: does it position at all', () => {
    test('[I] a ref-able trigger gets a bubble adjacent to it, and no uncaught error', async ({ page, pageErrors }) => {
        await section(page, 'plain')
        const trigger = await open(page, 'plain')

        const triggerRect = await rectOf(trigger)
        const bubbleRect = await rectOf(anyBubble(page))
        const near = adjacency(bubbleRect, triggerRect)

        // `top`: the bubble sits immediately above the trigger and is CENTRED on it. Stated as
        // relations, never as pixel values — the webfonts are blocked, so text metrics come from
        // whatever fallback face the platform provides and absolute widths are not portable.
        expect(near.gapAbove, `bubble should sit just above the trigger; measured ${JSON.stringify(near)}`)
            .toBeGreaterThanOrEqual(0)
        expect(near.gapAbove).toBeLessThan(8)
        expect(near.overlapX, 'the bubble must overlap the trigger horizontally').toBeGreaterThan(0)
        // CENTRED, where the wrapper shared the trigger's LEFT edge: the wrapper requested
        // `top left`, which was semantic-ui-react's own default rather than anything a meta asked
        // for, and `reference.js` finding 4 measured our corner placements as broken — `top left`
        // lands on top of the host. The replacement asks for `top`, one of the four that work.
        expect(bubbleRect.left + bubbleRect.width / 2)
            .toBeCloseTo(triggerRect.left + triggerRect.width / 2, 0)

        expect(pageErrors.filter((error) => error.kind === 'pageerror'), 'nothing throws: there is no popper and no ref to be null').toEqual([])
    })

    /**
     * Split out of the adjacency test above, and now the record of HOW the bubble gets there. Part
     * 2 asserted a transform on a popper wrapper; there is no wrapper and no transform, because
     * placement is CSS off the host box. Kept as its own test rather than folded into the
     * adjacency one for the same reason it was split: "the bubble is next to its trigger" is the
     * obligation, and the mechanism is not.
     */
    test('[I] the bubble is a child of the host, placed by CSS, with no wrapper and no transform', async ({ page }) => {
        await section(page, 'plain')
        await open(page, 'plain')

        // The bubble DOES carry a transform, and reading one is why this assertion is shaped the
        // way it is: `tooltip.less` centres it with `translateX(-50%)`. The difference from the
        // wrapper is the point — a CSS translation is a constant of the placement, while popper
        // wrote a computed x AND y onto a wrapper element on every open. So: no wrapper, and no
        // vertical component in the one transform that remains.
        expect(await anyBubble(page).evaluate((element) => {
            const own = new DOMMatrixReadOnly(getComputedStyle(element).transform)
            return {
                parentClass: element.parentElement.className,
                parentTransform: getComputedStyle(element.parentElement).transform,
                ownTranslatesVertically: own.f !== 0,
                position: getComputedStyle(element).position,
            }
        })).toEqual({
            parentClass: 'tooltip-host',
            parentTransform: 'none',
            ownTranslatesVertically: false,
            position: 'absolute',
        })
    })
    /**
     * THE ONE POSITIONING CASE THE IN-HOUSE COMPONENT CANNOT SERVE, measured rather than asserted in
     * prose. The bubble is placed by CSS against `.tooltip-host`, so a trigger taken out of normal
     * flow leaves the host collapsed at its static position and the bubble goes with the host.
     * `semantic-ui-react` did not have this constraint, because popper measured the trigger element
     * itself — and of the step's losses this is the only one a consumer meta could actually produce,
     * through a `styles` attribute.
     *
     * Recorded as a LIMITATION rather than treated as a defect, because no meta in either corpus
     * produces an out-of-flow trigger. Pinned so a future fix — or a regression in the opposite
     * direction — is a visible diff rather than a surprise.
     */
    test('[R] a trigger taken out of normal flow leaves the bubble behind, with the host', async ({ page }) => {
        await section(page, 'outOfFlowTrigger')
        const trigger = page.locator('[data-harness-trigger="outOfFlow"]')
        await trigger.hover()
        await anyBubble(page).waitFor({ state: 'visible', timeout: TIMING.OPEN_BY_MS * 4 })

        const near = adjacency(await rectOf(anyBubble(page)), await rectOf(trigger))
        expect(
            near.centreDistance,
            `the bubble follows the collapsed host, not the trigger; measured ${JSON.stringify(near)}`,
        ).toBeGreaterThan(200)
        // The host really is collapsed: that is the mechanism, not merely the symptom.
        expect(await anyBubble(page).evaluate((element) => {
            const rect = element.parentElement.getBoundingClientRect()
            return { width: Math.round(rect.width), height: Math.round(rect.height) }
        })).toEqual({ width: 0, height: 0 })
    })


    test('[I] `position: fixed` inside `.ui-render` is viewport-relative and escapes `.app`\'s clip', async ({ page }) => {
        await section(page, 'plain')

        // The open question part 2 needed settled: an inline bubble gets the scoped CSS but is
        // clipped by `.app`; a FIXED bubble inside `.ui-render` gets the CSS and escapes the clip —
        // provided no ancestor transform/filter/will-change traps it. Measured, not assumed.
        const widget = await page.evaluate(() => {
            const app = getComputedStyle(document.querySelector('.app'))
            const root = getComputedStyle(document.querySelector('.ui-render'))
            return {
                app: { position: app.position, transform: app.transform, filter: app.filter, willChange: app.willChange },
                uiRender: { position: root.position, zIndex: root.zIndex, isolation: root.isolation },
            }
        })
        expect(widget.app).toMatchObject(WIDGET.APP_STYLE)
        expect(widget.uiRender).toEqual(WIDGET.UI_RENDER_STYLE)

        const probe = await rectOf(page.locator('[data-harness="fixed-probe"]'))
        const viewport = page.viewportSize()
        expect(WIDGET.FIXED_ESCAPES_APP_CLIP).toBe(true)
        expect(probe.left).toBeCloseTo(24, 0)
        expect(probe.bottom).toBeCloseTo(viewport.height - 24, 0)
    })
})

test.describe('harness: collision handling', () => {
    /**
     * FLIP IS GONE, and this is where that is stated as a measurement instead of a caveat. Part 2
     * pinned popper resolving `top left` to `bottom left` here and rewriting the className to say
     * so. CSS placement cannot flip: it does not measure, so the requested placement is the one
     * you get even when it does not fit.
     *
     * The cost is bounded, which is why the step accepted it: this behaviour was reachable ONLY on
     * this harness page. Every tooltip a meta can declare had a `null` reference element, so
     * popper threw before writing a coordinate and nothing ever flipped in the product.
     */
    test('[R] no flip: with no room above, the bubble keeps the requested placement and overflows', async ({ page }) => {
        await section(page, 'flip')
        await open(page, 'flip')

        await expect(anyBubble(page)).toHaveClass(BUBBLE_CLASS.top)
        const rect = await rectOf(anyBubble(page))
        expect(rect.top, 'no room above, and no flip, so the bubble leaves the viewport').toBeLessThan(0)
    })

    /**
     * The horizontal half of the same loss. Part 2 corrected the plan's "flip yes, shift no" by
     * measuring that flip also flips the VARIATION, so a right-edge trigger resolved `top left` to
     * `top right` and stayed on screen. Nothing does that now. Same bounded cost: reachable only
     * here, never from a meta.
     */
    test('[R] no shift either: a right-edge trigger\'s bubble leaves the viewport', async ({ page }) => {
        await section(page, 'overflow')
        await open(page, 'overflow')

        await expect(anyBubble(page)).toHaveClass(BUBBLE_CLASS.top)
        const rect = await rectOf(anyBubble(page))
        expect(rect.right, 'centred on a right-edge trigger, so it overflows')
            .toBeGreaterThan(page.viewportSize().width)
    })

    /**
     * THE ONE REAL COST OF THE STEP, now shipped rather than predicted. Part 2 measured both
     * shapes side by side in the same box: the portaled bubble painted 9 px ABOVE the box's top
     * edge and was hit-testable there, while the inline bubble's layout rect left the box but
     * nothing of it painted outside. Only the second shape exists now, so this test keeps the half
     * that is still measurable — and it is the half that costs something.
     */
    test('[R] clipping: the bubble is confined to an `overflow: hidden` ancestor', async ({ page }) => {
        await section(page, 'clip')
        const box = await rectOf(page.locator('[data-harness="clip"]'))
        await open(page, 'clipped')
        const bubbleRect = await rectOf(anyBubble(page))

        // `getBoundingClientRect()` ignores clipping, so the LAYOUT rect leaves the box...
        expect(isWithin(bubbleRect, box), 'the layout rect is not confined to the box').toBe(false)
        // ...and nothing of it is painted out there. `paintedTopmostAt`, not `topmostAt`: the
        // bubble's own `pointer-events: none` would make a plain hit test answer `false` for a
        // bubble that IS painted, which would pass this assertion for the wrong reason.
        const beyond = await paintedTopmostAt(page, (bubbleRect.left + bubbleRect.right) / 2, box.top - 6)
        expect(beyond && beyond.inBubble, 'the bubble is clipped: it does not paint above its box').toBe(false)
    })

    /**
     * FLIPPED, and it is a fix. Part 2 measured a SYNTHETIC window scroll closing the bubble and
     * flickering it back ~50 ms later, from a real upstream bug: `Popup.js` never destructures the
     * `hideOnScroll` prop, so its own local function of that name shadows it and the scroll
     * listener is mounted unconditionally, with `capture: true`, so even a nested container's
     * non-bubbling scroll reached it. `hideOnScroll` is dropped and there is no listener: a bubble
     * that is a child of the thing that moves needs no repositioning and no dismissal.
     */
    test('[I] a scroll does not close the bubble any more', async ({ page }) => {
        await section(page, 'plain')
        await open(page, 'plain')

        // A SYNTHETIC window scroll: no pointer movement, no layout change, so this cannot be
        // `closeOnTriggerMouseLeave`. Upstream cause, read out of the installed source:
        // `Popup.js` never destructures the `hideOnScroll` prop, so its own local function of the
        // same name shadows it and `hideOnScroll && <EventStack name="scroll" target="window"/>` is
        // always truthy; `@semantic-ui-react/event-stack` subscribes with `capture: true`, so even a
        // nested container's non-bubbling scroll reaches it.
        //
        // Consequence for part 2: popper's `eventsEnabled` scroll repositioning is UNREACHABLE in
        // this product, so the replacement owes nothing for it. An inline bubble gets correct
        // behaviour for free by being a child of the thing that moves.
        await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
        await page.waitForTimeout(TIMING.SCROLL_CLOSES_WITHIN_MS)
        await expect(anyBubble(page)).toBeVisible()
    })

    test('[R] scrolling the container under the pointer removes the bubble too', async ({ page }) => {
        await section(page, 'scroll')
        await open(page, 'scrolled')
        await page.mouse.wheel(0, 30)
        await expect(page.locator(BUBBLE)).toHaveCount(0, { timeout: TIMING.SCROLL_CLOSES_WITHIN_MS * 3 })
    })

    test('[I] stacking: the inline bubble\'s `z-index: 9` beats host content at 6; the portal\'s `auto` does not', async ({ page }) => {
        await section(page, 'stack')

        // `.ui-render` creates no stacking context of its own (asserted above), so a bubble's paint
        // order against host content is decided by the host and the only lever is the bubble's own
        // z-index. 9 wins, `auto` does not — a concrete argument FOR the inline component that is
        // measurable only where paint order exists.
        const inlineRect = await rectOf(page.locator(`${INLINE_BUBBLE}.harness-inline-stacked`))
        const neighbour = await rectOf(page.locator('[data-harness="stack-inline-neighbour"]'))
        const inlinePaint = await paintOf(page.locator(`${INLINE_BUBBLE}.harness-inline-stacked`))
        expect(inlinePaint.zIndex).toBe(INLINE.OPEN_PAINT.zIndex)
        expect(neighbour.bottom, 'the neighbour must overlap the bubble for this to mean anything')
            .toBeGreaterThan(inlineRect.top)
        // `paintedTopmostAt`, not `topmostAt`: the bubble's `pointer-events: none` makes a plain
        // hit test report the neighbour BEHIND it, which read as "the bubble loses" for a bubble
        // that wins. The instrument was wrong, not the paint order.
        const overInline = await paintedTopmostAt(page, (inlineRect.left + inlineRect.right) / 2, inlineRect.top + 2)
        expect(overInline.inBubble, 'the inline bubble paints above the z-index 6 neighbour').toBe(true)
    })

    /**
     * DELETED WITH THE PORTAL, and the deletion is recorded here rather than silently: this test
     * pinned that Semantic's portal contributed no stacking of its own (`z-index: auto` on the
     * bubble, a fixed value on the popper wrapper), which was the other half of the invariant
     * above. There is no portal and no wrapper, so there is nothing left to measure — the bubble's
     * own `z-index: 9` is now the whole stacking story and the invariant above is the whole test.
     */
})

test.describe('harness: the dismissal contract, on a trigger with no action of its own', () => {
    // The corpus cannot express these cleanly: every tooltipped node there already owns its
    // `onClick`, so a click has two consumers (corpus.tooltip.pw.js records that). A plain
    // `<button>` isolates the component's own behaviour.
    /**
     * OBLIGATION 2 OF THE STEP, discharged as a removal and measured here — the plain `<button>` is
     * the only place it CAN be measured, because every tooltipped node in the corpus owns its own
     * `onClick`. Part 2 pinned `click opens with no delay, a second click closes`; the gesture
     * served the node's action and the tooltip at once, and the tooltip arrived after the action
     * had run.
     *
     * The pointer leaves immediately after the click, because a click cannot avoid hovering first
     * and a lingering pointer would open the bubble by HOVER 500 ms later — which is what made the
     * first attempt at this measurement inconclusive.
     */
    test('[I] a click does not open it at all — the gesture belongs to the trigger', async ({ page }) => {
        await section(page, 'plain')
        const trigger = page.locator('[data-harness-trigger="plain"]')
        const box = await trigger.boundingBox()

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.up()
        await page.mouse.move(4, 4)
        await expect(anyBubble(page)).not.toBeVisible()

        // And not by the focus the click leaves behind either — `onPointerDown` suppresses that
        // one focus-open, without which dropping the click gesture changed nothing a user sees.
        await page.waitForTimeout(TIMING.OPEN_BY_MS * 2)
        await expect(anyBubble(page)).not.toBeVisible()
        expect(await trigger.evaluate((element) => element === document.activeElement),
            'the trigger still takes focus normally; only the tooltip ignores it').toBe(true)
    })

    test('[I] a click outside closes it; Escape closes it', async ({ page }) => {
        await section(page, 'plain')
        const trigger = page.locator('[data-harness-trigger="plain"]')

        // Opened by HOVER, where part 2 opened by click: the click gesture is gone, and a
        // dismissal test that opens with it would fail on its setup and read as a dismissal
        // regression. Both dismissals below are the ones a keyboard user depends on.
        await trigger.hover()
        await expect(anyBubble(page)).toBeVisible({ timeout: TIMING.OPEN_BY_MS * 4 })
        await page.mouse.click(40, 700)
        await expect(anyBubble(page)).not.toBeVisible()

        await trigger.hover()
        await expect(anyBubble(page)).toBeVisible({ timeout: TIMING.OPEN_BY_MS * 4 })
        await page.keyboard.press('Escape')
        await expect(anyBubble(page)).not.toBeVisible()
    })
})

test.describe('harness: the convergence target — the in-house `Tooltip`', () => {
    test('[I] closed it is out of layout; open it paints', async ({ page }) => {
        await section(page, 'inline')

        const hover = page.locator(`${INLINE_BUBBLE}.harness-inline-hover`)
        expect(await paintOf(hover)).toMatchObject(INLINE.CLOSED_PAINT)

        // Revealed by CSS alone (`*:hover > &` in tooltip.less), with the same 0.5 s delay
        // `TooltipPop` implements in JavaScript — so the open delay carries over for free.
        await page.locator('[data-harness="inline-hover-host"]').hover()
        await expect
            .poll(async () => (await paintOf(hover)).display, { timeout: TIMING.OPEN_BY_MS * 2 })
            .toBe(INLINE.OPEN_PAINT.display)
        expect(INLINE.HOVER_REVEALS).toBe(true)

        // Deliberately NOT an opacity assertion: `.tooltip` reveals itself with
        // `animation: fade-in 0.5s forwards`, so opacity is a function of wall-clock time and of
        // whether the tab was ever backgrounded (measured: while hidden, every running animation
        // sits at currentTime 0 and this computes `opacity: 0` — an artefact, not a defect).
        const paint = await paintOf(hover)
        expect(paint).toMatchObject(INLINE.OPEN_PAINT)
        expect(paint.borderTopWidth).not.toBe('0px')
        expect(paint.paddingTop).not.toBe('0px')
    })

    test('[I] the arrow is a real `::after` pseudo-element with a border', async ({ page }) => {
        await section(page, 'inline')
        const arrow = await page.locator(`${INLINE_BUBBLE}.harness-inline-shown`).evaluate((element) => {
            const after = getComputedStyle(element, '::after')
            const before = getComputedStyle(element, '::before')
            return { afterContent: after.content, afterBorderLeftWidth: after.borderLeftWidth, beforeContent: before.content }
        })
        expect(INLINE.ARROW_PSEUDO).toBe('::after')
        expect(arrow.afterContent).not.toBe('none')
        expect(arrow.afterBorderLeftWidth).not.toBe('0px')
        // ...unlike the popup's, which is a `::before`. Naming the difference so part 2 does not
        // carry the popup's arrow selectors over by reflex.
        expect(arrow.beforeContent).toBe('none')
    })

    test('[I] all eight placements put the bubble clear of its host, on the side it asked for', async ({ page }) => {
        await section(page, 'placements')

        // FINDING 4 in reference.js, and the most consequential thing this leg produced — now
        // CLOSED. Part 2 measured four of the eight working: the corner combinations put the
        // bubble ON its own trigger, because `.tooltip.left`/`.tooltip.right` set `top: 50%` at the
        // same specificity as `.tooltip.top`/`.tooltip.bottom`, so a corner class string matched
        // both and the axis came out over-constrained. Part 3 fixed it in `tooltip.less` by writing
        // the losing offset back per corner rather than by raising specificity.
        //
        // Two of the eight were never broken at all: see `alignedToSide` below.
        //
        // Invisible to jsdom, which resolves neither the cascade nor over-constrained absolute
        // positioning — which is the whole reason this leg exists.
        const measured = {}
        const overlapping = []
        for (const name of Object.keys(INLINE.PLACEMENT_WORKS)) {
            const host = await rectOf(page.locator(`[data-harness="place-${name}"]`))
            const rect = await rectOf(page.locator(`${INLINE_BUBBLE}.harness-place-${name}`))
            const overlapsHost = !(rect.right <= host.left || rect.left >= host.right
                || rect.bottom <= host.top || rect.top >= host.bottom)
            if (overlapsHost) overlapping.push(name)

            const [axis, side] = name.split('-')
            const placedOnRequestedSide = {
                top: () => rect.bottom <= host.top + 1,
                bottom: () => rect.top >= host.bottom - 1,
                left: () => rect.right <= host.left + 1,
                right: () => rect.left >= host.right - 1,
            }
            // A corner asks for BOTH: `top left` means above the host AND aligned to its left
            // edge, never merely "to the left of it" — and `top right` means aligned to its RIGHT
            // edge. Part 2 checked `rect.left === host.left` for all four corners, which a right
            // corner cannot satisfy by definition, so `top right` and `bottom right` were reported
            // broken while being placed correctly. That false negative outlived the CSS fix and is
            // why this map read 6/8 rather than 8/8.
            const alignedToSide = () => (side === 'right'
                ? Math.abs(rect.right - host.right) < 2
                : Math.abs(rect.left - host.left) < 2)
            measured[name] = side
                ? placedOnRequestedSide[axis]() && alignedToSide()
                : placedOnRequestedSide[axis]()
        }
        expect(measured).toEqual(INLINE.PLACEMENT_WORKS)
        expect(overlapping.sort()).toEqual([...INLINE.PLACEMENTS_OVERLAPPING_HOST].sort())
    })

    test('[I] the five snapshot-gated `slider` bubbles are painted and sit above their handles', async ({ page }) => {
        // The only production use site of the convergence target, and nothing gated it in a browser
        // before this. `top` (not `top left`), so it is one of the four placements that work.
        await page.goto('/examples#slider')
        await page.locator('#slider.expanded').waitFor()
        const bubbles = page.locator(`#slider ${INLINE_BUBBLE}`)
        await expect(bubbles).toHaveCount(INLINE.SLIDER_TOOLTIP_COUNT)

        for (let i = 0; i < INLINE.SLIDER_TOOLTIP_COUNT; i += 1) {
            const one = bubbles.nth(i)
            await expect(one).toHaveClass(INLINE.SLIDER_CLASS)
            const geometry = await one.evaluate((element) => {
                const rect = element.getBoundingClientRect()
                const host = element.parentElement.getBoundingClientRect()
                return { gapAbove: host.top - rect.bottom, hostClass: element.parentElement.className }
            })
            expect(geometry.hostClass).toContain(INLINE.SLIDER_HOST_CLASS)
            expect(geometry.gapAbove, `slider bubble ${i} must sit above its handle`).toBeGreaterThan(-2)
            expect(await paintOf(one)).toMatchObject(INLINE.OPEN_PAINT)
        }
    })
})
