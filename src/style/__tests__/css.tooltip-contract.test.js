/**
 * TOOLTIP CLASSNAME → CSS RULE JOIN ===========================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2 — written in part 1 against `semantic-ui-react`'s
 * `Popup`, rewritten in part 3 against the in-house component that replaced it.
 *
 * WHY A STYLE TEST RENDERS A REACT COMPONENT
 * -----------------------------------------------------------------------------
 * `TooltipPop.test.js` pins the class string the component emits. `css.compilation`
 * and `css.pipeline.parity` pin the CSS the build produces. Neither can see the
 * JOIN — whether any rule in the stylesheet actually selects the node the component
 * renders — and the join is where the interesting defect lived. So this suite
 * compiles the real CSS through the real webpack PostCSS stage, renders the real
 * open tooltip, and runs `Element.matches()` for every rule against the real node.
 *
 * THE FINDING PART 1 PINNED HERE, AND WHAT PART 3 DID WITH IT
 * -----------------------------------------------------------------------------
 * §9.7-F1 step 2 said to "keep emitting `ui popup`-compatible classNames until
 * Step 4 so the current CSS continues to apply". Part 1 measured that premise false:
 * **no `.ui.popup` rule applied at all.** Every popup rule in the compiled CSS is
 * `.ui-render`-scoped by prefixwrap, `.ui-render` is a `<div>`
 * (`src/library/AppWrapper.js` for the library, `public/index.html` for the demo),
 * and SUIR's `PortalInner` mounted into `document.body` — outside it. The bubble
 * matched nothing but the two unscoped `*` rules, so the tooltip in the product was
 * unstyled text, positioned by nothing (see `e2e/reference.js` finding 1).
 *
 * Part 1 wrote both halves so the pair could not drift, and said in so many words
 * that when the replacement mounted inside the widget the negative half would flip
 * and "the diff is the record that the styling defect was fixed rather than
 * inherited". THIS FILE IS THAT DIFF. Every assertion below is the same question
 * asked of the new markup:
 *
 *   part 1                                   part 3
 *   ------------------------------------     ---------------------------------------
 *   `ui top left inverted popup              `tooltip no-wrap top show inverted`
 *   transition visible`                      (`EMITTED_CLASS`)
 *   13 scoped `.ui.popup` rules, but         14 scoped `.tooltip` rules, and they
 *   only in a hypothetical `mountNode`       apply to the node that actually ships
 *   6 `:before` arrow selectors              8 `::after` arrow selectors
 *   mounts in `document.body`                mounts inside `.ui-render` — INVERTED
 *   matches ZERO popup rules                 matches all 14 — INVERTED
 *   reached only by the two `*` rules        still reached by them too — UNCHANGED
 *
 * DELETED, and named rather than dropped: `styles the inner .content node only when
 * a .header precedes it`. It was the assertion that licensed part 3 to remove the
 * `.content` wrapper — exactly one rule in the whole stylesheet selects that node
 * (`.ui.popup > .header + .content`) and it needs a sibling `.header`, so in the
 * live header-less shape the wrapper carried no style whatsoever. The wrapper is
 * gone and there is no node left to ask about; what it protected (the body text
 * renders) is asserted in `TooltipPop.test.js` for all four `title` shapes.
 *
 * WHAT THIS FILE GAINED, because part 3 introduced facts only a stylesheet can hold:
 *   - `pointer-events: none` on the base rule. Obligation 4 of the step, and the
 *     hazard is real: a bubble painted over its trigger swallows the pointer and the
 *     trigger becomes unhoverable.
 *   - the four corner placements restating their own axis — part 3's fix for the
 *     browser leg's finding 4.
 *   - the two deliberate LOSSES against `.ui.popup`, pinned as absences so they stay
 *     decisions: no `max-width` and no `box-shadow`.
 *
 * WHAT THIS CANNOT SAY: `matches()` proves selector matching, not painted pixels.
 * Cascade, specificity, the `::after` arrow's geometry, z-index and clipping need a
 * browser — `e2e/harness.tooltip.pw.js`, where they are measured.
 *
 * COST, MEASURED, BECAUSE IT IS NOT FREE
 * -----------------------------------------------------------------------------
 * One LESS + PostCSS compile of `index.less` peaks at ~189 MB RSS / ~90 MB heap and
 * takes ~1 s. This is the THIRD suite to pay it (`css.compilation` compiles LESS,
 * `css.pipeline.parity` compiles LESS plus two PostCSS passes), and jest may
 * schedule all three into concurrent workers. It was kept as its own suite anyway,
 * because the alternatives were worse: compiling a reduced entry that imports only
 * the tooltip module would assert a stylesheet the product does not ship, and reading
 * the built `static/all.css` is not an option because that path is git-ignored, so
 * the gate would silently skip on a clean CI checkout. If this leg ever turns flaky
 * on memory, the fix is to fold these assertions into `css.pipeline.parity.test.js`
 * and reuse the `webpackCss` it has already compiled — not to weaken them.
 * -----------------------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');
const less = require('less');
const postcss = require('postcss');
const LessPluginFunctions = require('less-plugin-functions');
const React = require('react');
const { act, fireEvent, render } = require('@testing-library/react');
const webpackPostcssConfig = require('../../../postcss.config.js');
const TooltipPop = require('../../core/components/TooltipPop').default;

const STYLE_DIR = path.resolve(__dirname, '..');
const ENTRY = path.join(STYLE_DIR, 'index.less');

const TITLE = 'Discards every unsaved change';

/**
 * The class string `TooltipPop` emits from both engine entry points, pinned as a
 * literal in `TooltipPop.test.js` too. Repeated rather than imported so that a
 * change to the component fails BOTH files — one of them tells you the markup
 * moved, the other tells you which CSS rules went with it.
 */
