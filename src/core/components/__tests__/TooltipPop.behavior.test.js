/**
 * TOOLTIP INTERACTION CONTRACT ================================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2. The companion to `TooltipPop.test.js`: that file pins
 * the markup, this one pins WHAT OPENS AND CLOSES THE TOOLTIP, expressed as behaviour
 * so it survives a deliberate DOM change the way the layer-(2) suites survived step 1.
 *
 * IT DID SURVIVE, AND THAT IS THE POINT OF HAVING WRITTEN IT FIRST
 * -----------------------------------------------------------------------------
 * Part 1 wrote these 17 clauses against `semantic-ui-react`'s `Popup`. Part 3 replaced
 * the component wholesale — no portal, no popper, no cloned trigger — and ten of them
 * pass VERBATIM, including both 499/500 boundaries, the cancel, the 70 ms close,
 * Escape from an unrelated element, the click-outside, the click-inside and the
 * trigger's own handlers. The reason is mechanical and worth recording: React
 * synthesises `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` on an ANCESTOR from
 * events dispatched on the inner trigger (`@testing-library/react` fires `mouseOver`
 * alongside `mouseEnter` and `focusIn` alongside `focus` for exactly this reason), so
 * moving the handlers from the cloned trigger to a wrapper `<span>` is invisible to
 * every `fireEvent.mouseEnter(trigger)` in this file.
 *
 * WHAT CHANGED, AND WHERE IT IS RECORDED
 * -----------------------------------------------------------------------------
 * Four clauses described `Popup`'s configuration rather than the tooltip's promise, and
 * each one is replaced by an assertion of what is true now — never by a deletion:
 *   `also opens on a single click`   -> click-to-open is REMOVED (see the clause below
 *   `closes on a second click`          for why, and the changelog for the decision).
 *   `opens on focus as soon as `on`     -> focus-open is the DEFAULT now, so the prop
 *      says so`                          that used to configure it is gone.
 *   `stays open when `hoverable``       -> a SUIR prop with no equivalent; the bubble is
 *                                         `pointer-events: none` instead.
 *
 * MEASURED IDENTICAL ON REACT 16.14, 17.0.2 AND 18.3 (the three CI legs). Every timing
 * figure below is exact, not a bound: the test asserts closed at t-1 and open at t, so
 * a replacement that is merely "fast enough" fails.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TooltipPop from '../TooltipPop'

const TITLE = 'Discards every unsaved change'
const TRIGGER = 'Reset'

const advance = ms => act(() => { jest.advanceTimersByTime(ms) })
const isOpen = () => screen.queryByText(TITLE) !== null
/** The bubble as a POINTER TARGET, which is the only reason a structural lookup is used. */
const bubble = () => document.querySelector('.tooltip')

/**
 * Render, assert, then always close and unmount inside the test.
 *
 * Under SUIR this was load-bearing: an open tooltip at unmount left queued work against
 * a detached node and aborted the jest worker. The replacement tears itself down, so
 * this is now hygiene — it keeps `document`'s listener set and the fake-timer queue
 * clean between clauses. `finally` means a FAILING assertion still reports as a failure.
 */
