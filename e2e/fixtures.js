/**
 * SHARED FIXTURES AND MEASUREMENT HELPERS for the browser leg.
 * =============================================================================================
 *
 * Three jobs:
 *   1. remove the two known sources of flake before any spec can trip over them;
 *   2. give every spec ONE way to ask a geometric question, so two specs cannot disagree about
 *      what "adjacent" or "clipped" means;
 *   3. carry the keyboard/a11y probes that §9.5 needs for the tooltip now and for the `Dropdown`
 *      matrix at step 3 — they are deliberately written against roles and computed geometry, not
 *      against the tooltip, so step 3 reuses them unchanged.
 *
 * FLAKE SOURCE 1 — `public/index.html` loads Roboto and Open Sans from fonts.googleapis.com. A
 * font that arrives late, or not at all, changes text metrics and therefore the bubble's width. The
 * request is aborted here so every run uses the same fallback face, and NO assertion anywhere in
 * e2e/ pins an absolute width or height. Relations only: adjacency, containment, paint order.
 *
 * FLAKE SOURCE 2 — animations. `.tooltip` in tooltip.less reveals itself with
 * `animation: @speed-base forwards fade-in`, so `opacity` is a function of wall-clock time and of
 * whether the tab was ever backgrounded (measured: with the page hidden, all running animations sit
 * at currentTime 0 and the in-house tooltip computes `opacity: 0` — an artefact, not a defect).
 * Nothing here asserts opacity. Visibility is asserted through `display`, `background`,
 * `border-width` and `elementFromPoint`, all of which the animation does not touch.
 */
const { test: base, expect } = require('@playwright/test')

const FONT_HOSTS = ['**://fonts.googleapis.com/**', '**://fonts.gstatic.com/**']
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

/** The portaled semantic-ui-react bubble, wherever it lands. Use in `[R]` tests only. */
const BUBBLE = 'div[data-suir-portal="true"] div.ui.popup'
/** The in-house inline bubble (`src/core/components/Tooltip.js`). */
const INLINE_BUBBLE = 'span.tooltip'
/**
 * Either shape. **Every `[I]` test must use this, not `BUBBLE`.**
 *
 * Review caught the reason: with the interaction assertions hard-wired to the portal selector,
 * simulating the planned convergence onto the inline `Tooltip` failed seven `[I]` tests that are
 * genuine obligations — the delay, the cancel, the pointer-leave, the click-outside and Escape —
 * purely because the locator could not see an inline bubble. A reference that fails on the change
 * it was built to judge is a tripwire on the plan, not a gate.
 */
const ANY_BUBBLE = `${BUBBLE}, ${INLINE_BUBBLE}`

/**
 * WHY THE `[I]` TESTS ASSERT VISIBILITY, NOT PRESENCE
 * -----------------------------------------------------------------------------
 * The two implementations use different models, and presence is an artefact of one of them:
 * semantic-ui-react mounts the bubble into a portal on open and unmounts it on close, while the
 * in-house `Tooltip` renders its `<span>` unconditionally and lets CSS decide — `display: none`
 * by default, `display: flex` under `.show` or a hovered parent (`src/style/components/tooltip.less`).
 *
 * So `toHaveCount(1)` / `toHaveCount(0)` cannot express "open" across both: against the inline
 * component the node is ALWAYS there, and every closed-state assertion would fail forever.
 * Measured — with presence assertions, simulating the planned convergence failed seven `[I]`
 * tests that are real obligations.
 *
 * `toBeVisible()` is true for both: a portal that is absent counts as not visible, and so does a
 * `display: none` span. It is also the better statement of the contract — what a user can see is
 * the promise; which node exists is an implementation detail.
 */

