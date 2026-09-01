/**
 * TOOLTIP MARKUP AND CLASS CONTRACT ===========================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2, part 1 — the gate that has to exist before
 * `TooltipPop` may be replaced.
 *
 * WHAT THIS FILE USED TO BE, AND WHY IT WAS NOT A GATE
 * -----------------------------------------------------------------------------
 * It opened with `jest.mock('semantic-ui-react', () => ({Popup: jest.fn(…)}))` and
 * asserted the props object handed to the mock — `mouseEnterDelay === 500`, an
 * `inverted` flag, that a function `title` did not throw. Every one of those
 * assertions passes against a `Popup` that renders nothing, and all of them
 * describe a component step 2 deletes. The seam the old file measured IS the seam
 * being removed, so it could not fail when the tooltip stopped working.
 *
 * The same four facts are still asserted here, but through the real
 * `semantic-ui-react` `Popup` and the real DOM: the 500 ms is a timer that has to
 * elapse (`TooltipPop.behavior.test.js`), `inverted` is a token in a className our
 * LESS selects on, and the #4029 function-title workaround is asserted by the text
 * it puts on the screen rather than by the shape of an argument.
 *
 * DIVISION OF LABOUR ACROSS THE FOUR TOOLTIP GATES
 * -----------------------------------------------------------------------------
 *   this file                          the emitted DOM, the className contract,
 *                                      the portal's mount parent, the passthrough
 *                                      surface, the a11y and prop-leak tripwires.
 *   `TooltipPop.behavior.test.js`      what opens and closes it, and when.
 *   `UIRender.overlay-behavior.test.js`  the same behaviour from meta, through the
 *                                      engine, on all three entry points.
 *   `style/__tests__/css.tooltip-contract.test.js`  joins the className strings
 *                                      pinned here to the compiled CSS rules that
 *                                      select on them.
 *
 * WHY MARKUP IS PINNED HERE AND NOWHERE ELSE
 * -----------------------------------------------------------------------------
 * Layer (1), the 38-example DOM baseline, cannot see this component at all — not
 * merely because the corpus's two tooltip declarations sit in an inactive `Tabs`
 * panel, but BY CONSTRUCTION: a closed tooltip adds nothing to the document (the
 * first test below), so even an active one would leave every snapshot unchanged.
 * Layer (2) is markup-independent on purpose. So the classNames the stylesheet
 * needs have no gate unless one is written here, deliberately, as literals.
 *
 * That is step 1's lesson applied: the highest-consequence detail in the `Table`
 * swap was a className contract (`ui table`) that all 104 behavioural assertions
 * were blind to — removing it from every table in the product passed all of them.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TooltipPop from '../TooltipPop'

const TITLE = 'Discards every unsaved change'
const TRIGGER = 'Reset'

/** The bubble: the single element carrying SUIR's `popup` token. */
const bubble = () => document.querySelector('.popup')
const portals = () => [...document.querySelectorAll('[data-suir-portal="true"]')]
const advance = ms => act(() => { jest.advanceTimersByTime(ms) })

/**
 * Render `TooltipPop`, hand the caller the trigger, and ALWAYS close and unmount
 * before returning.
 *
 * The teardown is load-bearing, not tidiness. A tooltip still OPEN when the tree
 * comes down leaves SUIR work queued against a detached node, and jsdom then
 * throws "The provided value is not of type 'Element'" from outside any test —
 * which aborts the whole jest worker instead of failing one assertion. Measured:
 * doing the close in `afterEach` is too late; it has to happen inside the test
 * function. `finally` means a FAILING assertion still reports as a failure.
 *
 * When step 2 ships a portal the component owns and tears down itself, this
 * scaffolding can go and every assertion inside it stays as written.
 */
const drive = (props, assertions, children = <button type="button">{TRIGGER}</button>) => {
    const view = render(<TooltipPop {...props}>{children}</TooltipPop>)
    const trigger = view.container.firstChild
    try {
        assertions({ ...view, trigger })
    } finally {
        if (trigger) {
            fireEvent.mouseLeave(trigger)
            fireEvent.blur(trigger)
        }
        fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
        advance(1000)
        view.unmount()
    }
}