const EMITTED_CLASS = 'tooltip no-wrap top show inverted';

/** The wrapper `TooltipPop` puts round its trigger, which is the positioned ancestor. */
const HOST_CLASS = 'tooltip-host';

/**
 * Every `.ui-render`-scoped rule that selects the emitted node, in stylesheet
 * order, with the properties it sets. THIS IS THE CLASSNAME CONTRACT: drop a token
 * from the class string and the rules listed against it stop applying.
 *
 *   tooltip    the box — 8 rules, because `tooltip.less` reaches most of them
 *              through `:extend` of the shared `.padding-small`, `.bg-neutral`,
 *              `.bg-blur`, `.border`, `.radius` and `.transition` utilities, each of
 *              which is a rule of its own. Between them: position/display/opacity/
 *              z-index/pointer-events, padding, background, backdrop-filter, border,
 *              border-radius, transition.
 *   no-wrap    `.no-wrap {white-space: nowrap}`. Emitted by `Tooltip.js` itself, and
 *              it is why the bubble does not wrap — there is no `max-width` any more.
 *   top        `.tooltip.top {bottom, left, transform}`. THE PLACEMENT IS THE
 *              REQUESTED ONE, not a resolved one: there is no flip, so nothing
 *              rewrites it at runtime.
 *   show       3 rules — `display: flex`, `visibility`, `z-index: 9`, and the
 *              `animation`/`animation-delay` pair. Without it `.tooltip
 *              {display: none}` wins. It is also what makes the bubble independent
 *              of whether a pointer happens to be inside the wrapper, which is what
 *              focus-open needs.
 *   inverted   `.tooltip.inverted {background-color}` and `.inverted {color}` — the
 *              whole colour scheme, and the reason `inverted` survived as a prop
 *              rather than becoming a dropped SUIR modifier.
 *
 * Derived from the compiled CSS, not from any documentation. Rules with no
 * declarations are excluded (there are none on this node), as are the two unscoped
 * `*` rules asserted separately below.
 */
