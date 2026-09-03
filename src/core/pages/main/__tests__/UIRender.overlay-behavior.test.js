/**
 * TOOLTIP AND MODAL-POPUP BEHAVIOURAL CONTRACT ================================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (2) — the gate for §9.7-F1 Step 2, the
 * `TooltipPop` replacement (portal + positioning + hover/focus triggers).
 *
 * WHAT WAS MISSING
 * -----------------------------------------------------------------------------
 * Tooltip: `components/__tests__/TooltipPop.test.js` mocks `semantic-ui-react`
 * away and asserts the props handed to SUIR's `Popup` (`mouseEnterDelay`, an
 * `inverted` flag, the function-title workaround). Nothing anywhere opens a
 * tooltip. After F1 Step 2 those prop assertions describe a component that no
 * longer exists, while "hovering shows the text, leaving hides it" — the only part
 * a user can observe — was never gated at all.
 *
 * Modal popup: the two halves were tested separately and never joined.
 * `rules.popup-actions` asserts the arguments `popupOpen` computes with
 * `setPopupState` stubbed; `components/__tests__/Popup.test.js` drives `isOpen`
 * directly; `providers/__tests__/AppProvider.context-state` tests the state
 * transitions. Nobody clicked a meta-declared button and looked for the content.
 *
 * Layer (1) explicitly does not cover either: it records that nothing renders into
 * a portal AT MOUNT TIME, and both of these only exist after an interaction.
 * -----------------------------------------------------------------------------
 */
import { act, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
    clearEngineGlobals,
    mountMeta,
    mountMetaWithAppState,
    noop,
    withPopupRoot,
} from '../../../../demo/testing/mountExample'

const TOOLTIP_TEXT = 'Discards every unsaved change'

/** `view: "Tooltip"` with a `label` and an element trigger — the shape `_meta.js` uses. */
const tooltipMeta = (extra = {}) => ({
    view: 'Row',
    items: [{
        view: 'Tooltip',
        label: TOOLTIP_TEXT,
        children: { view: 'Button', children: 'Reset' },
        ...extra,
    }],
})

