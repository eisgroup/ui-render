/**
 * TOOLTIP MARKUP AND CLASS CONTRACT ===========================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2 — the gate part 1 built before `TooltipPop` could be
 * replaced, rewritten in part 3 against the in-house component that replaced it.
 *
 * WHAT PART 3 CHANGED IN THIS FILE, AND WHAT IT REFUSED TO CHANGE
 * -----------------------------------------------------------------------------
 * Part 1 wrote this file against the REAL `semantic-ui-react` `Popup`, deliberately,
 * so that the swap would have to answer to it. It did. Twelve of the assertions here
 * described `Popup`'s own spelling of the contract — a portal off `document.body`, a
 * popper wrapper carrying the coordinates, the `ui … popup transition visible`
 * vocabulary, the `.content` wrapper, SUIR's 45-prop passthrough — and those are
 * recorded as DELETED below, each one where it used to stand, with what replaced it.
 *
 * The FACTS they stood for all still have a gate, and that is the difference between
 * re-tagging and weakening:
 *
 *   the className contract        still a pinned literal, now
 *                                 `tooltip no-wrap top show inverted`, joined to the
 *                                 14 compiled CSS rules it selects by
 *                                 `style/__tests__/css.tooltip-contract.test.js`.
 *   "closed, it adds nothing"     still here, and now stronger: it also has to add
 *                                 no ROLE, which is what keeps the corpus role census
 *                                 at `buttonIcon: {button: 1}`.
 *   "the body text renders"       still here, per `title` shape.
 *   the prop-leak boundary        still here, FLIPPED to `toEqual([])`.
 *   the a11y tripwires            still here, FLIPPED to the positive assertions.
 *   positioning                   was never testable in jsdom and still is not; the
 *                                 replacement writes no coordinates at all, which IS
 *                                 assertable and is asserted below.
 *
 * DIVISION OF LABOUR ACROSS THE FOUR TOOLTIP GATES (unchanged)
 * -----------------------------------------------------------------------------
 *   this file                          the emitted DOM, the className contract, the
 *                                      wrapper, the passthrough surface, the a11y and
 *                                      prop-leak tripwires.
 *   `TooltipPop.behavior.test.js`      what opens and closes it, and when.
 *   `UIRender.overlay-behavior.test.js`  the same behaviour from meta, through the
 *                                      engine, on all three entry points.
 *   `style/__tests__/css.tooltip-contract.test.js`  joins the className strings
 *                                      pinned here to the compiled CSS rules that
 *                                      select on them, and pins `pointer-events: none`.
 *
 * WHY MARKUP IS PINNED HERE AND NOWHERE ELSE
 * -----------------------------------------------------------------------------
 * Layer (1), the 38-example DOM baseline, sees the wrapper `<span>` and nothing more:
 * a CLOSED tooltip mounts no bubble, so no class string, no `role` and no `id` of the
 * open state appears in any snapshot. Layer (2) is markup-independent on purpose. So
 * the classNames the stylesheet needs have no gate unless one is written here,
 * deliberately, as literals — step 1's lesson, where removing `ui table` from every
 * table in the product passed all 104 behavioural assertions.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TooltipPop from '../TooltipPop'

const TITLE = 'Discards every unsaved change'
const TRIGGER = 'Reset'

/** The bubble. `role="tooltip"` is the accessible way to find it now; the class is the CSS way. */
const bubble = () => document.querySelector('.tooltip')
const advance = ms => act(() => { jest.advanceTimersByTime(ms) })

/**
 * Render `TooltipPop`, hand the caller the wrapper and the trigger, and ALWAYS close
 * and unmount before returning.
 *
 * PART 3 NOTE — the scaffolding is no longer load-bearing, and that is a result.
 * Under SUIR a tooltip still OPEN at unmount left work queued against a detached node
 * and jsdom threw "The provided value is not of type 'Element'" from outside any test,
 * aborting the whole jest worker. The replacement owns its own teardown (one
 * `useEffect` cleanup for the timer, one for the document listeners), so an open
 * unmount is now merely a state change — asserted directly in
 * `TooltipPop.behavior.test.js`'s lifecycle clause. The helper is kept because it also
 * keeps `document`'s listener set and the fake-timer queue clean between tests, and
 * `finally` means a FAILING assertion still reports as a failure.
 */
