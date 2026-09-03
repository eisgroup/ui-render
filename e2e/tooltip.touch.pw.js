/**
 * TOUCH — the one §9.5 gap that needs a different browser context.
 * =============================================================================================
 *
 * §9.5: "no touch model ... on a `['click', 'hover']` overlay a tap fires BOTH paths". This file
 * runs under the `chromium-touch` project (`hasTouch: true`), which is what makes `tap()` dispatch
 * touch events at all — under the default project it would silently degrade to a mouse click and
 * the test would prove nothing.
 *
 * EMULATION, NOT A DEVICE. Chromium with `hasTouch` is not an iPhone: hover-on-touch heuristics and
 * iOS Safari's double-tap semantics are not covered, and §9.5 says so in the "what this leg still
 * cannot see" list. What IS covered is the thing the gap named — that the two configured `on`
 * handlers both see a single tap.
 */
const { test, expect, ANY_BUBBLE } = require('./fixtures')
const { TOUCH, TIMING } = require('./reference')

/**
 * INVERTED, and the consequence is stated rather than sold. Part 2 measured one tap firing both
 * configured `on` handlers — the tooltip opened AND the node's own action ran — with a second tap
 * closing it. Dropping click-to-open removes the collision on the input method where a user has no
 * hover to fall back on, and the price is that a touch-only device now has no way to see a tooltip
 * at all.
 *
 * That is the same trade the desktop change makes: the tooltip is supplementary, the node's action
 * is not. It is also why the tooltip must never be the only place information lives — recorded in
 * `docs/SUPPORTED-PROPS.md` under `dropped.on` and in UPGRADE-PLAN §9.7-F1 step 2.
 *
 * The assertions use `ANY_BUBBLE`. With the old `BUBBLE` (the semantic-ui-react portal selector) an
 * absence assertion would match nothing whatever the component did, and pass for the wrong reason.
 */
test('[I] a tap does not open the bubble, so the gesture is the trigger\'s alone', async ({ page }) => {
    await page.goto('/harness/tooltip?section=plain')
    await page.locator('[data-harness-section="plain"]').waitFor()
    const trigger = page.locator('[data-harness-trigger="plain"]')

    expect(await page.locator(ANY_BUBBLE).count()).toBe(0)

    await trigger.tap()
    expect(TOUCH.FIRST_TAP).toBe('does nothing')
    // Well past both the click path (instant) and the hover path (500 ms), so this is "a tap does
    // not open it" rather than "not yet".
    await page.waitForTimeout(TIMING.OPEN_BY_MS * 2)
    await expect(page.locator(ANY_BUBBLE)).toHaveCount(0)

    await trigger.tap()
    expect(TOUCH.SECOND_TAP).toBe('does nothing')
    await expect(page.locator(ANY_BUBBLE)).toHaveCount(0)
})

test('[I] and a tap on a real corpus node runs its action without a tooltip', async ({ page }) => {
    // The corpus half of the same fact. Every tooltipped node here already owns its `onClick`, so
    // this is the site where the collision actually cost something.
    await page.goto('/examples#buttonIcon')
    await page.locator('#buttonIcon.expanded').waitFor()
    const trigger = page.locator('#buttonIcon button.button').first()

    await trigger.tap()
    await page.waitForTimeout(TIMING.OPEN_BY_MS * 2)
    await expect(page.locator(ANY_BUBBLE)).toHaveCount(0)
})