const SCOPED_RULES = [
    { selector: '.ui-render .tooltip', props: ['position', 'display', 'opacity', 'z-index', 'pointer-events'] },
    { selector: '.ui-render .tooltip.show', props: ['animation-delay', 'visibility', 'display', 'z-index'] },
    { selector: '.ui-render .tooltip.show', props: ['animation-delay'] },
    { selector: '.ui-render .tooltip.top', props: ['bottom', 'left', 'transform'] },
    { selector: '.ui-render .tooltip', props: ['padding-top', 'padding-bottom', 'padding-left', 'padding-right'] },
    { selector: '.ui-render .no-wrap', props: ['white-space'] },
    { selector: '.ui-render .tooltip.show', props: ['animation'] },
    { selector: '.ui-render .tooltip', props: ['background-color'] },
    { selector: '.ui-render .tooltip.inverted', props: ['background-color'] },
    { selector: '.ui-render .tooltip', props: ['backdrop-filter', 'z-index'] },
    { selector: '.ui-render .inverted', props: ['color'] },
    { selector: '.ui-render .tooltip', props: ['border'] },
    { selector: '.ui-render .tooltip', props: ['border-radius'] },
    { selector: '.ui-render .tooltip', props: ['transition'] },
];

/** The two rules `inverted` buys, and nothing else — asserted by subtraction below. */
const INVERTED_RULES = [
    { selector: '.ui-render .tooltip.inverted', props: ['background-color'] },
    { selector: '.ui-render .inverted', props: ['color'] },
];

/**
 * The arrow. It is a `::after` pseudo-element with a real border, driven by the
 * PLACEMENT tokens — which is why a replacement that positions correctly but emits a
 * generic class has a bubble with no pointer. `matches()` cannot test a
 * pseudo-element, so these are asserted as present in the stylesheet instead.
 *
 * Eight selectors, and the shape of the list is itself the record of part 3's LESS
 * fix: the base rule plus `top`/`bottom`/`right` plus all four corners. There is
 * deliberately NO `.tooltip.left::after` — `left` inherits the base `::after`, which
 * is why `top left` needed only its two offsets restated while `top right` needed the
 * whole horizontal pointer rewritten (`.tooltip.right::after` would otherwise win on
 * source order over `.tooltip.top::after`).
 */
const ARROW_SELECTORS = [
    '.ui-render .tooltip::after',
    '.ui-render .tooltip.top::after',
    '.ui-render .tooltip.top.left::after',
    '.ui-render .tooltip.top.right::after',
    '.ui-render .tooltip.bottom::after',
    '.ui-render .tooltip.bottom.left::after',
    '.ui-render .tooltip.bottom.right::after',
    '.ui-render .tooltip.right::after',
];

/**
 * PART 3'S `tooltip.less` FIX, as a stylesheet fact.
 *
 * The browser leg measured (finding 4) that four of the eight placements were broken:
 * `.tooltip.left`/`.tooltip.right` set `top: 50%` at the same specificity as
 * `.tooltip.top`/`.tooltip.bottom`, so a corner class string matched both and the
 * axis lost — over-constrained for the `top` corners, on source order for the
 * `bottom` ones. The fix is that each corner rule restates its own axis property.
 *
 * Whether that fix WORKS is a cascade-and-layout question, answerable only in a
 * browser (`INLINE.PLACEMENT_WORKS`). Whether the declarations are still THERE is a
 * stylesheet question, and this is it — so a later tidy-up that deletes one as
 * "redundant" fails here, in the file that can explain why it is not.
 */
const CORNER_AXIS_DECLARATIONS = {
    '.ui-render .tooltip.top.left': 'top',
    '.ui-render .tooltip.top.right': 'top',
    '.ui-render .tooltip.bottom.left': 'top',
    '.ui-render .tooltip.bottom.right': 'top',
};

