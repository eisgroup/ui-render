/**
 * THE DROPDOWN'S CLASS-STRING ↔ CSS JOIN — what the replacement must keep emitting.
 * =============================================================================================
 *
 * `css.tooltip-contract.test.js` exists because neither the markup tests nor the CSS tests could
 * see the join between them: a component can emit a perfectly reasonable class string that no
 * loaded rule selects, and every other suite stays green. §9.7-F1 step 3 part 1's audit found the
 * dropdown had no such file, even though `modules/dropdown` is the LARGEST semantic module in the
 * compiled output and the step that replaces the component is the one most likely to change the
 * markup.
 *
 * WHAT THIS PINS, AND WHY IN THIS SHAPE. Not a list of selectors — there are over fifty reaching
 * five nodes, nobody reads such a list, and it says nothing about which parts matter. Instead, per
 * node, WHAT EACH CLASS TOKEN IS WORTH: the token is removed from the rendered node and the scoped
 * rules that stop matching are counted. A token worth zero is inert and the replacement may drop
 * it; a token worth fifteen is load-bearing and dropping it unstyles the control. That is the
 * question a rewrite actually asks, and the numbers below are measured, not chosen.
 *
 * The counts are of `.ui-render`-scoped rules WITH declarations. They include the project's own
 * LESS as well as `semantic-ui-less`, deliberately: step 4 re-homes the semantic modules, and at
 * that point this file is what says whether the re-homing kept the contract.
 *
 * WHAT IT CANNOT SAY, so it is not overclaimed: whether the result LOOKS right. `Element.matches`
 * proves a selector reaches a node, never that anything painted, and jsdom resolves no cascade and
 * no layout. The browser leg (`e2e/keyboard-a11y.pw.js`, `e2e/reference.js`'s `DROPDOWN` block)
 * owns painted style and geometry.
 */
const fs = require('fs');
const path = require('path');

const postcss = require('postcss');
const { lessOptions, less } = require('../../../scripts/less-options.js');
const React = require('react');
const { fireEvent, render } = require('@testing-library/react');
const webpackPostcssConfig = require('../../../postcss.config.js');
const { Dropdown } = require('../../core/components/Dropdown');
const { ConfigContext, initialConfigState } = require('../../core/contexts/ConfigContext');

const STYLE_DIR = path.resolve(__dirname, '..');
const ENTRY = path.join(STYLE_DIR, 'index.less');

/**
 * Per node: the class string it renders, and what each token is worth in scoped rules.
 *
 * Read the `worth` numbers as "rules that stop matching if the replacement drops this token".
 *   control    `ui` and `dropdown` are worth EVERYTHING — every rule that reaches the control
 *              names both. `selection` is worth all but one, which is why `mapper.tsx` defaulting
 *              it to true is load-bearing rather than cosmetic. `active`/`visible` are the open
 *              state and only exist while open.
 *   text       the placeholder box. `divider` is Semantic's name for "nothing selected yet".
 *   icon       `icon` and `dropdown` are each worth all fourteen: the rules name `i.icon.dropdown`
 *              and `.dropdown.icon`, so BOTH tokens must be on the same element.
 *   menu       `menu` carries most of it; `transition` is the project's own animation layer and
 *              `visible` the open state. `DropdownMenu.js` hard-codes `'menu transition'`.
 *   option     `item` is the option itself; `selected` is the keyboard cursor and `active` the
 *              committed value — one rule and two rules respectively, so a replacement that names
 *              them differently loses little, but loses it silently.
 *
 * EVERY `total` ROSE BY EXACTLY 2 AT THE §9.9-H8 DECISION (2026-09-11), and no `worth` moved. Both
 * halves of that matter. The +2 is the pair of `*` rules — the tap-highlight reset and
 * `box-sizing: inherit` — which used to escape prefixwrap and are now scoped as `.ui-render *`.
 * They did not start applying to these nodes: as unscoped `*` they applied to every element on the
 * page. They started being COUNTED here, because this file counts scoped rules. Nothing about how
 * a dropdown looks changed.
 *
 * The `worth` numbers are unmoved because they are deltas — "rules that stop matching when this
 * token is dropped" — and `.ui-render *` matches with or without any class token. That is the
 * check worth keeping in mind if these numbers ever move again: a change that shifts `total` and
 * `worth` together is a change to the STYLING; a change that shifts only `total` is a change to
 * what is in scope.
 *
 * `text` 8 → 10 AND ITS `text` TOKEN 6 → 7, with the combobox pattern (`Listbox.tsx`). The `.text`
 * is the control now and a click focuses it, so in this OPEN render it matches two focus rules it
 * never matched: the global `.ui-render *:focus:not(a, .a)` ring, and `> .text[role="combobox"]:focus`,
 * which cancels that ring and is the one rule the token is worth. Styling, by the rule above, and
 * measured in Chromium: every state of the dropdown computes the same border, shadow, background
 * and radius as before, because `dropdown.overrides` and `input.less` repeat each focus style for
 * `:focus-within`.
 *
 * `control` 15 → 17, `icon` 15 → 16 AND `menu` 16 → 17, EACH OF THEIR CLASS TOKENS BY AS MUCH, with
 * nwsapi 2.2.28, jsdom's selector engine (2026-10-06). Up to 2.2.23 it answered `:focus-within` false
 * even with focus inside the element, so the four rules those focus repeats add were not counted:
 * `.ui.selection.dropdown:focus-within` twice on the control, its `i.icon.dropdown` and its `.menu`.
 * Chromium always matched them, since a click focuses the combobox inside the open dropdown. A styling
 * count by the rule above (`total` and `worth` moved together), and nothing about how the dropdown
 * looks changed: the count caught up with the browser.
 *
 * `menu` STAYS 17 although the list took `tabIndex={-1}` (2026-10-09), out of the tab order
 * (`Listbox.tsx`: Chromium made a list long enough to scroll a focusable scroller, and Tab landed on
 * it). `_app.less`'s `*[tabIndex="-1"]` would have matched it and taken the open menu's shadow with
 * its `box-shadow: none !important`, so the rule now excludes `[role="listbox"]`.
 */
