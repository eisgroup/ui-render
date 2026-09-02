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
const { test, expect, BUBBLE, ANY_BUBBLE, INLINE_BUBBLE, rectOf, adjacency, isWithin, paintOf, topmostAt } = require('./fixtures')
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

        // `top left`: the bubble sits immediately above the trigger and shares its left edge. Stated
        // as relations, never as pixel values — the webfonts are blocked, so text metrics come from
        // whatever fallback face the platform provides and absolute widths are not portable.
        expect(near.gapAbove, `bubble should sit just above the trigger; measured ${JSON.stringify(near)}`)
            .toBeGreaterThanOrEqual(0)
        expect(near.gapAbove).toBeLessThan(8)
        expect(near.overlapX, 'the bubble must overlap the trigger horizontally').toBeGreaterThan(0)
        expect(bubbleRect.left).toBeCloseTo(triggerRect.left, 0)

        expect(pageErrors.filter((error) => error.kind === 'pageerror'), 'popper only throws when the reference element is null').toEqual([])
    })

    /**
     * Split out of the adjacency test above. That the bubble lands next to its trigger is the
     * obligation; that a popper WRAPPER received a transform to put it there is Semantic's
     * mechanism. An inline bubble has no wrapper at all, so asserting both in one body made a
     * genuine invariant unpassable after the planned convergence.
     */
    test('[R] and the coordinates arrive as a transform on a popper wrapper', async ({ page }) => {
        await section(page, 'plain')
        await open(page, 'plain')

        const transform = await bubble(page).evaluate((element) => getComputedStyle(element.parentElement).transform)
        expect(transform).not.toBe('none')
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
    test('[R] flip: with no room above, `top left` resolves to `bottom left` and the class says so', async ({ page }) => {
        await section(page, 'flip')
        const trigger = await open(page, 'flip')

        // THE flip-changes-the-className contract §9.5 names. The class carries popper's RESOLVED
        // placement, and in jsdom it is always the requested one, so this is the assertion no jest
        // suite can fake.
        await expect(bubble(page)).toHaveClass(BUBBLE_CLASS.bottomLeft)
        const near = adjacency(await rectOf(bubble(page)), await rectOf(trigger))
        expect(near.gapBelow, `flipped bubble should sit just below the trigger; measured ${JSON.stringify(near)}`)
            .toBeGreaterThanOrEqual(0)
        expect(near.gapBelow).toBeLessThan(8)
    })

    test('[R] horizontal overflow: flip changes the ALIGNMENT and keeps the bubble in the viewport', async ({ page }) => {
        await section(page, 'overflow')
        await open(page, 'overflow')

        // Corrects §9.7-F1 step 2's "flip yes, shift no". `preventOverflow` is indeed off
        // (`enabled: !!offset`, and nothing sets `offset`), but flip also flips the VARIATION, so a
        // right-edge trigger resolves `top left` to `top right` and the bubble stays on screen. The
        // parity bar for part 2 is therefore higher than "no overflow handling at all" — though the
        // handling comes free with any placement logic that picks a side.
        await expect(bubble(page)).toHaveClass(BUBBLE_CLASS.topRight)
        const rect = await rectOf(bubble(page))
        const viewport = page.viewportSize()
        expect(rect.right, 'the bubble stays inside the viewport').toBeLessThanOrEqual(viewport.width + 1)
        expect(rect.left).toBeGreaterThanOrEqual(0)
    })

    test('[R->I] clipping: the portal escapes an `overflow: hidden` box, the inline bubble does not', async ({ page }) => {
        await section(page, 'clip')
        const box = await rectOf(page.locator('[data-harness="clip"]'))
        const inlineRect = await rectOf(page.locator(`${INLINE_BUBBLE}.harness-inline-clipped`))
        await open(page, 'clipped')
        const bubbleRect = await rectOf(bubble(page))

        // The portaled bubble renders ABOVE the box's own top edge...
        expect(isWithin(bubbleRect, box), 'the portal is not confined to the box').toBe(false)
        expect(bubbleRect.top).toBeLessThan(box.top)
        // ...and is hit-testable there, so it is genuinely painted outside the clip.
        const outside = await topmostAt(page, (bubbleRect.left + bubbleRect.right) / 2, (bubbleRect.top + bubbleRect.bottom) / 2)
        expect(outside.inBubble, 'the portaled bubble paints outside the clip box').toBe(true)

        // The inline bubble's LAYOUT rect also leaves the box — `getBoundingClientRect()` ignores
        // clipping — but nothing of it is painted there. That difference is the single real cost of
        // going inline, and this is the assertion part 2 has to answer.
        expect(isWithin(inlineRect, box)).toBe(false)
        expect(inlineRect.right).toBeGreaterThan(box.right)
        const beyond = await topmostAt(page, box.right + 20, (inlineRect.top + inlineRect.bottom) / 2)
        expect(beyond.inBubble, 'the inline bubble is clipped: it does not paint outside its box').toBe(false)
    })

    test('[R] any scroll closes the bubble, and it flickers back ~50 ms later', async ({ page }) => {
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
        await expect(page.locator(BUBBLE)).toHaveCount(0, { timeout: TIMING.SCROLL_CLOSES_WITHIN_MS })
        await expect(page.locator(BUBBLE)).toHaveCount(1, { timeout: TIMING.SCROLL_REOPENS_BY_MS })
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
        const overInline = await topmostAt(page, (inlineRect.left + inlineRect.right) / 2, inlineRect.top + 2)
        expect(overInline.inBubble, 'the inline bubble paints above the z-index 6 neighbour').toBe(true)
    })

    /**
     * Split from the invariant above: the inline bubble winning at `z-index: 9` is the obligation,
     * while the portal's `auto` and its wrapper's z-index are Semantic's arrangement, which the
     * convergence deletes. Held together they made the invariant unpassable after the change.
     */
    test('[R] and the portal itself contributes no stacking of its own', async ({ page }) => {
        await section(page, 'stack')

        await open(page, 'stacked')
        const portalPaint = await paintOf(bubble(page))
        expect(portalPaint.zIndex).toBe('auto')
        const wrapperZ = await bubble(page).evaluate((element) => getComputedStyle(element.parentElement).zIndex)
        expect(wrapperZ).toBe(WIDGET.PORTAL_WRAPPER_Z_INDEX)
    })
})