/**
 * The two properties `.ui.popup` had and `.tooltip` does not. Recorded as ABSENCES so
 * they stay decisions rather than becoming accidents:
 *
 *   max-width    `.ui.popup` capped the bubble at 250 px and let the body wrap. The
 *                inline bubble has no cap and `no-wrap` on top, so one long line
 *                stays one long line — measured 500 px for 73 characters. Adding a
 *                cap would touch a rule shared with `Slider`, `Upload` and the
 *                validation tooltip, so it is deliberately left to the maintainer;
 *                `docs/SUPPORTED-PROPS.md` carries it as an owed decision.
 *   box-shadow   `.ui.popup` and `.ui.inverted.popup` both set one. `.tooltip` has a
 *                border and a backdrop filter instead.
 */
const DELIBERATE_LOSSES = ['max-width', 'box-shadow'];

let rules;

/** Every rule of the final CSS as `{selector, props}`, one entry per selector. */
function ruleList (css) {
    const out = [];
    postcss.parse(css).walkRules(rule => {
        const props = [];
        rule.walkDecls(decl => { if (!props.includes(decl.prop)) props.push(decl.prop); });
        rule.selectors.forEach(selector => out.push({ selector: selector.replace(/\s+/g, ' ').trim(), props }));
    });
    return out;
}

const matching = node => rules.filter(rule => {
    try { return node.matches(rule.selector); } catch (error) { return false; }
});

const scopedMatching = node => matching(node)
    .filter(rule => rule.selector.startsWith('.ui-render'))
    .filter(rule => rule.props.length > 0);

beforeAll(async () => {
    // Same LESS invocation as `css.pipeline.parity.test.js`; `setup.js` (a global
    // `setupFiles` entry) has already placed `theme.config` for semantic-ui-less.
    const compiled = await less.render(fs.readFileSync(ENTRY, 'utf8'), {
        filename: ENTRY,
        paths: [STYLE_DIR],
        plugins: [new LessPluginFunctions()],
        javascriptEnabled: true,
    });
    const processed = await postcss(webpackPostcssConfig.plugins)
        .process(compiled.css, { from: undefined });
    rules = ruleList(processed.css);
}, 60000);

/**
 * Open a real tooltip inside a real `.ui-render` widget root and hand the caller its
 * bubble, its wrapper and its trigger.
 *
 * PART 3 NOTE — `mountNode` is gone, and its absence is the point. Part 1 needed that
 * prop to ask "what WOULD match if the bubble were inside the widget", because the
 * portal put it in `document.body` and no prop reachable from a meta could move it.
 * The bubble is now an ordinary child of the tree the widget already wraps, so the
 * hypothetical and the live case are the same case. `.ui-render` is applied to the
 * container itself, which is exactly the nesting `AppWrapper` and `public/index.html`
 * produce.
 */
function withOpenTooltip (props, assertions) {
    jest.useFakeTimers();
    const widget = document.createElement('div');
    widget.className = 'ui-render';
    document.body.appendChild(widget);
    const view = render(
        React.createElement(
            TooltipPop,
            { title: TITLE, inverted: true, ...props },
            React.createElement('button', { type: 'button' }, 'Reset'),
        ),
        { container: widget },
    );
    const host = view.container.firstChild;
    const trigger = host.firstChild;
    try {
        fireEvent.mouseEnter(trigger);
        act(() => { jest.advanceTimersByTime(500); });
        const bubble = widget.querySelector('.tooltip');
        // Assert the bubble EXISTS before handing it over. Without this a negative
        // assertion passes against a component that never opened: `matching(null)`
        // returns [] because its catch (there for the pseudo-element selectors
        // `matches()` rejects) also swallows the TypeError from `null.matches`.
        expect(bubble).not.toBeNull();
        assertions({ bubble, host, trigger, widget });
    } finally {
        fireEvent.mouseLeave(trigger);
        act(() => { jest.advanceTimersByTime(1000); });
        view.unmount();
        document.body.removeChild(widget);
        jest.useRealTimers();
    }
}

