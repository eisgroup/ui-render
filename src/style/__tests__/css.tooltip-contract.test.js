/**
 * TOOLTIP CLASSNAME → CSS RULE JOIN ===========================================
 *
 * UPGRADE-PLAN §9.7-F1 step 2, part 1, and the §9.5 CSS-gate family.
 *
 * WHY A STYLE TEST RENDERS A REACT COMPONENT
 * -----------------------------------------------------------------------------
 * `TooltipPop.test.js` pins the class string the component emits. `css.compilation`
 * and `css.pipeline.parity` pin the CSS the build produces. Neither can see the
 * JOIN — whether any rule in the stylesheet actually selects the node the component
 * renders — and the join is where the interesting defect lives. So this suite
 * compiles the real CSS through the real webpack PostCSS stage, renders the real
 * open tooltip, and runs `Element.matches()` for every rule against the real node.
 *
 * THE FINDING IT PINS, WHICH CONTRADICTS THE INSTRUCTION STEP 2 WAS GIVEN
 * -----------------------------------------------------------------------------
 * §9.7-F1 step 2 says to "keep emitting `ui popup`-compatible classNames until
 * Step 4 so the current CSS continues to apply". Measured: **no `.ui.popup` rule
 * applies today.** Every popup rule in the compiled CSS is `.ui-render`-scoped by
 * prefixwrap, `.ui-render` is a `<div>` (`src/library/AppWrapper.js` for the
 * library, `public/index.html` for the demo), and SUIR's `PortalInner` mounts into
 * `document.body` — outside it. So the bubble matches nothing but the two unscoped
 * `*` rules, and the tooltip you see in the product is unstyled text positioned by
 * Popper, visible only because `.ui.visible.popup{display:block}` never reaches it
 * either and the browser default applies.
 *
 * Both halves are asserted below, so the pair cannot drift:
 *   (a) inside `.ui-render` the emitted class string matches 13 specific rules —
 *       this is the real className contract, and the list names what each token
 *       buys;
 *   (b) where the portal actually mounts today it matches zero of them.
 *
 * When step 2 mounts the replacement inside the widget (SUIR's own `mountNode`
 * already does it — see `TooltipPop.test.js`), (b) flips and (a) becomes live. That
 * is a deliberate edit to this file, and the diff is the record that the styling
 * defect was fixed rather than inherited.
 *
 * WHAT THIS CANNOT SAY: `matches()` proves selector matching, not painted pixels.
 * Cascade, specificity, the `::before` arrow's geometry, z-index and clipping need
 * a browser — §9.5's Playwright item, where they are named as gaps.
 *
 * COST, MEASURED, BECAUSE IT IS NOT FREE
 * -----------------------------------------------------------------------------
 * One LESS + PostCSS compile of `index.less` peaks at ~189 MB RSS / ~90 MB heap and
 * takes ~1 s. This is the THIRD suite to pay it (`css.compilation` compiles LESS,
 * `css.pipeline.parity` compiles LESS plus two PostCSS passes), and jest may
 * schedule all three into concurrent workers. It was kept as its own suite anyway,
 * because the alternatives were worse: compiling a reduced entry that imports only
 * the popup module would assert a stylesheet the product does not ship, and reading
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
const EMITTED_CLASS = 'ui top left inverted popup transition visible';

/**
 * Every `.ui-render`-scoped rule that selects the emitted node, in stylesheet
 * order, with the properties it sets. THIS IS THE CLASSNAME CONTRACT: drop a token
 * from the class string and the rules listed against it stop applying.
 *
 *   ui + popup   the box (4 rules) and the arrow pseudo-element
 *   top          vertical margin, and the arrow's colour
 *   top + left   transform-origin and the horizontal arrow offset
 *   inverted     the entire colour scheme, plus our own border override
 *   transition   our own compact transition.less, not Semantic's 12 KB module
 *   visible      `display: block` — without it `.ui.popup{display:none}` wins
 *
 * Derived from the compiled CSS, not from Semantic's documentation. Rules with no
 * declarations are excluded (there is one, an empty `.ui-render .ui {}`), as are
 * the two unscoped `*` rules asserted separately below.
 */
const SCOPED_RULES = [
    { selector: '.ui-render .inverted', props: ['color'] },
    { selector: '.ui-render .transition', props: ['transition'] },
    {
        selector: '.ui-render .ui.popup',
        props: [
            'display', 'position', 'top', 'right', 'min-width', 'z-index', 'border', 'line-height',
            'max-width', 'background', 'padding', 'font-weight', 'font-style', 'color', 'border-radius',
            'box-shadow',
        ],
    },
    { selector: '.ui-render .ui.popup', props: ['margin'] },
    { selector: '.ui-render .ui.top.popup', props: ['margin'] },
    { selector: '.ui-render .ui.top.left.popup', props: ['transform-origin'] },
    { selector: '.ui-render .ui.top.left.popup', props: ['margin-left'] },
    { selector: '.ui-render .ui.visible.popup', props: ['display'] },
    { selector: '.ui-render .ui.visible.popup', props: ['transform', 'backface-visibility'] },
    { selector: '.ui-render .ui.inverted.popup', props: ['background', 'color', 'border', 'box-shadow'] },
    { selector: '.ui-render .ui.popup', props: ['font-size'] },
    { selector: '.ui-render .ui.popup', props: ['transition'] },
    { selector: '.ui-render .ui.popup.inverted', props: ['border'] },
];