/** Open by hover, which is the only path meta can reach today, then assert. */
const whileOpen = (props, assertions, children) => drive(props, view => {
    fireEvent.mouseEnter(view.trigger)
    advance(500)
    assertions(view)
}, children)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('TooltipPop — closed, the component adds nothing', () => {
    /**
     * The assertion that makes the 38 snapshots' silence *correct* rather than
     * lucky. A rewrite that renders a hidden bubble at mount time would put
     * invisible text in the accessibility tree and change every example's DOM,
     * and this is the only test in the repo that would say so.
     */
    it('renders the trigger byte-for-byte as it renders without a tooltip', () => {
        const control = render(<button type="button">{TRIGGER}</button>)
        const expected = control.container.innerHTML
        control.unmount()

        drive({ title: TITLE }, ({ container }) => {
            expect(container.innerHTML).toBe(expected)
        })
    })

    it('adds no node to document.body and no text to the accessibility tree', () => {
        drive({ title: TITLE }, () => {
            expect(portals()).toEqual([])
            expect(bubble()).toBeNull()
            expect(screen.queryByText(TITLE)).not.toBeInTheDocument()
        })
    })

    it('adds no attribute to the trigger — the clone carries handlers and a ref, not markup', () => {
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
     * Measured against the compiled CSS (`src/style/index.less` → PostCSS
     * prefixwrap), not read off Semantic's documentation. Every rule below is
     * `.ui-render`-scoped, which is the other half of the story:
     * `css.tooltip-contract.test.js` pins that these rules match this class string
     * only when the node sits inside `.ui-render` — and today's portal does not.
     *
     *   ui + popup   `.ui.popup` ×4 — the box itself: display/position/z-index/
     *                border/max-width/background/padding/color/border-radius/
     *                box-shadow, then margin, font-size and transition.
     *                `.ui.popup:before` — the arrow (Popper's own arrow modifier
     *                is disabled, so the arrow is CSS only).
     *   top          `.ui.top.popup {margin}` and `.ui.top.popup:before {background}`.
     *   left         with `top`: `.ui.top.left.popup {transform-origin, margin-left}`
     *                and `.ui.top.left.popup:before`. NOTE these two tokens are
     *                Popper's RESOLVED placement, not the requested one, so a flip
     *                rewrites them — see the jsdom ceiling note in UPGRADE-PLAN §9.5.
     *   inverted     `.ui.inverted.popup {background,color,border,box-shadow}`,
     *                `.ui.inverted.popup:before`, `.ui.inverted.top.popup:before`,
     *                our own `.ui.popup.inverted {border}` and
     *                `.ui.popup.inverted.top:before` overrides, plus the generic
     *                `.inverted {color}`. This is the whole colour scheme.
     *   transition   `.transition {transition}` — our own compact transition.less,
     *                not Semantic's 12 KB module.
     *   visible      `.ui.visible.popup {display: block}` — the token that makes
     *                the bubble visible at all, since `.ui.popup` sets
     *                `display: none`; also `{transform, backface-visibility}`.
     *
     * A replacement that drops any token silently loses the rules listed against
     * it. Emission ORDER is Semantic's (`Popup.js`: ui, placement, size, wide,
     * basic, flowing, inverted, `popup transition visible`, caller className) and
     * is pinned as one string so a reordering is visible in the diff too.
     */
    it('emits `ui <placement> inverted popup transition visible`, in that order', () => {
        whileOpen({ title: TITLE, inverted: true }, () => {
            expect(bubble().getAttribute('class')).toBe('ui top left inverted popup transition visible')
        })
    })

    it('drops the `inverted` token when the caller does not ask for it', () => {
        // Both engine entry points DO ask for it (`Render.TooltipDefaultProps`,
        // and `mapper.js` writes `inverted` literally), so this is the shape a
        // direct caller gets — and the proof that the token is `inverted`'s doing.
        whileOpen({ title: TITLE }, () => {
            expect(bubble().getAttribute('class')).toBe('ui top left popup transition visible')
        })
    })

    it('appends the caller className after `visible`, never before it', () => {
        whileOpen({ title: TITLE, inverted: true, className: 'app__hint' }, () => {
            expect(bubble().getAttribute('class'))
                .toBe('ui top left inverted popup transition visible app__hint')
        })
    })

    it('nests portal > popper wrapper > bubble > .content, and hangs the portal off document.body', () => {
        whileOpen({ title: TITLE, inverted: true }, ({ container }) => {
            const [portal] = portals()
            expect(portal.parentElement).toBe(document.body)
            // The React container is a sibling, so the bubble is NOT inside the tree
            // that rendered it. That is what takes it out of `.ui-render` — the
            // single fact behind the dead-CSS finding.
            expect(container.contains(portal)).toBe(false)

            const wrapper = portal.firstElementChild
            expect(wrapper.tagName).toBe('DIV')
            expect(wrapper.firstElementChild).toBe(bubble())
            expect(bubble().tagName).toBe('DIV')
            expect(bubble().firstElementChild.getAttribute('class')).toBe('content')
            expect(bubble().firstElementChild).toHaveTextContent(TITLE)
        })
    })

    it('positions the bubble from the popper wrapper, not from the bubble itself', () => {
        // `.ui.popup` is `position: absolute; top: 100%; right: 50%`, and SUIR
        // overrides all three inline. Every coordinate therefore comes from the
        // wrapper div, which is what a replacement has to reproduce — and what
        // jsdom cannot measure (§9.5).
        whileOpen({ title: TITLE, inverted: true }, () => {
            expect(bubble().style.position).toBe('initial')
            expect(bubble().style.left).toBe('auto')
            expect(bubble().style.right).toBe('auto')
        })
    })
})

describe('TooltipPop — what `title` accepts, and what each shape emits', () => {
    it('wraps a string in a `.content` div', () => {
        whileOpen({ title: TITLE }, () => {
            expect(bubble().innerHTML).toBe(`<div class="content">${TITLE}</div>`)
        })
    })

    it('wraps a number the same way', () => {
        whileOpen({ title: 42 }, () => {
            expect(bubble().innerHTML).toBe('<div class="content">42</div>')
        })
    })

    /**
     * The `.content` wrapper is NOT invariant, which is the trap for a
     * replacement that always emits it: Semantic's shorthand factory wraps a
     * primitive but passes an element through untouched.
     */
    it('renders an element title directly, with NO `.content` wrapper', () => {
        whileOpen({ title: <em>{TITLE}</em> }, () => {
            expect(bubble().innerHTML).toBe(`<em>${TITLE}</em>`)
            expect(bubble().querySelector('.content')).toBeNull()
        })
    })

    /**
     * The Semantic-Org/Semantic-UI-React#4029 workaround, asserted by its effect.
     * `TooltipPop` turns a function `title` into `{children: fn}`; the old mocked
     * test only checked that rendering did not throw, which is also true of a
     * component that renders nothing.
     */
    /**
     * The #4029 workaround, gated on BOTH halves — and the second half is the load-bearing one.
     *
     * Review measured that deleting `if (isFunction(title)) title = {children: title}` leaves the
     * rendered output byte-identical and passes every other test in this file. What the workaround
     * actually buys is silence: without it Semantic takes the function through its deprecated
     * shorthand path and warns. So the markup assertion alone gates nothing.
     *
     * The two halves must share ONE test. Semantic dedupes that warning by a key that is the same
     * for every function title (`"[object Object]"`), so a second test rendering a function title
     * would find the warning already spent and pass whatever the component does — which is exactly
     * how the first attempt at this test silently proved nothing.
     *
     * Note the warning says the path "will be removed in v3" and the installed version IS
     * 3.0.0-beta.2: it still works, but it is a deprecation this wrapper exists to dodge, and one
     * more reason step 2 replaces the component instead of carrying the workaround forward.
     */
    it('calls a function title, renders its result with no `.content` wrapper, and hits no deprecated Semantic path', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        try {
            whileOpen({ title: () => 'lazy content' }, () => {
                expect(screen.getByText('lazy content')).toBeInTheDocument()
                expect(bubble().innerHTML).toBe('lazy content')

                const said = warn.mock.calls.map(call => call.map(String).join(' ')).join('\n')
                expect(said).not.toMatch(/deprecated shorthand/i)
            })
        } finally {
            warn.mockRestore()
        }
    })

    it('renders a `header` before the content, and only then does a rule touch `.content`', () => {
        // `.ui-render .ui.popup > .header + .content {padding-top}` is the ONLY
        // rule in the compiled CSS that selects the inner `.content` node, and it
        // needs this sibling pair. Header-less — the live shape — `.content`
        // carries no style at all.
        whileOpen({ title: TITLE, header: 'Reset' }, () => {
            const [first, second] = [...bubble().children]
            expect(first.getAttribute('class')).toBe('header')
            expect(second.getAttribute('class')).toBe('content')
        })
    })
})

