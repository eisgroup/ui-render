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
         * The hover delay is a timer, so these tests need fake ones. Two mechanics of
         * SUIR's Popup make the teardown load-bearing rather than decoration:
         *
         *  - a tooltip that is still OPEN when the tree comes down leaves queued work
         *    that runs against a detached node, and jsdom then throws "The provided
         *    value is not of type 'Element'" from outside any test — which aborts the
         *    whole jest worker instead of failing one assertion;
         *  - doing the close in `afterEach` is not enough (measured): the close and the
         *    unmount have to happen inside the test function.
         *
         * Hence `withTooltip`: it closes and unmounts in a `finally`, so a FAILING
         * assertion still reports as a failure. When F1 Step 2 replaces this with a
         * portal the component owns and tears down itself, this scaffolding can go —
         * and the assertions inside it stay exactly as they are, which is the point of
         * the layer.
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
                // tooltip; TooltipPop.js documents it as the deliberate UX choice.
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

        it('records that the open tooltip is not yet wired to its trigger for assistive technology', () => {
            // A TRIPWIRE, NOT AN ENDORSEMENT. F1 Step 2 lists `aria-describedby` as part
            // of the in-house tooltip's job, and the ARIA pattern also wants
            // `role="tooltip"` on the bubble. Today neither exists: the text appears in
            // a portal with no relationship to the control it describes, so a
            // screen-reader user never hears it, and a keyboard-only user — the trigger
            // opens on hover, not on focus — never sees it either.
            //
            // When Step 2 adds them this test fails, and that failure is the signal to
            // replace it with the positive assertions (the trigger names the bubble, the
            // bubble carries role="tooltip", focus opens it) rather than to delete it.
            withTooltip({}, trigger => {
                fireEvent.mouseEnter(trigger)
                advance(500)

                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
                expect(trigger).not.toHaveAttribute('aria-describedby')
                expect(screen.queryAllByRole('tooltip')).toEqual([])
            })
        })

        it('does not open on keyboard focus, only on hover', () => {
            // The other half of the same gap, kept separate because it is a different
            // fix: F1 Step 2's "hover/focus triggers with delay". Today focusing the
            // trigger produces nothing, so the tooltip is pointer-only.
            withTooltip({}, trigger => {
                fireEvent.focus(trigger)
                advance(1000)
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
         * The object form matters twice over: it is the only place a meta author
         * reaches SUIR's own prop surface, because `Render.js` spreads the object
         * straight through. That is 45 reachable props (`Popup.handledProps` ∪
         * `Portal.handledProps`) against the 4 the wrapper itself declares, which is
         * why step 2 owes an explicit decision about the passthrough rather than a
         * replacement that happens to accept four props. `docs/SUPPORTED-PROPS.md`
         * carries the 24 with a measured effect.
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
             * The passthrough, asserted at the level that proves it is open: `on`
             * is not a prop the wrapper declares, documents or maps — it rides the
             * spread into SUIR. Step 2's replacement either reproduces this surface
             * or narrows the meta contract, and this is the test that will say which.
             */
            it('passes an object `tooltip`\'s unmapped props through to the overlay', () => {
                withAttribute({ title: TOOLTIP_TEXT, on: ['hover', 'focus'] }, trigger => {
                    fireEvent.focus(trigger)

                    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
                })
            })

            it('leaves the tooltipped node itself unchanged while the tooltip is closed', () => {
                // The wrapper adds no element and no attribute, which is why the
                // 38-example DOM baseline is silent about tooltips BY CONSTRUCTION
                // and not merely because the corpus's two declarations sit in an
                // inactive `Tabs` panel. A rewrite that renders a hidden bubble at
                // mount would change every snapshot and put invisible text in the
                // accessibility tree; nothing else in the repo would notice.
                const plain = mountMeta({ view: 'Row', items: [{ view: 'Button', children: 'Reset' }] })
                const expected = plain.container.innerHTML
                plain.unmount()

                const { container, unmount } = mountMeta(attributeMeta(TOOLTIP_TEXT))
                try {
                    expect(container.innerHTML).toBe(expected)
                    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument()
                } finally {
                    unmount()
                }
            })
        })

        /**
         * SUIR's `on` defaults to `['click', 'hover']`, so every meta-declared
         * tooltip in the product is ALSO a click target — undocumented, ungated
         * until now, and the behaviour a hover-only rewrite drops in silence.
         * Recorded here at the meta level because that is where the promise lives;
         * `TooltipPop.behavior.test.js` pins the same fact per component.
         */
        it('opens on a click of the trigger, with no delay', () => {
            withTooltip({}, trigger => {
                fireEvent.click(trigger)

                expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument()
            })
        })

        /**
         * THE `items` FORM DOES NOT WORK, AND THIS PINS WHAT HAPPENS INSTEAD.
         *
         * `mapper.js` sets `props.children = items.map(Render)` — an ARRAY — and
         * SUIR's `Portal` runs `React.Children.only()` on it, which throws even for
         * a single item. The engine's error boundary catches it and renders the
         * diagnostic string in the node's place, so the trigger disappears
         * entirely: a meta author gets no tooltip AND no button.
         *
         * `docs/SUPPORTED-VIEWS.md` described `items` as the tooltip's BODY; it is
         * the trigger, and this shape never rendered. The page is corrected in the
         * same change as this test. Pinned as current behaviour: step 2 may keep it
         * (the nested-object `children` form is the one in use) or fix it, but not
         * by accident.
         */
        it('renders the error diagnostic instead of the node when `items` is used as the trigger', () => {
            const { container, unmount } = mountMeta({
                view: 'Row',
                items: [{
                    view: 'Tooltip',
                    label: TOOLTIP_TEXT,
                    items: [{ view: 'Button', children: 'Reset' }],
                }],
            })
            try {
                expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
                expect(container).toHaveTextContent('[ui-render] render error')
                expect(container).toHaveTextContent('React.Children.only')
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