const drive = (props, assertions, children = <button type="button">{TRIGGER}</button>) => {
    const view = render(<TooltipPop {...props}>{children}</TooltipPop>)
    const host = view.container.firstChild
    const trigger = host.firstChild
    try {
        assertions({ ...view, host, trigger })
    } finally {
        fireEvent.mouseLeave(trigger)
        fireEvent.blur(trigger)
        advance(1000)
        view.unmount()
    }
}

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('what opens the tooltip', () => {
    /**
     * THE 500 ms, AND OBLIGATION 1 OF THE STEP. It is the wrapper's one deliberate UX
     * decision — Semantic's own default was 50 ms — and part 3 had to keep it in
     * JavaScript, because the CSS reveal `tooltip.less` ships cannot be delayed:
     * `*:hover > .tooltip` sets `animation-delay: @speed-base`, but the later `.fade-in`
     * rule it extends sets the `animation` SHORTHAND, which resets the delay to `0s`
     * (measured computed style: `animationDelay: "0s"`, `display: flex` at t=0). The
     * component mounts the bubble only while open, so the rule cannot fire early.
     *
     * Asserted at the boundary, so both halves are pinned: nothing at 499, open at 500,
     * and nothing at 50 either — which is what would show if the delay stopped being
     * ours.
     */
    it('opens on hover at exactly 500 ms, not at Semantic\'s 50', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)

            advance(50)
            expect(isOpen()).toBe(false)
            advance(449)
            expect(isOpen()).toBe(false)
            advance(1)
            expect(isOpen()).toBe(true)
        })
    })

    it('honours a caller delay of 0 by opening on the next tick', () => {
        drive({ title: TITLE, delay: 0 }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(0)

            expect(isOpen()).toBe(true)
        })
    })

    /**
     * OBLIGATION 2, DECIDED: CLICK-TO-OPEN IS REMOVED.
     *
     * REPLACES `also opens on a single click, instantly, with no delay at all`, which
     * part 1 wrote as a tripwire because it was "the single most likely thing a
     * hover-only rewrite drops without noticing". It was not dropped without noticing;
     * it was dropped on evidence, and this clause is the record.
     *
     * It was never a feature anyone asked for — it fell out of SUIR's `on` defaulting to
     * `['click', 'hover']` — and the browser leg measured why it is harmful HERE: every
     * tooltipped node in the corpus already owns its `onClick` (`onClick: 'popup'` on
     * `buttonIcon`, `onClick: 'reset'` on the `all` example's Reset), so one gesture
     * fired both the node's action and the tooltip, and the tooltip arrived AFTER the
     * action had run. On touch, where there is no hover, that was the only gesture
     * available. The keyboard consequence — click was also the only non-pointer way in —
     * is answered by focus-open below, not left open.
     */
    it('does NOT open on a click, and a click does not close an open one either', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.click(trigger)
            advance(1000)
            expect(isOpen()).toBe(false)

            // ...and the other half of the same removal: `closes on a second click of the
            // trigger` is gone with it. A click on the trigger of an OPEN tooltip must be
            // inert, not a toggle — the node's own action already consumed the gesture.
            fireEvent.mouseEnter(trigger)
            advance(500)
            expect(isOpen()).toBe(true)
            fireEvent.click(trigger)
            expect(isOpen()).toBe(true)
        })
    })

    /**
     * FLIPPED. Part 1 pinned `does not open on focus` as "the other half of the a11y
     * gap: pointer-only. Kept as a tripwire — when step 2 adds focus-open this fails,
     * and that is the signal to invert it."
     *
     * It is not decoration: with click-to-open gone and hover unavailable to a keyboard,
     * focus is the ONLY keyboard path to the content. Without it the replacement would
     * be less accessible than the broken component it replaces.
     *
     * DELETED with it: `opens on focus as soon as `on` says so — the fix is one prop
     * wide`. That clause existed to size the work by showing `on: ['hover', 'focus']`
     * closed the gap immediately. There is no `on` prop now, because the behaviour it
     * selected is the default.
     */
    it('opens on focus with no delay, and closes on blur', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.focus(trigger)
            expect(isOpen()).toBe(true)

            fireEvent.blur(trigger)
            expect(isOpen()).toBe(false)
        })
    })

    /**
     * THE GUARD THAT MAKES THE CLICK REMOVAL REAL, and it exists because the browser leg
     * caught the omission: clicking a `<button>` focuses it, focus-open then showed the
     * bubble instantly, and the gesture served the node's own action AND the tooltip —
     * exactly the behaviour dropping `on: ['click', 'hover']` was meant to end. Measured
     * in Chrome before the fix: a bare mouse-down/up on `#buttonIcon` showed the bubble
     * with no dwell. jsdom could not have found it, because nothing here focuses on click;
     * it is pinned in both legs so neither half can regress alone.
     */
    it('does NOT open when focus arrives from a pointer, only when it arrives on its own', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.pointerDown(trigger)
            fireEvent.focus(trigger)
            advance(1000)
            expect(isOpen()).toBe(false)

            // ...and the suppression is for that one focus, not for the element: a blur
            // resets it, so the next keyboard focus opens normally.
            fireEvent.blur(trigger)
            fireEvent.focus(trigger)
            expect(isOpen()).toBe(true)
        })
    })

    /**
     * THE TOUCH HALF OF THE SAME REMOVAL. The browser leg found it: a tap synthesises the
     * compatibility mouse sequence, nothing follows to move the pointer away, so the
     * emulated hover sticks and the bubble appeared 500 ms after every tap — the click
     * gesture was gone and the collision was not.
     *
     * THE EVENT HAS TO BE BUILT BY HAND, and the reason is worth keeping: jsdom implements
     * no `PointerEvent`, so RTL falls back to `MouseEvent`, `pointerType` is not one of its
     * init keys, and `fireEvent.pointerOver(trigger, {pointerType: 'touch'})` delivers
     * `pointerType: null` — measured. Defining the property on a constructed event does
     * reach React's synthetic event, so this IS assertable here after all; an earlier note
     * in this file claiming otherwise was wrong.
     *
     * `pointerover`, not `pointerenter`: React derives the enter/leave pair from the
     * BUBBLING events at its root listener, and the non-bubbling one never arrives.
     */
    const pointerOver = (element, pointerType) => {
        const event = new MouseEvent('pointerover', { bubbles: true, cancelable: true })
        Object.defineProperty(event, 'pointerType', { value: pointerType })
        fireEvent(element, event)
    }

    it('does NOT open on a hover that a TOUCH pointer produced', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            pointerOver(trigger, 'touch')
            fireEvent.mouseEnter(trigger)
            advance(1000)
            expect(isOpen()).toBe(false)

            // ...and a real mouse afterwards is unaffected: leaving clears the flag.
            fireEvent.mouseLeave(trigger)
            pointerOver(trigger, 'mouse')
            fireEvent.mouseEnter(trigger)
            advance(500)
            expect(isOpen()).toBe(true)
        })
    })

    /**
     * The FAIL-OPEN, pinned because it is a real decision and the obvious alternative
     * spelling breaks it: the guard asks `=== 'touch'`, so an unknown pointer type still
     * opens on hover. Written as `!== 'mouse'` it would have suppressed every hover in
     * jsdom, in any browser without pointer events, and in this whole suite.
     */
    it('still opens on hover when the pointer type is unknown', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.pointerOver(trigger)
            fireEvent.mouseEnter(trigger)
            advance(500)
            expect(isOpen()).toBe(true)
        })
    })

    it('does not open on Enter or Space — focus is the keyboard path, not a keystroke', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.keyDown(trigger, { key: 'Enter', keyCode: 13 })
            fireEvent.keyDown(trigger, { key: ' ', keyCode: 32 })
            advance(1000)

            expect(isOpen()).toBe(false)
        })
    })

    it('can be driven open by the caller with `open`', () => {
        const view = render(
            <TooltipPop title={TITLE} open><button type="button">{TRIGGER}</button></TooltipPop>
        )
        try {
            expect(isOpen()).toBe(true)
        } finally {
            view.rerender(
                <TooltipPop title={TITLE} open={false}><button type="button">{TRIGGER}</button></TooltipPop>
            )
            view.unmount()
        }
    })

    it('lets the caller\'s `open` win over the pointer', () => {
        // Controlled means controlled: the component's own triggers stop deciding.
        drive({ title: TITLE, open: false }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(1000)

            expect(isOpen()).toBe(false)
        })
    })
})