const test = base.extend({
    /** Auto: block the webfonts for every test in the leg. */
    blockWebfonts: [async ({ context }, use) => {
        await Promise.all(FONT_HOSTS.map((pattern) => context.route(pattern, (route) => route.abort())))
        await use(undefined)
    }, { auto: true }],

    /**
     * Every uncaught page error and console error, in order. Exposed as data rather than enforced
     * as a rule, because the corpus tooltip currently THROWS on open and this leg's job is to
     * record that at its measured value, not to fail on it. Specs assert against
     * `reference.js` instead.
     */
    pageErrors: async ({ page }, use) => {
        const errors = []
        page.on('pageerror', (error) => errors.push({ kind: 'pageerror', message: String(error.message), stack: String(error.stack || '') }))
        page.on('console', (message) => {
            if (message.type() !== 'error') return
            // The fonts this leg deliberately aborts surface as a console error of their own. Keeping
            // them would mean every assertion about product errors had to know about our own route
            // handler, so they are dropped by ORIGIN rather than by message text — a real resource
            // failure from any other host still lands in the list.
            const from = (message.location() || {}).url || ''
            if (FONT_ORIGINS.some((origin) => from.startsWith(origin))) return
            errors.push({ kind: 'console', message: message.text(), stack: '' })
        })
        await use(errors)
    },
})

/** Full viewport-relative rect (Playwright's boundingBox omits right/bottom). */
async function rectOf (locator) {
    return locator.evaluate((element) => {
        const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect()
        return { x, y, width, height, top, right, bottom, left }
    })
}

/**
 * How the bubble sits relative to its trigger, as plain numbers a failure message can read.
 * `gapAbove` is positive when the bubble is fully above the trigger (what `top left` should give);
 * `overlapX` is the width of the shared horizontal band, so 0 means "not over the trigger at all".
 */
function adjacency (bubble, trigger) {
    return {
        gapAbove: Math.round(trigger.top - bubble.bottom),
        gapBelow: Math.round(bubble.top - trigger.bottom),
        overlapX: Math.round(Math.max(0, Math.min(bubble.right, trigger.right) - Math.max(bubble.left, trigger.left))),
        centreDistance: Math.round(Math.hypot(
            (bubble.left + bubble.right) / 2 - (trigger.left + trigger.right) / 2,
            (bubble.top + bubble.bottom) / 2 - (trigger.top + trigger.bottom) / 2,
        )),
    }
}

/** Every ancestor that can clip, innermost first, with its computed overflow and client rect. */
async function clipAncestorsOf (locator) {
    return locator.evaluate((element) => {
        const out = []
        for (let node = element.parentElement; node; node = node.parentElement) {
            const style = getComputedStyle(node)
            const overflow = `${style.overflowX} ${style.overflowY}`
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
            const { top, right, bottom, left } = node.getBoundingClientRect()
            out.push({
                tag: node.tagName.toLowerCase(),
                className: typeof node.className === 'string' ? node.className : '',
                overflow,
                rect: { top, right, bottom, left },
            })
        }
        return out
    })
}

/** True when `inner` lies inside `outer`, allowing `slack` px of rounding. */
function isWithin (inner, outer, slack = 1) {
    return inner.left >= outer.left - slack
        && inner.right <= outer.right + slack
        && inner.top >= outer.top - slack
        && inner.bottom <= outer.bottom + slack
}

/** The subset of computed style this leg cares about — "does it paint", not "what colour". */
async function paintOf (locator) {
    return locator.evaluate((element) => {
        const style = getComputedStyle(element)
        const before = getComputedStyle(element, '::before')
        return {
            display: style.display,
            position: style.position,
            backgroundColor: style.backgroundColor,
            borderTopWidth: style.borderTopWidth,
            paddingTop: style.paddingTop,
            boxShadow: style.boxShadow,
            maxWidth: style.maxWidth,
            zIndex: style.zIndex,
            beforeContent: before.content,
        }
    })
}

/** Whether the widget's scoped CSS can reach this node at all. */
async function isInsideWidget (locator) {
    return locator.evaluate((element) => ({
        insideUiRender: element.closest('.ui-render') !== null,
        portalParent: element.closest('[data-suir-portal="true"]')
            ? (element.closest('[data-suir-portal="true"]').parentElement || {}).tagName || null
            : null,
    }))
}