test.describe('harness: the dismissal contract, on a trigger with no action of its own', () => {
    // The corpus cannot express these cleanly: every tooltipped node there already owns its
    // `onClick`, so a click has two consumers (corpus.tooltip.pw.js records that). A plain
    // `<button>` isolates the component's own behaviour.
    test('[R] click opens with no delay, a second click closes', async ({ page }) => {
        await section(page, 'plain')
        const trigger = page.locator('[data-harness-trigger="plain"]')
        await trigger.click()
        await expect(page.locator(BUBBLE)).toHaveCount(1, { timeout: TIMING.CLICK_OPENS_WITHIN_MS })
        await trigger.click()
        await expect(page.locator(BUBBLE)).toHaveCount(0)
    })

    test('[I] a click outside closes it; Escape closes it', async ({ page }) => {
        await section(page, 'plain')
        const trigger = page.locator('[data-harness-trigger="plain"]')

        await trigger.click()
        await expect(anyBubble(page)).toBeVisible({ timeout: TIMING.CLICK_OPENS_WITHIN_MS })
        await page.mouse.click(40, 700)
        await expect(anyBubble(page)).not.toBeVisible()

        await trigger.click()
        await expect(anyBubble(page)).toBeVisible({ timeout: TIMING.CLICK_OPENS_WITHIN_MS })
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

    test('[R->I] only four of the eight placements work, and `top left` is not one of them', async ({ page }) => {
        await section(page, 'placements')

        // FINDING 4 in reference.js, and the most consequential thing this leg produced. The plan
        // credits `tooltip.less` with an eight-placement vocabulary the replacement inherits.
        // Measured: `top`, `bottom`, `left`, `right` place the bubble clear of its host; the four
        // CORNER combinations do not, because `.tooltip.left`/`.tooltip.right` set `top: 50%` at the
        // same specificity as `.tooltip.top`/`.tooltip.bottom`. `top left` — the ONLY placement
        // `TooltipPop` uses in production — puts the bubble ON its own trigger.
        //
        // Invisible to jsdom, which resolves neither the cascade nor over-constrained absolute
        // positioning. Pinned at the broken value so this suite is green today; part 2 owes either a
        // `tooltip.less` fix or an explicit decision to restrict the vocabulary.
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
            // A corner asks for BOTH: `top left` means above the host AND aligned to its left edge,
            // never merely "to the left of it".
            measured[name] = side
                ? placedOnRequestedSide[axis]() && Math.abs(rect.left - host.left) < 2
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