describe('what closes the tooltip', () => {
    it('closes 70 ms after the pointer leaves — not immediately', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)

            fireEvent.mouseLeave(trigger)
            advance(69)
            expect(isOpen()).toBe(true)
            advance(1)
            expect(isOpen()).toBe(false)
        })
    })

    it('cancels a pending open when the pointer leaves before the delay elapses', () => {
        // The whole point of the 500 ms: a cursor passing over the control must not
        // flash the tooltip. A replacement that starts a timer and forgets to clear
        // it passes every "opens on hover" test and still fails this.
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(499)
            fireEvent.mouseLeave(trigger)

            advance(5000)
            expect(isOpen()).toBe(false)
        })
    })

    /**
     * REPLACES `closes even when the pointer moves from the trigger onto the bubble` —
     * the `hoverable: false` defect part 1 pinned so a replacement would not inherit it
     * by accident. The OUTCOME is preserved and the MECHANISM is different, so the
     * assertion had to move rather than be edited:
     *
     *   then  SUIR's `handlePortalMouseEnter` returned before it could clear the leave
     *         timer, so the bubble closed under the pointer.
     *   now   the bubble is `pointer-events: none` (`tooltip.less`, gated by
     *         `style/__tests__/css.tooltip-contract.test.js`) and paints OUTSIDE the
     *         wrapper's box, so a real pointer can never land on it: travelling towards
     *         it leaves the host and fires `mouseleave`. Measured in Chromium —
     *         `elementFromPoint` at the bubble's own centre returns the trigger, and
     *         `DISMISSAL.pointerMovesOntoBubble` still reads `'closes'`.
     *
     * jsdom cannot express any of that: it resolves no CSS, so `mouseEnter(bubble)` there
     * is a re-entry into the wrapper — which is a REAL contract of its own, and the one
     * asserted here. A pointer that clips the edge of the trigger and comes back must
     * not lose the tooltip.
     */
    it('cancels a pending close when the pointer returns before the 70 ms elapses', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)

            fireEvent.mouseLeave(trigger)
            advance(50)
            fireEvent.mouseEnter(trigger)
            advance(1000)

            expect(isOpen()).toBe(true)
        })
    })

    it('closes on a click anywhere else in the document', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            // Opened by HOVER, because the click path is gone — the one edit this clause needed.
            fireEvent.mouseEnter(trigger)
            advance(500)
            expect(isOpen()).toBe(true)

            fireEvent.click(document.body)
            expect(isOpen()).toBe(false)
        })
    })

    it('does NOT close on a click inside the bubble', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)
            fireEvent.click(bubble())

            expect(isOpen()).toBe(true)
        })
    })

    /**
     * OBLIGATION 3, HALF ONE. The dismissal path that works without a pointer, so it is
     * the only thing standing between the tooltip and "cannot be dismissed from the
     * keyboard" — and it is why the replacement has a `document` listener at all rather
     * than being pure CSS. Delivered through a document-level `keydown`, so it fires
     * with focus on an unrelated element; asserted that way on purpose. The
     * native-focus version of the same case is only answerable in a browser and is
     * pinned in `e2e/keyboard-a11y.pw.js`.
     */
    it('closes on Escape with focus on an unrelated element', () => {
        const outside = document.createElement('input')
        document.body.appendChild(outside)
        try {
            drive({ title: TITLE }, ({ trigger }) => {
                fireEvent.mouseEnter(trigger)
                advance(500)
                outside.focus()

                fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
                expect(isOpen()).toBe(false)
            })
        } finally {
            document.body.removeChild(outside)
        }
    })

    it('ignores every other key', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)

            fireEvent.keyDown(document, { key: 'Enter', keyCode: 13 })
            fireEvent.keyDown(document, { key: 'a' })

            expect(isOpen()).toBe(true)
        })
    })

    it('listens on the document only while open, so a closed tooltip ignores Escape', () => {
        // Not tidiness: `useEffect(..., [isOpen])` attaching unconditionally would leave
        // one `keydown` and one `click` listener per tooltip on the page for the life of
        // the tree, and a corpus meta can declare dozens.
        const listen = jest.spyOn(document, 'addEventListener')
        try {
            drive({ title: TITLE }, ({ trigger }) => {
                expect(listen).not.toHaveBeenCalled()

                fireEvent.mouseEnter(trigger)
                advance(500)
                expect(listen.mock.calls.map(call => call[0]).sort()).toEqual(['click', 'keydown'])

                fireEvent.mouseLeave(trigger)
                advance(70)
                fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
                expect(isOpen()).toBe(false)
            })
        } finally {
            listen.mockRestore()
        }
    })
})

