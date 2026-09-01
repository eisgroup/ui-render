/**
 * TOOLTIP INTERACTION CONTRACT ================================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2, part 1. The companion to `TooltipPop.test.js`:
 * that file pins the markup, this one pins WHAT OPENS AND CLOSES THE TOOLTIP,
 * expressed as behaviour so it survives step 2's deliberate DOM change the way the
 * layer-(2) suites survived step 1.
 *
 * Every assertion here is written against visible text and elapsed milliseconds.
 * No className, no element shape, no `querySelector` on a structural class — the
 * one exception is `.popup`, used only where the test's subject IS the bubble as a
 * pointer target ("moving onto the bubble", "clicking inside it"), which cannot be
 * expressed any other way while the bubble carries no role and no accessible name.
 * When step 2 gives it `role="tooltip"`, those three lookups become `getByRole`.
 *
 * WHY A SEPARATE FILE FROM `UIRender.overlay-behavior.test.js`
 * -----------------------------------------------------------------------------
 * That suite drives meta through the whole engine, which is the right level for
 * "the contract a meta author is promised" and is deliberately kept to the three
 * paths meta can express. It cannot reach the rest of the surface: SUIR's `on`
 * default means a CLICK also opens the tooltip and `Escape` closes it, and neither
 * is expressible from meta. Those paths are the ones a hover-only rewrite drops
 * silently, so they need a home — this one.
 *
 * MEASURED IDENTICAL ON REACT 16.14, 17.0.2 AND 18.3 (the three CI legs). Every
 * timing figure below is exact, not a bound: the test asserts closed at t-1 and
 * open at t, so a replacement that is merely "fast enough" fails.
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
const bubble = () => document.querySelector('.popup')
const portals = () => [...document.querySelectorAll('[data-suir-portal="true"]')]

/**
 * Render, assert, then ALWAYS close and unmount inside the test — see the same
 * helper in `TooltipPop.test.js` for why an open tooltip at unmount aborts the
 * jest worker rather than failing a test.
 */
const drive = (props, assertions, children = <button type="button">{TRIGGER}</button>) => {
    const view = render(<TooltipPop {...props}>{children}</TooltipPop>)
    const trigger = view.container.firstChild
    try {
        assertions({ ...view, trigger })
    } finally {
        fireEvent.mouseLeave(trigger)
        fireEvent.blur(trigger)
        fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
        advance(1000)
        view.unmount()
    }
}

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('what opens the tooltip', () => {
    /**
     * The 500 ms is the wrapper's one deliberate UX decision — SUIR's own default
     * is 50 ms — and it wins only because `TooltipPop` spreads its rest bag AFTER
     * `Popup`'s portal defaults. Asserted at the boundary, so both halves are
     * pinned: nothing at 499, open at 500, and nothing at 50 either (which is what
     * would show if the override stopped taking effect).
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
     * NOT A FEATURE ANYONE ASKED FOR — a consequence of SUIR's `on` defaulting to
     * `['click', 'hover']`, and the single most likely thing a hover-only rewrite
     * drops without noticing. Nothing in the repo gated it before this file.
     * Step 2 must decide explicitly: reproduce it, or drop it and say so.
     */
    it('also opens on a single click, instantly, with no delay at all', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.click(trigger)

            expect(isOpen()).toBe(true)
        })
    })

    it('does not open on focus, and not on Enter or Space', () => {
        // The other half of the a11y gap: pointer-only. Kept as a tripwire — when
        // step 2 adds focus-open this fails, and that is the signal to invert it.
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.focus(trigger)
            advance(1000)
            expect(isOpen()).toBe(false)

            fireEvent.keyDown(trigger, { key: 'Enter', keyCode: 13 })
            fireEvent.keyDown(trigger, { key: ' ', keyCode: 32 })
            advance(1000)
            expect(isOpen()).toBe(false)
        })
    })

    it('opens on focus as soon as `on` says so — the fix is one prop wide', () => {
        // Recorded because it sizes step 2's a11y work: the trigger events are
        // configuration, not missing code. `blur` then closes it.
        drive({ title: TITLE, on: ['hover', 'focus'] }, ({ trigger }) => {
            fireEvent.focus(trigger)
            expect(isOpen()).toBe(true)

            fireEvent.blur(trigger)
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

    it('closes on a second click of the trigger', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.click(trigger)
            expect(isOpen()).toBe(true)

            fireEvent.click(trigger)
            expect(isOpen()).toBe(false)
        })
    })

    it('closes on a click anywhere else in the document', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.click(trigger)
            expect(isOpen()).toBe(true)

            fireEvent.click(document.body)
            expect(isOpen()).toBe(false)
        })
    })

    it('does NOT close on a click inside the bubble', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.click(trigger)
            fireEvent.click(bubble())

            expect(isOpen()).toBe(true)
        })
    })

    /**
     * The one dismissal path that works without a pointer, so it is the only thing
     * standing between today's tooltip and "cannot be dismissed from the keyboard".
     * Delivered through a document-level `keydown` listener, so it fires with focus
     * on an unrelated element — asserted that way on purpose.
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

    /**
     * A real usability defect, pinned so a replacement does not inherit it by
     * accident: the bubble is not `hoverable`, so `handlePortalMouseEnter` returns
     * before it can clear the leave timer. The text cannot be selected, and a
     * tooltip containing a link would be unreachable.
     */
    it('closes even when the pointer moves from the trigger onto the bubble', () => {
        drive({ title: TITLE }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)

            fireEvent.mouseLeave(trigger)
            fireEvent.mouseEnter(bubble())
            advance(70)

            expect(isOpen()).toBe(false)
        })
    })

    it('stays open on the bubble when `hoverable` is passed', () => {
        drive({ title: TITLE, hoverable: true }, ({ trigger }) => {
            fireEvent.mouseEnter(trigger)
            advance(500)

            fireEvent.mouseLeave(trigger)
            fireEvent.mouseEnter(bubble())
            advance(1000)

            expect(isOpen()).toBe(true)
        })
    })
})

describe('the trigger keeps its own behaviour', () => {
    /**
     * SUIR clones the trigger with six props of its own
     * (`onBlur onClick onFocus onMouseEnter onMouseLeave ref`). A trigger that
     * already has handlers must keep them: the corpus's two tooltips are on
     * `Button`s, and a swallowed `onClick` would be a silent regression in a
     * button that still looks and reads correctly.
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
    it('unmounts cleanly with an open timer still pending, leaving no portal behind', () => {
        const view = render(
            <TooltipPop title={TITLE}><button type="button">{TRIGGER}</button></TooltipPop>
        )
        fireEvent.mouseEnter(view.container.firstChild)
        advance(100)

        expect(() => view.unmount()).not.toThrow()
        advance(5000)
        expect(portals()).toEqual([])
        expect(isOpen()).toBe(false)
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
})