const drive = (props, assertions, children = <button type="button">{TRIGGER}</button>) => {
    const view = render(<TooltipPop {...props}>{children}</TooltipPop>)
    const host = view.container.firstChild
    const trigger = host && host.firstChild
    try {
        assertions({ ...view, host, trigger })
    } finally {
        if (trigger) {
            fireEvent.mouseLeave(trigger)
            fireEvent.blur(trigger)
        }
        advance(1000)
        view.unmount()
    }
}

/** Open by hover — the path every meta entry point reaches — then assert. */
const whileOpen = (props, assertions, children) => drive(props, view => {
    fireEvent.mouseEnter(view.trigger)
    advance(500)
    assertions(view)
}, children)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('TooltipPop — closed, the component adds one wrapper and nothing else', () => {
    /**
     * THE ASSERTION THAT MAKES THE 38 SNAPSHOTS' NEAR-SILENCE CORRECT rather than
     * lucky, and the one part 3 had to rewrite rather than keep.
     *
     * DELETED: `renders the trigger byte-for-byte as it renders without a tooltip`.
     * It is no longer true and cannot be made true — an absolutely positioned bubble
     * resolves against its nearest POSITIONED ANCESTOR, and a sibling is not one
     * (measured: with no wrapper the bubble landed against `.app` at
     * `top: -46px; left: 571px`). So the wrapper is the irreducible cost of going
     * inline, and it is stated here as an exact shape instead of being asserted away:
     * ONE span, one class, no attributes, and the trigger untouched inside it. The
     * corpus consequence is exactly six lines in one of 38 snapshots.
     */
    it('wraps the trigger in exactly one `span.tooltip-host` and touches nothing else', () => {
        const control = render(<button type="button">{TRIGGER}</button>)
        const expected = control.container.innerHTML
        control.unmount()

        drive({ title: TITLE }, ({ container, host }) => {
            expect(container.childNodes).toHaveLength(1)
            expect(host.tagName).toBe('SPAN')
            expect(host.getAttributeNames()).toEqual(['class'])
            expect(host.getAttribute('class')).toBe('tooltip-host')
            expect(host.innerHTML).toBe(expected)
        })
    })

    it('adds no node to document.body, no text to the accessibility tree, and no role', () => {
        drive({ title: TITLE }, () => {
            expect(bubble()).toBeNull()
            expect(screen.queryByText(TITLE)).not.toBeInTheDocument()
            // The role half is new, and it is what keeps `ROLE_CENSUS.buttonIcon` at
            // `{button: 1}` in examples.behavior-contract: a bubble mounted at mount
            // time would add a `tooltip` role to the corpus census.
            expect(screen.queryAllByRole('tooltip', { hidden: true })).toEqual([])
        })
    })

    it('adds no attribute to the trigger while closed', () => {
        const control = render(<button type="button">{TRIGGER}</button>)
        const expected = control.container.firstChild.getAttributeNames().sort()
        control.unmount()

        drive({ title: TITLE }, ({ trigger }) => {
            expect(trigger.getAttributeNames().sort()).toEqual(expected)
        })
    })
})