/**
 * The arrow. Popper's own `arrow` modifier is disabled (`Popup.js` sets
 * `enabled: false`), so the arrow is entirely a `:before` on the bubble, driven by
 * the PLACEMENT tokens — which is why a replacement that positions correctly but
 * emits a generic class has a bubble with no pointer. `matches()` cannot test a
 * pseudo-element, so these are asserted as present in the stylesheet instead.
 */
const ARROW_SELECTORS = [
    '.ui-render .ui.popup:before',
    '.ui-render .ui.top.popup:before',
    '.ui-render .ui.top.left.popup:before',
    '.ui-render .ui.inverted.popup:before',
    '.ui-render .ui.inverted.top.popup:before',
    '.ui-render .ui.popup.inverted.top:before',
];

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
 * Open a real tooltip and hand the caller its bubble. `mountNode` decides whether
 * the portal lands inside the widget or where it lands today.
 */
function withOpenTooltip (props, assertions) {
    jest.useFakeTimers();
    const view = render(
        React.createElement(
            TooltipPop,
            { title: TITLE, inverted: true, ...props },
            React.createElement('button', { type: 'button' }, 'Reset'),
        )
    );
    const trigger = view.container.firstChild;
    try {
        fireEvent.mouseEnter(trigger);
        act(() => { jest.advanceTimersByTime(500); });
        const bubble = document.querySelector('.popup');
        // Assert the bubble EXISTS before handing it over. Without this the negative assertions
        // below pass against a component that never opened: `matching(null)` returns [] because
        // its catch (there for pseudo-element selectors `matches()` rejects) also swallows the
        // TypeError from `null.matches`. Measured: a wholesale replacement failed 51 of 65 tests
        // here and "matches zero popup rules" was one of the survivors.
        expect(bubble).not.toBeNull();
        assertions({ bubble, trigger });
    } finally {
        fireEvent.mouseLeave(trigger);
        act(() => { jest.advanceTimersByTime(1000); });
        view.unmount();
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

    it('matches exactly the pinned 13 scoped rules when the bubble sits inside .ui-render', () => {
        const host = document.createElement('div');
        host.className = 'ui-render';
        document.body.appendChild(host);
        try {
            withOpenTooltip({ mountNode: host }, ({ bubble }) => {
                expect(bubble.closest('.ui-render')).toBe(host);
                expect(scopedMatching(bubble)).toEqual(SCOPED_RULES);
            });
        } finally {
            document.body.removeChild(host);
        }
    });

    it('ships every placement-keyed arrow rule the class string needs', () => {
        const selectors = new Set(rules.map(rule => rule.selector));
        ARROW_SELECTORS.forEach(selector => expect(selectors.has(selector)).toBe(true));
    });

    /**
     * The inner `.content` div is touched by exactly ONE rule in the whole
     * stylesheet, and it needs a sibling `.header`. In the live, header-less shape
     * it carries no style at all — so a replacement is free to drop that wrapper,
     * and this is the assertion that says so rather than leaving it to be guessed.
     */
    it('styles the inner .content node only when a .header precedes it', () => {
        const host = document.createElement('div');
        host.className = 'ui-render';
        document.body.appendChild(host);
        try {
            withOpenTooltip({ mountNode: host }, ({ bubble }) => {
                expect(scopedMatching(bubble.querySelector('.content'))).toEqual([]);
            });
            withOpenTooltip({ mountNode: host, header: 'Reset' }, ({ bubble }) => {
                expect(scopedMatching(bubble.querySelector('.content'))).toEqual([
                    { selector: '.ui-render .ui.popup > .header + .content', props: ['padding-top'] },
                ]);
            });
        } finally {
            document.body.removeChild(host);
        }
    });
});

describe('where the portal actually mounts today — the live styling defect', () => {
    /**
     * §9.7-F1 step 2's premise, falsified. Not one of the 13 rules above applies to
     * the tooltip the product renders. Pinned as CURRENT behaviour, in the same
     * spirit as the R16/H8 leak inventory next door: the test fails if it changes
     * EITHER way, so fixing it is a deliberate act and regressing it is loud.
     */
    it('mounts the bubble in document.body, outside the .ui-render widget', () => {
        withOpenTooltip({}, ({ bubble }) => {
            expect(bubble.closest('.ui-render')).toBeNull();
            expect(document.querySelector('[data-suir-portal="true"]').parentElement)
                .toBe(document.body);
        });
    });

    it('therefore matches ZERO of the popup rules written for exactly this markup', () => {
        withOpenTooltip({}, ({ bubble }) => {
            expect(scopedMatching(bubble)).toEqual([]);
        });
    });

    /**
     * What DOES reach it: the two unscoped `*` rules that §2.6-7 / R16 records as
     * escaping prefixwrap. So the only styling the live tooltip inherits is part of
     * the host-page leak — including the `color` it picks up from the unscoped
     * `body` rule, which is why the text is dark-on-transparent instead of
     * light-on-grey.
     */
    it('is reached only by the unscoped rules the H8 leak already documents', () => {
        withOpenTooltip({}, ({ bubble }) => {
            const unscoped = matching(bubble).filter(rule => !rule.selector.startsWith('.ui-render'));

            expect(unscoped.map(rule => rule.selector)).toEqual(['*', '*']);
        });
    });
});