describe('the trigger keeps its own behaviour', () => {
    /**
     * SUIR cloned the trigger with six props of its own
     * (`onBlur onClick onFocus onMouseEnter onMouseLeave ref`), so a trigger with
     * handlers of its own had to keep them — and a swallowed `onClick` would have been a
     * silent regression in a button that still looked and read correctly.
     *
     * Now trivially true, and kept anyway because "trivially true" is a property of the
     * implementation, not of the contract: nothing is cloned for behaviour, so the
     * handlers are the trigger's own. The one prop the component does add is
     * `aria-describedby`, and only while open — asserted in `TooltipPop.test.js`.
     */
    it('still fires the trigger\'s own handlers, in DOM order', () => {
        const calls = []
        const record = name => () => calls.push(name)
        const button = (
            <button
                type="button"
                onMouseEnter={record('enter')}
                onClick={record('click')}
                onFocus={record('focus')}
                onBlur={record('blur')}
                onMouseLeave={record('leave')}
            >{TRIGGER}</button>
        )

        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            fireEvent.click(trigger)
            fireEvent.focus(trigger)
            fireEvent.blur(trigger)
            fireEvent.mouseLeave(trigger)

            expect(calls).toEqual(['enter', 'click', 'focus', 'blur', 'leave'])
        }, button)
    })
})