describe('TooltipPop — the open DOM', () => {
    /**
     * THE CLASSNAME CONTRACT, AND THE RULE EACH TOKEN FEEDS.
     *
     * Measured against the compiled CSS (`src/style/index.less` → PostCSS prefixwrap),
     * not read off any documentation, and every rule is `.ui-render`-scoped —
     * `css.tooltip-contract.test.js` pins that these rules match this class string and
     * that the bubble now sits INSIDE `.ui-render`, which is the half the portal could
     * never satisfy.
     *
     *   tooltip    `.tooltip` ×7 — the box: position/display/opacity/z-index/
     *              pointer-events, then padding, background, backdrop-filter, border,
     *              border-radius and transition. Plus `.tooltip::after`, the arrow.
     *   no-wrap    `.no-wrap {white-space: nowrap}`. Emitted by `Tooltip.js` itself, and
     *              it is why the bubble does not wrap — there is no `max-width` any
     *              more, which is a deliberate loss recorded in SUPPORTED-PROPS.
     *   top        `.tooltip.top {bottom, left, transform}` and `.tooltip.top::after`,
     *              the arrow's geometry. THE PLACEMENT IS THE REQUESTED ONE, not a
     *              resolved one: there is no flip, so nothing rewrites it at runtime.
     *   show       `.tooltip.show` ×3 — `display: flex`, `z-index: 9`, `visibility` and
     *              `animation-delay: 0s`. Without it `.tooltip {display: none}` wins,
     *              and it is also what makes the bubble independent of whether a
     *              pointer happens to be inside the wrapper.
     *   inverted   `.tooltip.inverted {background-color}` and `.inverted {color}` —
     *              the whole colour scheme, and the reason `inverted` survived as a
     *              prop rather than becoming a dropped SUIR modifier.
     *
     * A replacement that drops any token silently loses the rules listed against it.
     * Emission ORDER is `Tooltip.js`'s (`tooltip no-wrap`, then
     * top/bottom/right/left/show, then the caller's className) and is pinned as one
     * string so a reordering is visible in the diff too.
     *
     * DELETED: `ui <placement> inverted popup transition visible`. That vocabulary
     * belonged to `Popup` and to CSS that never reached the bubble — measured, the
     * portal matched ZERO of the 13 scoped `.ui.popup` rules because it mounted in
     * `document.body`. Keeping the string would have preserved nothing.
     */
    it('emits `tooltip no-wrap <placement> show [inverted] <className>`, in that order', () => {
        whileOpen({ title: TITLE, inverted: true }, () => {
            expect(bubble().getAttribute('class')).toBe('tooltip no-wrap top show inverted')
        })
    })

    it('drops the `inverted` token when the caller does not ask for it', () => {
        // Both engine entry points DO ask for it (`Render.TooltipDefaultProps`, and
        // `mapper.js` writes `inverted` literally), so this is the shape a direct
        // caller gets — and the proof that the token is `inverted`'s doing.
        whileOpen({ title: TITLE }, () => {
            expect(bubble().getAttribute('class')).toBe('tooltip no-wrap top show')
        })
    })

    it('appends the caller className last, after `inverted`', () => {
        whileOpen({ title: TITLE, inverted: true, className: 'app__hint' }, () => {
            expect(bubble().getAttribute('class'))
                .toBe('tooltip no-wrap top show inverted app__hint')
        })
    })

    /**
     * REPLACES `nests portal > popper wrapper > bubble > .content, and hangs the portal
     * off document.body` — DELETED, because there is no portal and no wrapper div. The
     * fact it protected (where the bubble lands, and therefore which CSS can reach it)
     * is asserted here in its new form, and the browser leg pins the same thing as
     * computed style (`CORPUS.INSIDE_UI_RENDER`).
     *
     * The nesting is not cosmetic: it is the mechanism behind two behaviours. A click
     * on the bubble does not dismiss the tooltip because the bubble is inside the host
     * the click-outside check asks about; and the pointer can never travel ONTO the
     * bubble, because `tooltip.less` gives it `pointer-events: none`.
     */
    it('renders the bubble inside the wrapper, as the trigger\'s next sibling, with no portal', () => {
        whileOpen({ title: TITLE, inverted: true }, ({ container, host, trigger }) => {
            expect(container.querySelectorAll('[data-suir-portal="true"]')).toHaveLength(0)
            expect(document.querySelectorAll('[data-suir-portal="true"]')).toHaveLength(0)
            expect(bubble().parentElement).toBe(host)
            expect(trigger.nextElementSibling).toBe(bubble())
            expect(bubble().tagName).toBe('SPAN')
            expect(bubble()).toHaveTextContent(TITLE)
        })
    })

    /**
     * REPLACES `positions the bubble from the popper wrapper, not from the bubble
     * itself` — DELETED with its subject. Its point was that a replacement has to
     * reproduce where the coordinates come from; the answer is that there are none.
     *
     * This is the strongest jsdom-expressible statement of "no positioning JS": the
     * component writes NO inline style, so every one of the eight placements is
     * `tooltip.less` resolving `bottom`/`left`/`transform` against the wrapper. The
     * geometry itself is unobservable here (jsdom reports 0×0 for every rect) and is
     * measured in `e2e/harness.tooltip.pw.js` instead.
     */
    it('writes no inline style at all — every coordinate comes from tooltip.less', () => {
        whileOpen({ title: TITLE, inverted: true }, ({ host }) => {
            expect(bubble().getAttribute('style')).toBeNull()
            expect(host.getAttribute('style')).toBeNull()
        })
    })

    it('maps every placement word in `position` onto the class `tooltip.less` selects on', () => {
        // The vocabulary is `tooltip.less`'s, and all eight combinations are verified in
        // a real browser (`INLINE.PLACEMENT_WORKS`) — part 3 fixed the four corners,
        // which the browser leg had pinned as broken. `center`/`middle` are
        // semantic-ui-react spellings with no rule behind them here, so they are
        // ignored rather than rejected: `bottom center` means `bottom`.
        const emitted = position => {
            let seen
            whileOpen({ title: TITLE, position }, () => { seen = bubble().getAttribute('class') })
            return seen
        }

        expect(emitted('bottom center')).toBe('tooltip no-wrap bottom show')
        expect(emitted('top left')).toBe('tooltip no-wrap top left show')
        expect(emitted('top right')).toBe('tooltip no-wrap top right show')
        expect(emitted('bottom left')).toBe('tooltip no-wrap bottom left show')
        expect(emitted('bottom right')).toBe('tooltip no-wrap bottom right show')
        expect(emitted('left center')).toBe('tooltip no-wrap left show')
        expect(emitted('right center')).toBe('tooltip no-wrap right show')
        // Nothing recognisable: the bubble still renders, unplaced, rather than throwing.
        expect(emitted('nowhere')).toBe('tooltip no-wrap show')
    })
})