/** Who paints at a point — the stacking question, with no pixel baseline involved. */
async function topmostAt (page, x, y) {
    return page.evaluate(([px, py]) => {
        const element = document.elementFromPoint(px, py)
        if (!element) return null
        return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            harness: element.closest('[data-harness]') ? element.closest('[data-harness]').dataset.harness : null,
            inBubble: element.closest('div.ui.popup') !== null || element.closest('span.tooltip') !== null,
        }
    }, [Math.round(x), Math.round(y)])
}

/**
 * `topmostAt`, but able to see a tooltip bubble.
 *
 * WHY THIS EXISTS, because it looks like a workaround and is not: `tooltip.less` gives the bubble
 * `pointer-events: none` — the step's own hazard fix, without which the bubble sits under the
 * pointer, `mouseleave` fires on the host and the tooltip flickers. Hit-testing skips such
 * elements ENTIRELY, so `document.elementFromPoint` over a bubble reports whatever is behind it.
 * A paint assertion built on plain hit-testing therefore inverts silently: it reads `false` for a
 * bubble that is painted perfectly, which is exactly how the stacking and clipping invariants
 * broke when the bubble stopped being a portal.
 *
 * Paint order does not depend on `pointer-events`, so this re-enables it for the duration of the
 * probe and puts the previous inline value back. Anything asserting that a bubble IS or IS NOT
 * painted at a point must use this; `topmostAt` remains correct for everything else.
 */
async function paintedTopmostAt (page, x, y) {
    const bubbles = page.locator('span.tooltip, div.ui.popup')
    const restore = await bubbles.evaluateAll((elements) => elements.map((element) => {
        const previous = element.style.pointerEvents
        element.style.pointerEvents = 'auto'
        return previous
    }))
    try {
        return await topmostAt(page, x, y)
    } finally {
        await bubbles.evaluateAll((elements, previous) => {
            elements.forEach((element, index) => { element.style.pointerEvents = previous[index] })
        }, restore)
    }
}

/** A short description of whatever currently has focus. Shared with step 3's matrix. */
async function activeElement (page) {
    return page.evaluate(() => {
        const element = document.activeElement
        if (!element) return null
        return {
            tag: element.tagName.toLowerCase(),
            role: element.getAttribute('role'),
            type: element.getAttribute('type'),
            harness: element.getAttribute('data-harness') || element.getAttribute('data-harness-trigger'),
            text: (element.textContent || '').trim().slice(0, 40),
            describedBy: element.getAttribute('aria-describedby'),
            tabIndex: element.tabIndex,
        }
    })
}

/** Press Tab `steps` times and report where focus landed each time. */
async function tabThrough (page, steps) {
    const stops = []
    for (let i = 0; i < steps; i += 1) {
        await page.keyboard.press('Tab')
        stops.push(await activeElement(page))
    }
    return stops
}

/**
 * The screen-reader wiring a tooltip owes, read off the live tree. Returns data, never a verdict —
 * the current tooltip fails all three and this leg records that rather than failing on it.
 */
async function tooltipA11yWiring (page, trigger) {
    const describedBy = await trigger.getAttribute('aria-describedby')
    const roleTooltipCount = await page.locator('[role="tooltip"]').count()
    // `ANY_BUBBLE`, not `BUBBLE`: the SUIR selector matches nothing since the tooltip went
    // in-house, so this helper timed out for every caller — and the `roleTooltipCount: 0`
    // assertions built on it would have passed for the wrong reason.
    const bubbleId = await page.locator(ANY_BUBBLE).first().getAttribute('id')
    return {
        triggerAriaDescribedBy: describedBy,
        roleTooltipCount,
        bubbleId,
        wired: Boolean(describedBy) && describedBy === bubbleId && roleTooltipCount > 0,
    }
}

module.exports = {
    test,
    expect,
    BUBBLE,
    INLINE_BUBBLE,
    ANY_BUBBLE,
    rectOf,
    adjacency,
    clipAncestorsOf,
    isWithin,
    paintOf,
    isInsideWidget,
    topmostAt,
    paintedTopmostAt,
    activeElement,
    tabThrough,
    tooltipA11yWiring,
}