describe('the tooltip className contract, against the compiled CSS', () => {
    it('compiled a stylesheet with rules to match against', () => {
        expect(rules.length).toBeGreaterThan(1000);
    });

    it('emits the class string the rules below are keyed on', () => {
        withOpenTooltip({}, ({ bubble }) => {
            expect(bubble.getAttribute('class')).toBe(EMITTED_CLASS);
        });
    });

    it('matches exactly the pinned 14 scoped rules', () => {
        withOpenTooltip({}, ({ bubble }) => {
            expect(scopedMatching(bubble)).toEqual(SCOPED_RULES);
        });
    });

    it('loses exactly the two `inverted` rules when the caller does not ask for it', () => {
        // Subtraction rather than a second hard-coded list: this states what the token
        // BUYS, which is the thing a reader needs, and it cannot drift from the list
        // above.
        withOpenTooltip({ inverted: false }, ({ bubble }) => {
            expect(bubble.getAttribute('class')).toBe('tooltip no-wrap top show');
            expect(scopedMatching(bubble))
                .toEqual(SCOPED_RULES.filter(rule => !INVERTED_RULES.some(
                    dropped => dropped.selector === rule.selector,
                )));
        });
    });

    it('adds the two corner rules when a corner placement is requested', () => {
        // `top left` is the placement the corpus `all` example declares, and the one
        // the browser leg measured as broken before part 3 fixed `tooltip.less`.
        withOpenTooltip({ position: 'top left' }, ({ bubble }) => {
            expect(bubble.getAttribute('class')).toBe('tooltip no-wrap top left show inverted');
            const selectors = scopedMatching(bubble).map(rule => rule.selector);
            expect(selectors).toContain('.ui-render .tooltip.top.left');
            expect(selectors).toContain('.ui-render .tooltip.left');
        });
    });

    it('selects the wrapper `span` by exactly one rule, which positions it', () => {
        // The wrapper is not decoration: an absolutely positioned bubble resolves
        // against its nearest POSITIONED ancestor, and without this rule every
        // placement resolves against whatever `.app`-level box happens to be
        // positioned instead (measured: `top: -46px; left: 571px`).
        //
        // `width` is in this list for a measured reason, not for tidiness: the host is a flex item
        // wherever it lands in a flex container, CSS blockifies `inline-flex` to `flex` for a flex
        // item, and the container's default `align-items: stretch` then sizes the host to the
        // CONTAINER. Measured in Chrome on `#buttonIcon`: a 1222 px host around a 35 px button,
        // with the bubble 559 px from its trigger — the same "bubble nowhere near its trigger"
        // defect that taking this component in-house was meant to fix, reintroduced by layout
        // rather than by JavaScript. `width: fit-content` is a definite cross size, so `stretch`
        // stops applying. Deliberately `width` only: `height: fit-content` would also stop the
        // host stretching vertically in a ROW container, which is how a wrapped button gets its
        // height today.
        withOpenTooltip({}, ({ host }) => {
            expect(host.getAttribute('class')).toBe(HOST_CLASS);
            expect(scopedMatching(host)).toEqual([
                { selector: '.ui-render .tooltip-host', props: ['position', 'display', 'width'] },
            ]);
        });
    });

    it('ships every placement-keyed arrow rule the class vocabulary needs', () => {
        const selectors = new Set(rules.map(rule => rule.selector));
        ARROW_SELECTORS.forEach(selector => expect(selectors.has(selector)).toBe(true));
        // ...and no `left` corner-mate, which is why `top left` needed only two
        // declarations restated. Stated as an absence so the asymmetry is on record.
        expect(selectors.has('.ui-render .tooltip.left::after')).toBe(false);
    });

    it('gives the bubble `pointer-events: none` — obligation 4 of the step', () => {
        // THE HAZARD, and it is not hypothetical: positioned over its own trigger an
        // open bubble swallows the pointer, the trigger stops being hoverable, and
        // Playwright reported `intercepts pointer events` and retried to timeout.
        // Necessary and not sufficient — it fixed exactly one of five simulated
        // failures — so it is pinned here rather than trusted to survive a tidy-up.
        //
        // It also carries a behaviour: because the pointer can never land on the
        // bubble, travelling towards it leaves the wrapper and fires `mouseleave`, so
        // `DISMISSAL.pointerMovesOntoBubble` still closes — by a new mechanism.
        const base = rules.filter(rule => rule.selector === '.ui-render .tooltip'
            && rule.props.includes('pointer-events'));
        expect(base).toHaveLength(1);
        expect(base[0].props).toContain('display');
    });

    it('restates the axis property in all four corner placements', () => {
        // @Note: asserted as one object comparison rather than per-selector `expect`s with a message
        //  argument — that is Playwright's `expect(value, message)` signature, and Jest's takes one
        //  argument only ("Expect takes at most one argument"). Comparing whole objects keeps the
        //  selector visible in the failure output, which is what the message was for.
        const measured = {};
        const expected = {};
        Object.entries(CORNER_AXIS_DECLARATIONS).forEach(([selector, property]) => {
            const rule = rules.find(one => one.selector === selector);
            measured[selector] = rule ? rule.props.includes(property) : 'selector missing';
            expected[selector] = true;
        });
        expect(measured).toEqual(expected);
    });

    it('records the two properties `.ui.popup` had that `.tooltip` deliberately does not', () => {
        withOpenTooltip({}, ({ bubble }) => {
            const set = new Set();
            scopedMatching(bubble).forEach(rule => rule.props.forEach(prop => set.add(prop)));
            DELIBERATE_LOSSES.forEach(prop => expect(set.has(prop)).toBe(false));
            // The half that is NOT lost, so this reads as an inventory rather than a
            // complaint: the border and the backdrop filter are what replace the shadow.
            expect(set.has('border')).toBe(true);
            expect(set.has('backdrop-filter')).toBe(true);
        });
    });
});