describe('TooltipPop — what `title` accepts, and what each shape emits', () => {
    /**
     * DELETED as a pair of assertions rather than as facts: `wraps a string in a
     * `.content` div` and `wraps a number the same way`. The `.content` wrapper was
     * Semantic's shorthand factory, and `css.tooltip-contract.test.js` proved it
     * carried NO style in the live, header-less shape — exactly one rule in the whole
     * stylesheet selects it and it needs a sibling `.header`. So the wrapper is gone
     * and the fact underneath it — the body text renders, whatever its type — is
     * asserted directly below for all four shapes.
     */
    it('renders a string body directly, with no wrapper element', () => {
        whileOpen({ title: TITLE }, () => {
            expect(bubble().innerHTML).toBe(TITLE)
        })
    })

    it('renders a number body the same way', () => {
        whileOpen({ title: 42 }, () => {
            expect(bubble().innerHTML).toBe('42')
        })
    })

    it('renders an element body', () => {
        whileOpen({ title: <em>{TITLE}</em> }, () => {
            expect(bubble().innerHTML).toBe(`<em>${TITLE}</em>`)
        })
    })

    /**
     * The Semantic-Org/Semantic-UI-React#4029 workaround, kept as BEHAVIOUR and now
     * simpler than the thing it worked around.
     *
     * Part 1 gated this on two halves and warned that the markup half alone proved
     * nothing: deleting `if (isFunction(title)) title = {children: title}` left the
     * rendered output byte-identical and passed every other test, because what the
     * workaround bought was SILENCE — without it Semantic took the function through a
     * shorthand path it had already deprecated and warned.
     *
     * DELETED: the second half, `hits no deprecated Semantic path`. There is no
     * Semantic path any more, so a `not.toMatch(/deprecated shorthand/i)` assertion
     * would be true of a component that renders nothing and is therefore no longer a
     * gate. The console is still asserted clean, which is the durable half of the same
     * idea: a function body must not draw a warning from anything.
     */
    it('calls a function body, renders its result, and warns about nothing', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        try {
            whileOpen({ title: () => 'lazy content' }, () => {
                expect(screen.getByText('lazy content')).toBeInTheDocument()
                expect(bubble().innerHTML).toBe('lazy content')
                expect(warn).not.toHaveBeenCalled()
            })
        } finally {
            warn.mockRestore()
        }
    })

    /**
     * DELETED: `renders a `header` before the content, and only then does a rule touch
     * `.content``. `header` was a `Popup` prop, and the rule it unlocked
     * (`.ui.popup > .header + .content {padding-top}`) belongs to CSS that never
     * reached the bubble. There is no `.header`/`.content` structure in `tooltip.less`
     * to reproduce, so `header` is on the DROPPED list and is covered by the
     * narrowing test below rather than pretended to work.
     */
})

