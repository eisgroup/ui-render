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
const { test, expect, BUBBLE } = require('./fixtures')
const { TOUCH, TIMING } = require('./reference')

test('[R] one tap opens the bubble, a second tap closes it', async ({ page }) => {
    await page.goto('/harness/tooltip?section=plain')
    await page.locator('[data-harness-section="plain"]').waitFor()
    const trigger = page.locator('[data-harness-trigger="plain"]')

    expect(await page.locator(BUBBLE).count()).toBe(0)

    await trigger.tap()
    expect(TOUCH.FIRST_TAP).toBe('opens')
    await expect(page.locator(BUBBLE)).toHaveCount(1, { timeout: TIMING.CLICK_OPENS_WITHIN_MS })

    await trigger.tap()
    expect(TOUCH.SECOND_TAP).toBe('closes')
    await expect(page.locator(BUBBLE)).toHaveCount(0)
})

test('[R] a tap on a corpus node opens it too, so the node\'s own action shares the gesture', async ({ page }) => {
    // The same collision corpus.tooltip.pw.js records for the mouse, on the input method where a
    // user has no way to hover instead: every tooltipped node in the corpus already owns its
    // `onClick`, so on a touch device the tooltip and the action are triggered by one gesture.
    await page.goto('/examples#buttonIcon')
    await page.locator('#buttonIcon.expanded').waitFor()
    const trigger = page.locator('#buttonIcon button.button').first()

    await trigger.tap()
    await expect(page.locator(BUBBLE)).toHaveCount(1, { timeout: TIMING.OPEN_BY_MS * 2 })
    await expect(page.locator(BUBBLE).first()).toHaveText('Open popup')
})