describe('lifecycle', () => {
    it('unmounts cleanly with an open timer still pending, leaving nothing behind', () => {
        const view = render(
            <TooltipPop title={TITLE}><button type="button">{TRIGGER}</button></TooltipPop>
        )
        fireEvent.mouseEnter(view.container.firstChild.firstChild)
        advance(100)

        expect(() => view.unmount()).not.toThrow()
        advance(5000)
        // DELETED: `leaving no portal behind`. There is no portal; what has to be left
        // behind is nothing at all, which is the stronger statement and the reason the
        // close-and-unmount scaffolding in these files stopped being load-bearing.
        expect(document.querySelector('.tooltip')).toBeNull()
        expect(isOpen()).toBe(false)
    })

    it('unmounts cleanly while OPEN, which used to abort the jest worker', () => {
        // Recorded as a fixed defect rather than as a new feature: under SUIR a tooltip
        // still open when the tree came down left work queued against a detached node
        // and jsdom threw "The provided value is not of type 'Element'" from outside any
        // test, which aborted the whole worker instead of failing one assertion. Every
        // helper in these four suites exists because of it.
        const view = render(
            <TooltipPop title={TITLE}><button type="button">{TRIGGER}</button></TooltipPop>
        )
        fireEvent.mouseEnter(view.container.firstChild.firstChild)
        advance(500)
        expect(isOpen()).toBe(true)

        expect(() => view.unmount()).not.toThrow()
        advance(5000)
        expect(document.querySelector('.tooltip')).toBeNull()
    })

    it('reports the transitions through onOpen and onClose', () => {
        const calls = []
        drive({
            title: TITLE,
            onOpen: () => calls.push('open'),
            onClose: () => calls.push('close'),
        }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)
            fireEvent.mouseLeave(trigger)
            advance(70)

            expect(calls).toEqual(['open', 'close'])
        })
    })

    it('reports each transition once, however many times the same edge is driven', () => {
        // Four dismissal paths can all fire for one close (blur, mouseleave, Escape, an
        // outside click), so "once per transition" is a contract, not an implementation
        // detail: a consumer counting `onClose` calls would otherwise see three.
        const calls = []
        drive({
            title: TITLE,
            onOpen: () => calls.push('open'),
            onClose: () => calls.push('close'),
        }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)
            fireEvent.focus(trigger)
            expect(calls).toEqual(['open'])

            fireEvent.blur(trigger)
            fireEvent.click(document.body)
            fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
            advance(1000)

            expect(calls).toEqual(['open', 'close'])
        })
    })
})