describe('TooltipPop — the passthrough surface, deliberately narrowed', () => {
    /**
     * `Render.js` spreads an object `tooltip` straight into this component, so whatever
     * it accepts is reachable from a meta. Under SUIR that was `Popup.handledProps` ∪
     * `Portal.handledProps` — 45 names, 16 of them undocumented Portal-only props.
     * Part 3 narrowed it to the 13 the component declares plus `style`/`data-*`/
     * handlers riding the rest spread, and the narrowing is asserted rather than
     * assumed.
     */
    it('reads a caller `content` in preference to `title` — the `mapper.js` path', () => {
        // Load-bearing, not decorative: `mapper.js` maps a `view: "Tooltip"` node's
        // `label` to `content`, so this is how every `view: "Tooltip"` body arrives.
        whileOpen({ title: TITLE, content: 'from content' }, () => {
            expect(screen.getByText('from content')).toBeInTheDocument()
            expect(screen.queryByText(TITLE)).not.toBeInTheDocument()
        })
    })

    it('puts `classWrap` on the wrapper and `className` on the bubble', () => {
        // The escape hatch the wrapper needs. `inline-flex` is layout-neutral for a
        // `Button` trigger (measured) but not for a growing or block-level one, so a
        // meta author has to be able to reach the wrapper's own classes — the same
        // `classWrap` name `modules/upload/views/Upload.js` already uses.
        whileOpen({ title: TITLE, className: 'app__hint', classWrap: 'fill' }, ({ host }) => {
            expect(host.getAttribute('class')).toBe('tooltip-host fill')
            expect(bubble().getAttribute('class')).toBe('tooltip no-wrap top show app__hint')
        })
    })

    it('still lets `style` and `data-*` reach the bubble through the rest spread', () => {
        whileOpen({ title: TITLE, style: { maxWidth: '10px' }, 'data-kind': 'hint' }, () => {
            expect(bubble().style.maxWidth).toBe('10px')
            expect(bubble()).toHaveAttribute('data-kind', 'hint')
        })
    })

    it('renders the trigger and no bubble at all when `disabled`', () => {
        whileOpen({ title: TITLE, disabled: true }, ({ trigger }) => {
            expect(trigger).toBeInTheDocument()
            expect(bubble()).toBeNull()
        })
    })

    it('renders the trigger and no bubble when `disabled` even if the caller drives `open`', () => {
        // `disabled` wins over everything, which is what SUIR did by not rendering its
        // `Portal` at all.
        drive({ title: TITLE, disabled: true, open: true }, () => {
            expect(bubble()).toBeNull()
        })
    })

    /**
     * THE NARROWING, ASSERTED. Every name here used to change the emitted DOM and now
     * does not — and none of them reaches the bubble as an attribute either, which is
     * the failure mode step 1 recorded on `Table` (`verticalAlign="top"` landing as
     * `verticalalign="top"`, exactly the junk the corpus tripwires exist to keep out).
     *
     * These replace five deleted tests, and the deletions are named so a reader can see
     * what stopped being true rather than what stopped being checked:
     *   `inserts the size/wide/basic/flowing tokens the CSS selects on` — those rules
     *       are `.ui.popup`-keyed and never reached the bubble.
     *   `lets `as` change the element the bubble renders` — the bubble is a `<span>`
     *       from `Tooltip.js` and there is no element override.
     *   `redirects the whole portal with `mountNode`` — there is no portal to redirect;
     *       that prop was the *shape of the fix*, and the fix is now that the bubble is
     *       simply inside the tree.
     *   `lets a caller override the trigger the wrapper built from `children`` — one
     *       way to supply a trigger, not two.
     *   the SUIR-vocabulary half of `lets `position` rewrite the placement tokens` —
     *       `position` survives, mapped onto `tooltip.less`'s vocabulary above.
     */
    it('strips every dropped semantic-ui-react prop, warns once, and emits no attribute for it', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const dropped = {
            as: 'div',
            basic: true,
            closeOnDocumentClick: false,
            closeOnEscape: false,
            defaultOpen: true,
            flowing: true,
            header: 'Reset',
            hideOnScroll: true,
            hoverable: true,
            mountNode: document.body,
            mouseLeaveDelay: 5,
            offset: [0, 8],
            on: ['hover', 'focus'],
            pinned: true,
            popper: { id: 'p' },
            size: 'mini',
            trigger: <button type="button">Override</button>,
            wide: 'very',
        }
        try {
            whileOpen({ title: TITLE, inverted: true, ...dropped }, () => {
                // The class string is untouched: not one of them is a token any more.
                expect(bubble().getAttribute('class')).toBe('tooltip no-wrap top show inverted')
                // ...and not one of them landed as an attribute.
                const leaked = Object.keys(dropped)
                    .filter(name => bubble().hasAttribute(name) || bubble().hasAttribute(name.toLowerCase()))
                expect(leaked).toEqual([])
                // The bubble is still a span, `header` rendered nothing, and the caller's
                // `trigger` did not replace `children`.
                expect(bubble().tagName).toBe('SPAN')
                expect(bubble().innerHTML).toBe(TITLE)
                expect(screen.queryByRole('button', { name: 'Override' })).not.toBeInTheDocument()
                expect(screen.getByRole('button', { name: TRIGGER })).toBeInTheDocument()

                // One development warning per dropped name, so a meta still carrying one
                // learns it stopped working. Deduped per name for the life of the module,
                // which is why every name is exercised in this single test.
                const said = warn.mock.calls.map(call => call.map(String).join(' '))
                Object.keys(dropped).forEach(name => {
                    expect(said.filter(line => line.includes(`\`${name}\``))).toHaveLength(1)
                })
            })
        } finally {
            warn.mockRestore()
        }
    })
})