describe('TooltipPop — the passthrough surface reachable from meta', () => {
    /**
     * `Render.js` spreads an object `tooltip` straight into the wrapper, and the
     * wrapper spreads its rest bag onto `Popup` LAST — so a meta author reaches
     * SUIR's whole `Popup` ∪ `Portal` prop surface (45 names), not the 8 the
     * generated page lists. These are the ones whose effect is observable in
     * jsdom; the ones that are not (`offset`, `pinned`, `positionFixed`,
     * `popperModifiers`) are named as gaps in UPGRADE-PLAN §9.5.
     */
    it('lets `position` rewrite the placement tokens', () => {
        whileOpen({ title: TITLE, inverted: true, position: 'bottom center' }, () => {
            expect(bubble().getAttribute('class'))
                .toBe('ui bottom center inverted popup transition visible')
        })
    })

    it('inserts the `size`, `wide`, `basic` and `flowing` tokens the CSS selects on', () => {
        whileOpen({ title: TITLE, size: 'mini', wide: 'very', basic: true, flowing: true }, () => {
            expect(bubble().getAttribute('class'))
                .toBe('ui top left mini very wide basic flowing popup transition visible')
        })
    })

    it('lets `as` change the element the bubble renders', () => {
        whileOpen({ title: TITLE, as: 'span' }, () => {
            expect(bubble().tagName).toBe('SPAN')
        })
    })

    it('merges `style` after the coordinates SUIR writes', () => {
        whileOpen({ title: TITLE, style: { maxWidth: '10px' } }, () => {
            expect(bubble().style.maxWidth).toBe('10px')
            expect(bubble().style.position).toBe('initial')
        })
    })

    it('redirects the whole portal with `mountNode`', () => {
        // The prop a step-2 replacement can use to land inside `.ui-render`, which
        // is what would make the CSS above apply. Recorded as reachable today.
        const host = document.createElement('div')
        host.className = 'ui-render'
        document.body.appendChild(host)
        try {
            whileOpen({ title: TITLE, mountNode: host }, () => {
                expect(host.contains(bubble())).toBe(true)
                expect(bubble().closest('.ui-render')).toBe(host)
            })
        } finally {
            document.body.removeChild(host)
        }
    })

    it('renders the trigger and no portal at all when `disabled`', () => {
        whileOpen({ title: TITLE, disabled: true }, ({ trigger }) => {
            expect(trigger).toBeInTheDocument()
            expect(portals()).toEqual([])
        })
    })

    /**
     * The spread lands after every attribute the wrapper writes, so the caller
     * wins every collision. This is why `mapper.js` works at all: it passes
     * `content` (from the meta `label`) and that overrides the wrapper's `title`.
     */
    it('lets a caller-supplied `content` override `title`', () => {
        whileOpen({ title: TITLE, content: 'from content' }, () => {
            expect(screen.getByText('from content')).toBeInTheDocument()
            expect(screen.queryByText(TITLE)).not.toBeInTheDocument()
        })
    })

    it('lets a caller override the trigger the wrapper built from `children`', () => {
        drive(
            { title: TITLE, trigger: <button type="button">Override</button> },
            () => {
                expect(screen.getByRole('button', { name: 'Override' })).toBeInTheDocument()
                expect(screen.queryByRole('button', { name: TRIGGER })).not.toBeInTheDocument()
            },
        )
    })
})