describe('overlay behavioural contract', () => {
    let consoleError
    const originalFetch = global.fetch

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        clearEngineGlobals()
        consoleError.mockRestore()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    describe('Tooltip', () => {
        /**
         * The hover delay is a timer, so these clauses need fake ones.
         *
         * PART 3 NOTE — the teardown discipline is no longer a workaround. Under
         * `semantic-ui-react` a tooltip still OPEN when the tree came down left queued
         * work against a detached node and jsdom threw "The provided value is not of type
         * 'Element'" from outside any test, aborting the whole jest worker; doing the close
         * in `afterEach` was measured to be too late. Part 1's note ended "when F1 Step 2
         * replaces this with a portal the component owns and tears down itself, this
         * scaffolding can go — and the assertions inside it stay exactly as they are, which
         * is the point of the layer." Both halves came true: the replacement tears itself
         * down (`TooltipPop.behavior.test.js` asserts an open unmount directly), and eight
         * of these eleven clauses needed no edit at all. The helper is kept as hygiene, so
         * one clause's `document` listeners cannot reach the next.
         */
        const advance = ms => act(() => { jest.advanceTimersByTime(ms) })

        /**
         * Mount `tooltipMeta(extra)`, hand the trigger to `assertions`, then always
         * close the tooltip and unmount.
         */
        const withTooltip = (extra, assertions) => {
            const { unmount } = mountMeta(tooltipMeta(extra))
            const trigger = screen.getByRole('button', { name: 'Reset' })
            try {
                assertions(trigger)
            } finally {
                fireEvent.mouseLeave(trigger)
                fireEvent.blur(trigger)
                advance(1000)
                unmount()
            }
        }

        beforeEach(() => jest.useFakeTimers())
        afterEach(() => jest.useRealTimers())

        it('withholds the tooltip text until the hover delay has elapsed, then shows it', () => {
            withTooltip({}, trigger => {
                // Not merely invisible — absent. A tooltip in the document from mount
                // would be announced by a screen reader and found by a text search.
                expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()

                fireEvent.mouseEnter(trigger)
                advance(499)
                // The 500 ms default exists so a passing cursor does not flash the
                // tooltip; TooltipPop.js documents it as the deliberate UX choice, and
                // §9.7-F1 step 2's OBLIGATION 1 is that it survived the swap. It did, in
                // JavaScript — `tooltip.less`'s `*:hover > &` reveal has no delay and
                // cannot be given one, which is why the bubble is mounted only while open.
                expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()

                advance(1)
                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
            })
        })

        it('removes the tooltip text again when the pointer leaves', () => {
            withTooltip({}, trigger => {
                fireEvent.mouseEnter(trigger)
                advance(500)
                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()

                fireEvent.mouseLeave(trigger)
                advance(500)
                expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
            })
        })

        it('honours a meta-declared delay override', () => {
            withTooltip({ delay: 0 }, trigger => {
                fireEvent.mouseEnter(trigger)
                advance(0)
                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
            })
        })

        it('wires the open tooltip to its trigger for assistive technology', () => {
            // FLIPPED BY §9.7-F1 step 2 part 3. Part 1 pinned the negative and said so
            // explicitly: "when Step 2 adds them this test fails, and that failure is the
            // signal to replace it with the positive assertions (the trigger names the
            // bubble, the bubble carries role="tooltip", focus opens it) rather than to
            // delete it." All three are asserted now, here and in the clause below.
            //
            // It is a consequence of dropping click-to-open, not a bonus: click was the
            // only gesture a keyboard could reach, so without focus-open and the ARIA
            // relationship the replacement would be LESS accessible than the broken
            // component it replaced.
            withTooltip({}, trigger => {
                fireEvent.mouseEnter(trigger)
                advance(500)

                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
                const tip = screen.getByRole('tooltip')
                expect(tip).toHaveTextContent(TOOLTIP_TEXT)
                expect(trigger.getAttribute('aria-describedby')).toBe(tip.id)
            })
        })

        it('opens on keyboard focus as well as on hover, and closes on blur', () => {
            // The other half of the same flip. `docs/UPGRADE-PLAN.md` §9.5 recorded "a
            // keyboard-only user never sees it"; this is the clause that says they do.
            withTooltip({}, trigger => {
                fireEvent.focus(trigger)
                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()

                fireEvent.blur(trigger)
                expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
            })
        })

        /**
         * THE OTHER TWO ENTRY POINTS. ==========================================
         *
         * Added by §9.7-F1 step 2 part 1. The clauses above drive `view: "Tooltip"`
         * only, which is one of three ways meta reaches `TooltipPop` — and the
         * least used of them, since ANY node can carry a `tooltip` attribute
         * instead (`Render.js:107`). A replacement that wired up the `view` and
         * forgot the attribute would have passed this suite.
         *
         * The object form still matters twice over: it is the only place a meta author
         * reaches the component's own prop surface, because `Render.js` spreads the
         * object straight through. Part 3 NARROWED that surface deliberately, from
         * `Popup.handledProps` ∪ `Portal.handledProps` (45 names) to the 13 the
         * component declares — see `docs/SUPPORTED-PROPS.md` for the dropped list and
         * `TooltipPop.test.js` for the assertion that each dropped name now warns
         * instead of half-working.
         */
        describe('the `tooltip` attribute on any node', () => {
            const attributeMeta = (tooltip) => ({
                view: 'Row',
                items: [{ view: 'Button', children: 'Reset', tooltip }],
            })

            /** Same close-and-unmount discipline as `withTooltip`, different meta. */
            const withAttribute = (tooltip, assertions) => {
                const { unmount } = mountMeta(attributeMeta(tooltip))
                const trigger = screen.getByRole('button', { name: 'Reset' })
                try {
                    assertions(trigger)
                } finally {
                    fireEvent.mouseLeave(trigger)
                    fireEvent.blur(trigger)
                    advance(1000)
                    unmount()
                }
            }

            it('shows a string `tooltip` after the same 500 ms delay, and hides it again', () => {
                withAttribute(TOOLTIP_TEXT, trigger => {
                    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()

                    fireEvent.mouseEnter(trigger)
                    advance(499)
                    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()

                    advance(1)
                    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()

                    fireEvent.mouseLeave(trigger)
                    advance(70)
                    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
                })
            })

            it('reads an object `tooltip`\'s `title` and honours its `delay`', () => {
                withAttribute({ title: TOOLTIP_TEXT, delay: 0 }, trigger => {
                    fireEvent.mouseEnter(trigger)
                    advance(0)

                    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
                })
            })

            /**
             * REPLACES `passes an object `tooltip`'s unmapped props through to the
             * overlay`, which drove `on: ['hover', 'focus']` — a prop that existed only
             * because the rest bag rode into semantic-ui-react. Part 1 wrote it as the
             * test "that will say which" of reproduce-the-surface or narrow-the-contract
             * step 2 chose. It narrowed: `on` is gone, and the behaviour it selected is
             * the default.
             *
             * The passthrough itself is still real and still needs gating, because
             * `Render.js` spreads the object verbatim — so this drives a prop the
             * component declares and neither `Render.js` nor `mapper.js` maps.
             * `position` is the sharpest choice: it decides which of `tooltip.less`'s
             * eight placement rules paints the bubble, and nothing between the meta and
             * the component touches it.
             */
            it('passes an object `tooltip`\'s own props through — `position` reaches the bubble', () => {
                withAttribute({ title: TOOLTIP_TEXT, position: 'bottom right' }, trigger => {
                    fireEvent.mouseEnter(trigger)
                    advance(500)

                    // `inverted` comes from `Render.TooltipDefaultProps`, so the string
                    // also records that the engine default and the meta's own props merge.
                    expect(screen.getByRole('tooltip').getAttribute('class'))
                        .toBe('tooltip no-wrap bottom right show inverted')
                })
            })

            it('wraps the tooltipped node in one span and changes nothing else while closed', () => {
                // REWRITTEN, and the rewrite is the cost of going inline stated at the
                // meta level. Part 1 asserted the node was byte-for-byte identical, which
                // is why the 38-example DOM baseline was silent about tooltips BY
                // CONSTRUCTION. It is no longer identical: an absolutely positioned bubble
                // needs a positioned ancestor, so the trigger gains a wrapper — six lines
                // in exactly one of the 38 snapshots, regenerated deliberately.
                //
                // What still holds, and is what the baseline's other tripwires depend on:
                // no bubble, no text in the accessibility tree, no `role` (so
                // `ROLE_CENSUS.buttonIcon` stays `{button: 1}`), and no attribute on the
                // node itself.
                const plain = mountMeta({ view: 'Row', items: [{ view: 'Button', children: 'Reset' }] })
                const expected = plain.container.innerHTML
                plain.unmount()

                const { container, unmount } = mountMeta(attributeMeta(TOOLTIP_TEXT))
                try {
                    const host = container.querySelector('.tooltip-host')
                    expect(host.tagName).toBe('SPAN')
                    expect(host.getAttributeNames()).toEqual(['class'])
                    expect(container.innerHTML.replace(/<span class="tooltip-host">|<\/span>/g, ''))
                        .toBe(expected)
                    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
                    expect(screen.queryAllByRole('tooltip', { hidden: true })).toEqual([])
                } finally {
                    unmount()
                }
            })
        })

        /**
         * OBLIGATION 2 AT THE META LEVEL: CLICK-TO-OPEN IS REMOVED.
         *
         * REPLACES `opens on a click of the trigger, with no delay`. That was
         * semantic-ui-react's `on` defaulting to `['click', 'hover']`, so every
         * meta-declared tooltip was ALSO a click target — undocumented, ungated until
         * part 1, and measured harmful here rather than merely redundant: every
         * tooltipped node in the corpus already owns its `onClick`, so one gesture fired
         * the node's action AND the tooltip, and the tooltip arrived after the action had
         * run. The meta level is where that promise lived, so this is where its removal
         * is recorded.
         */
        it('does not open on a click of the trigger, which the node\'s own action owns', () => {
            const clicks = []
            const { unmount } = mountMeta({
                view: 'Row',
                items: [{
                    view: 'Button',
                    children: 'Reset',
                    tooltip: TOOLTIP_TEXT,
                    onClick: () => clicks.push('action'),
                }],
            })
            try {
                fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
                advance(1000)

                // The node's own action ran, and only that.
                expect(clicks).toEqual(['action'])
                expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
            } finally {
                unmount()
            }
        })

        /**
         * THE `items` FORM WORKS NOW, AND THIS IS THE INVERSION.
         *
         * FLIPPED from `renders the error diagnostic instead of the node when `items` is
         * used as the trigger`. `mapper.js` sets `props.children = items.map(Render)` —
         * an ARRAY — and semantic-ui-react's `Portal` ran `React.Children.only()` on it,
         * which threw even for a single item; the engine's error boundary caught the
         * throw and rendered the diagnostic string in the node's place, so a meta author
         * got no tooltip AND no button.
         *
         * The replacement clones nothing, so `React.Children.only` is gone and an array
         * renders. That is a free by-product rather than a feature, and it costs the
         * correction part 1 had just written onto `docs/SUPPORTED-VIEWS.md`, which is
         * updated in the same change as this clause.
         *
         * The one thing it does NOT get is the ARIA relationship: `aria-describedby`
         * needs a single element to sit on, and an array is not one. Asserted, so the
         * limit is on the record.
         */
        it('renders the trigger AND the tooltip when `items` is used as the trigger', () => {
            const { container, unmount } = mountMeta({
                view: 'Row',
                items: [{
                    view: 'Tooltip',
                    label: TOOLTIP_TEXT,
                    items: [{ view: 'Button', children: 'Reset' }],
                }],
            })
            try {
                const trigger = screen.getByRole('button', { name: 'Reset' })
                expect(container).not.toHaveTextContent('[ui-render] render error')

                fireEvent.mouseEnter(trigger)
                advance(500)
                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
                expect(trigger).not.toHaveAttribute('aria-describedby')
            } finally {
                unmount()
            }
        })
    })

    describe('modal Popup', () => {
        let removePopupRoot

        beforeEach(() => { removePopupRoot = withPopupRoot() })
        afterEach(() => removePopupRoot())

        const popupMeta = {
            view: 'Col',
            items: [
                {
                    view: 'Button',
                    children: 'Open details',
                    onClick: { name: 'popupOpen', args: ['details'] },
                },
                {
                    view: 'Popup',
                    id: 'details',
                    items: [{ view: 'Text', children: 'Contract details body' }],
                },
            ],
        }

        it('renders the popup template only after its meta-declared trigger is clicked', () => {
            mountMetaWithAppState(popupMeta)

            // A `view: "Popup"` node renders nothing in place; it registers a template
            // the action resolves by id. So its content must be absent until asked for.
            expect(screen.queryByText('Contract details body')).not.toBeInTheDocument()

            fireEvent.click(screen.getByRole('button', { name: 'Open details' }))

            expect(screen.getByText('Contract details body')).toBeInTheDocument()
        })

        it('closes the popup and removes its content when the dismiss control is used', () => {
            mountMetaWithAppState(popupMeta)
            fireEvent.click(screen.getByRole('button', { name: 'Open details' }))

            // The dismiss control is found by its accessible name, not by position:
            // it is the popup's own button, and the trigger keeps its own name.
            const dismiss = screen.getAllByRole('button')
                .find(button => button.textContent !== 'Open details')
            expect(dismiss).toBeDefined()

            fireEvent.click(dismiss)

            expect(screen.queryByText('Contract details body')).not.toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Open details' })).toBeInTheDocument()
        })
    })
})