describe('TooltipPop — the tripwires part 1 left, now flipped', () => {
    /**
     * ACCESSIBILITY, FLIPPED. Part 1 pinned "no role, no aria-*, no id" and said in so
     * many words: "when step 2 adds them these assertions fail, and that failure is the
     * signal to replace them with the positive ones — not to delete them." This is that
     * replacement.
     *
     * It is also a consequence rather than a bonus. Dropping click-to-open removed the
     * only gesture a keyboard could reach, so focus-open plus `role="tooltip"` plus
     * `aria-describedby` are what stop the replacement being LESS accessible than the
     * broken component it replaces.
     */
    it('gives the bubble `role="tooltip"` and an id, and points the trigger at it', () => {
        whileOpen({ title: TITLE, inverted: true }, ({ trigger }) => {
            const found = screen.getByRole('tooltip')
            expect(found).toBe(bubble())
            // The RELATIONSHIP, never a literal id: the counter is module-level, so a
            // literal would make this test depend on how many tooltips ran before it.
            expect(found.id).toMatch(/^ui-render-tooltip-\d+$/)
            expect(trigger.getAttribute('aria-describedby')).toBe(found.id)
            expect(found).toHaveTextContent(TITLE)
            // The bubble names itself from its content, so what a screen reader
            // announces as the description IS the body text.
            expect(found).toHaveAccessibleName(TITLE)
            // ...and the TRIGGER's own name is untouched, which is the measured reason
            // the bubble is a sibling rather than a child: injected INTO the button its
            // text joined name-from-content and the button announced
            // "ResetDiscards every unsaved change".
            expect(trigger).toHaveAccessibleName(TRIGGER)
        })
    })

    it('honours a caller-supplied `id`, so a meta author can pin the reference', () => {
        whileOpen({ title: TITLE, id: 'reset-hint' }, ({ trigger }) => {
            expect(bubble().id).toBe('reset-hint')
            expect(trigger).toHaveAttribute('aria-describedby', 'reset-hint')
        })
    })

    it('adds the `aria-describedby` only while there is a bubble to point at', () => {
        // Why it is conditional: `examples.dom-contract` asserts corpus-wide that no
        // `aria-describedby` resolves to nothing, and its header records that the
        // unconditional attribute on `Input`/`InputNumber`/`InputDate` put 57 dangling
        // references into the first baseline. It is also the correct ARIA pattern.
        drive({ title: TITLE }, ({ trigger }) => {
            expect(trigger).not.toHaveAttribute('aria-describedby')

            fireEvent.mouseEnter(trigger)
            advance(500)
            expect(trigger).toHaveAttribute('aria-describedby')

            fireEvent.mouseLeave(trigger)
            advance(70)
            expect(trigger).not.toHaveAttribute('aria-describedby')
        })
    })

    it('still adds no tabindex to the trigger — a residual gap, not a fix', () => {
        // The half that does NOT flip, and it is a real limitation: focus-open only
        // helps a trigger that is already focusable. A tooltip on a `Text`, a `Label`
        // or an `Icon` stays unreachable by keyboard. `tabIndex={0}` on the wrapper was
        // considered and rejected — it would create two tab stops on every `Button`
        // tooltip, which is worse. Recorded in `docs/SUPPORTED-PROPS.md`.
        whileOpen({ title: TITLE }, ({ trigger, host }) => {
            expect(trigger).not.toHaveAttribute('tabindex')
            expect(host).not.toHaveAttribute('tabindex')
        })
    })

    /**
     * THE DOM BOUNDARY, FLIPPED TO ZERO.
     *
     * Part 1 pinned this at its CURRENT value in the house style of the corpus ledger:
     * `TooltipPop` was the only component in the pack applying no `omitProps` filter,
     * and SUIR spread what it did not recognise onto the bubble, so `view`, `index` and
     * `symbol` became HTML attributes — reachable from meta today, because `mapper.js`
     * spreads a `view: "Tooltip"` node's whole rest bag and `view` is still in it.
     *
     * The filter is applied now, and this is the last unfiltered DOM boundary on the F1
     * surface. `components/__tests__/domProps.test.js` gains the same component.
     */
    it('leaks no engine-internal prop onto the bubble', () => {
        whileOpen({ title: TITLE, view: 'Tooltip', index: 3, symbol: '$', name: 'total', label: 'Total' }, () => {
            const leaked = ['view', 'index', 'symbol', 'name', 'label']
                .filter(name => bubble().hasAttribute(name))

            expect(leaked).toEqual([])
        })
    })
})