describe('where the bubble mounts now — the live styling defect, fixed', () => {
    /**
     * §9.7-F1 step 2's premise was falsified by part 1 and is repaired here. Part 1
     * pinned "mounts in `document.body`, outside the widget" and "matches ZERO of the
     * popup rules written for exactly this markup" as CURRENT behaviour, in the same
     * spirit as the R16/H8 leak inventory next door — a test that fails if it changes
     * either way, so fixing it is a deliberate act.
     *
     * This is the deliberate act. Both assertions are inverted, and the inversion is
     * the record. The browser leg pins the same pair as computed style
     * (`CORPUS.INSIDE_UI_RENDER`, `CORPUS.PAINT`), which is the half `matches()` can
     * never reach.
     */
    it('renders the bubble inside the .ui-render widget, with no portal anywhere', () => {
        withOpenTooltip({}, ({ bubble, widget, host }) => {
            expect(bubble.closest('.ui-render')).toBe(widget);
            expect(bubble.parentElement).toBe(host);
            expect(document.querySelectorAll('[data-suir-portal="true"]')).toHaveLength(0);
        });
    });

    it('therefore matches all 14 of the rules written for exactly this markup', () => {
        withOpenTooltip({}, ({ bubble }) => {
            expect(scopedMatching(bubble)).toHaveLength(SCOPED_RULES.length);
            expect(scopedMatching(bubble)).not.toEqual([]);
        });
    });

    /**
     * UNCHANGED, and it belongs here rather than being dropped as uninteresting: the
     * two unscoped `*` rules that §2.6-7 / R16 records as escaping prefixwrap reach
     * this node too. They reached the portaled bubble as well — where they were the
     * ONLY thing that reached it. So the leak is not a tooltip problem and the fix did
     * not touch it; recording that keeps the two facts from being confused.
     */
    it('is still reached by the two unscoped rules the H8 leak already documents', () => {
        withOpenTooltip({}, ({ bubble }) => {
            const unscoped = matching(bubble).filter(rule => !rule.selector.startsWith('.ui-render'));

            expect(unscoped.map(rule => rule.selector)).toEqual(['*', '*']);
        });
    });
});