const TOKEN_CONTRACT = {
    control: { classes: 'ui selection dropdown active visible', total: 17,
        worth: { ui: 15, dropdown: 15, selection: 14, active: 4, visible: 1 } },
    text: { classes: 'text divider', total: 10, worth: { text: 7, divider: 2 } },
    icon: { classes: 'icon dropdown', total: 16, worth: { icon: 14, dropdown: 14 } },
    menu: { classes: 'menu transition visible', total: 17,
        worth: { menu: 12, transition: 4, visible: 3 } },
    option: { classes: 'item selected active', total: 9,
        worth: { item: 6, active: 2, selected: 1 } },
};

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

const scopedRuleCount = node => rules.filter(rule => {
    try { return node.matches(rule.selector); } catch (error) { return false; }
}).filter(rule => rule.selector.startsWith('.ui-render')).filter(rule => rule.props.length > 0).length;

beforeAll(async () => {
    // The same LESS invocation as `css.tooltip-contract.test.js`; `setup.js` (a global
    const compiled = await less.render(fs.readFileSync(ENTRY, 'utf8'), {
        filename: ENTRY,
        paths: [STYLE_DIR],
        ...lessOptions(),
    });
    const processed = await postcss(webpackPostcssConfig.plugins)
        .process(compiled.css, { from: undefined });
    rules = ruleList(processed.css);
}, 60000);

/** A real dropdown inside a real `.ui-render`, OPEN — which is when every node exists. */
const withOpenDropdown = assertions => {
    const { container, unmount } = render(
        React.createElement('div', { className: 'ui-render' },
            React.createElement(ConfigContext.Provider, { value: initialConfigState },
                React.createElement(Dropdown, {
                    options: [{ text: 'Option A', value: 'a' }, { text: 'Option B', value: 'b' }],
                    name: 'region',
                    onChange: () => {},
                })))
    );
    try {
        // The dropdown element, which the class string is on: the box around the combobox (`.text`),
        // its icon and its listbox. Found by role, so a broken class string fails the assertions
        // below rather than the lookup.
        const control = container.querySelector('[role="combobox"]').parentElement;
        fireEvent.click(control);
        assertions({
            control,
            text: control.querySelector('.text'),
            icon: control.querySelector('i'),
            menu: control.querySelector('.menu'),
            option: control.querySelector('[role="option"]'),
        });
    } finally {
        unmount();
    }
};

describe('the dropdown class string against the loaded CSS', () => {
    it('renders exactly the class tokens the contract is written against', () => {
        withOpenDropdown(nodes => {
            // SORTED, so ORDER is deliberately not pinned. The order a class attribute lists its
            // tokens in cannot change what any selector matches, so pinning the literal string
            // would pin an implementation detail of the current library — a replacement emitting
            // the same tokens in its own order is not a regression, and a test that called it one
            // would be noise. What must not change is the SET.
            const tokens = node => node.className.split(/\s+/).filter(Boolean).sort().join(' ');
            const measured = {};
            const expected = {};
            Object.entries(TOKEN_CONTRACT).forEach(([name, contract]) => {
                measured[name] = nodes[name] ? tokens(nodes[name]) : 'node missing';
                expected[name] = contract.classes.split(/\s+/).sort().join(' ');
            });

            expect(measured).toEqual(expected);
        });
    });

    it('joins every node to the scoped stylesheet', () => {
        withOpenDropdown(nodes => {
            const measured = {};
            const expected = {};
            Object.entries(TOKEN_CONTRACT).forEach(([name, contract]) => {
                measured[name] = nodes[name] ? scopedRuleCount(nodes[name]) : 'node missing';
                expected[name] = contract.total;
            });

            // A drop here means the replacement (or step 4's re-homing) stopped reaching rules
            // this node used to be styled by. A RISE is not automatically wrong, but it is never
            // accidental either — update the number and say what bought it.
            expect(measured).toEqual(expected);
        });
    });

    it('pins what each class token is worth, so an inert one is distinguishable from a load-bearing one', () => {
        withOpenDropdown(nodes => {
            const measured = {};
            const expected = {};
            Object.entries(TOKEN_CONTRACT).forEach(([name, contract]) => {
                const node = nodes[name];
                if (!node) { measured[name] = 'node missing'; expected[name] = contract.worth; return; }

                const total = scopedRuleCount(node);
                measured[name] = {};
                Object.keys(contract.worth).forEach(token => {
                    if (!node.classList.contains(token)) { measured[name][token] = 'token missing'; return; }
                    node.classList.remove(token);
                    measured[name][token] = total - scopedRuleCount(node);
                    node.classList.add(token);
                });
                expected[name] = contract.worth;
            });

            expect(measured).toEqual(expected);
        });
    });

    it('has no token that is worth nothing — an inert token would be dead markup', () => {
        // Stated separately from the numbers above because it is the reader-facing claim: every
        // class this component emits on these five nodes currently buys it styling. If a
        // replacement adds a token, this is where "is it doing anything?" gets answered.
        const inert = [];
        Object.entries(TOKEN_CONTRACT).forEach(([name, contract]) => {
            Object.entries(contract.worth).forEach(([token, worth]) => {
                if (worth === 0) inert.push(`${name}.${token}`);
            });
        });

        expect(inert).toEqual([]);
    });
});