describe('TooltipPop — the trigger contract, inverted by the rewrite', () => {
    /**
     * ALL THREE OF THESE USED TO ASSERT A THROW, and their inversion is a free
     * by-product of not cloning the trigger.
     *
     * SUIR's `Portal` ran `React.Children.only(trigger)`, so two children, a text child
     * and an ARRAY OF ONE all threw. The last of those is not academic: `mapper.js`
     * builds `props.children = items.map(Render)` for a `view: "Tooltip"` node with
     * `items`, which is an array — the engine caught the throw and rendered its error
     * diagnostic IN PLACE OF THE NODE, so a meta author lost the tooltip AND the
     * trigger. `UIRender.overlay-behavior.test.js` pinned that; both files invert
     * together, and `docs/SUPPORTED-VIEWS.md` loses the correction part 1 had just
     * written.
     *
     * What does NOT come with it: a non-element trigger gets no `aria-describedby`,
     * because there is no single element to put it on. Asserted, not glossed.
     */
    it('renders two children', () => {
        drive({ title: TITLE }, ({ host }) => {
            expect(host.children).toHaveLength(2)
            expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'b' })).toBeInTheDocument()
        }, [<button type="button" key="a">a</button>, <button type="button" key="b">b</button>])
    })

    it('renders an array of exactly one child — the shape `mapper.js` builds from `items`', () => {
        whileOpen({ title: TITLE }, ({ host }) => {
            expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument()
            expect(screen.getByText(TITLE)).toBeInTheDocument()
            // No relationship: the array is not one element, so nothing can carry it.
            expect(host.querySelector('[aria-describedby]')).toBeNull()
        }, [<button type="button" key="a">a</button>])
    })

    it('renders a text child', () => {
        whileOpen({ title: TITLE }, ({ host }) => {
            expect(host).toHaveTextContent('plain text')
            expect(screen.getByText(TITLE)).toBeInTheDocument()
            expect(host.querySelector('[aria-describedby]')).toBeNull()
        }, 'plain text')
    })
})