describe('TooltipPop — tripwires, not endorsements', () => {
    /**
     * ACCESSIBILITY. Step 2 owes `aria-describedby` and `role="tooltip"`; today
     * the bubble carries no ARIA of any kind and the trigger is given no
     * relationship to it, so a screen-reader user never hears the text. When step
     * 2 adds them these assertions fail, and that failure is the signal to replace
     * them with the positive ones — not to delete them.
     */
    it('gives the bubble no role, no aria-* and no id', () => {
        whileOpen({ title: TITLE, inverted: true }, () => {
            const attributes = bubble().getAttributeNames()
            expect(attributes.filter(name => /^aria-/.test(name))).toEqual([])
            expect(attributes).not.toContain('role')
            expect(attributes).not.toContain('id')
            expect(screen.queryAllByRole('tooltip')).toEqual([])
        })
    })

    it('gives the trigger neither aria-describedby nor a tabindex', () => {
        whileOpen({ title: TITLE }, ({ trigger }) => {
            expect(trigger).not.toHaveAttribute('aria-describedby')
            // A tooltip on a `Text` or a `Label` is unreachable by keyboard because
            // of this: nothing makes the trigger focusable.
            expect(trigger).not.toHaveAttribute('tabindex')
        })
    })

    /**
     * THE DOM BOUNDARY, PINNED AS THE DEFECT IT IS.
     *
     * `TooltipPop` is the only component in the pack that applies no `omitProps`
     * filter, and SUIR spreads what it does not recognise onto the bubble — so
     * engine-internal props become HTML attributes. It is reachable from meta
     * today: `mapper.js` spreads a `view: "Tooltip"` node's whole rest bag, which
     * still contains `view`.
     *
     * Pinned at its CURRENT value rather than at zero, in the house style of the
     * corpus ledger (`FIXED_PROP_LEAKS` counts fixed leaks at zero; unfixed ones
     * are counted where they stand). Step 2 applies the filter and this test flips
     * to `toEqual([])` — a deliberate edit, and the diff is the record of the fix.
     */
    it('leaks engine-internal props onto the bubble — no boundary filter (step 2 fixes this)', () => {
        whileOpen({ title: TITLE, view: 'Tooltip', index: 3, symbol: '$' }, () => {
            const leaked = ['view', 'index', 'symbol'].filter(name => bubble().hasAttribute(name))

            expect(leaked).toEqual(['view', 'index', 'symbol'])
            expect(bubble().getAttribute('view')).toBe('Tooltip')
        })
    })
})

describe('TooltipPop — the trigger must be exactly one element', () => {
    let consoleError

    beforeEach(() => { consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}) })
    afterEach(() => consoleError.mockRestore())

    /**
     * SUIR's `Portal` runs `React.Children.only(trigger)`, so the trigger contract
     * is stricter than "children". This is not academic: `mapper.js` builds
     * `props.children = items.map(Render)` for a `view: "Tooltip"` node with
     * `items`, which is an ARRAY — and an array of one element throws exactly the
     * same way as two children do. `UIRender.overlay-behavior.test.js` pins what
     * the engine does with that throw; here is the raw contract.
     */
    it('throws on two children', () => {
        expect(() => render(
            <TooltipPop title={TITLE}>
                <button type="button">a</button>
                <button type="button">b</button>
            </TooltipPop>
        )).toThrow(/React.Children.only/)
    })

    it('throws on an array of exactly one child — the shape `mapper.js` builds from `items`', () => {
        expect(() => render(
            <TooltipPop title={TITLE}>{[<button type="button" key="a">a</button>]}</TooltipPop>
        )).toThrow(/React.Children.only/)
    })

    it('throws on a text child', () => {
        expect(() => render(<TooltipPop title={TITLE}>plain text</TooltipPop>)).toThrow(/React.Children.only/)
    })
})
