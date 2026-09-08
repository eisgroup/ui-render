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
 * it; a token worth thirteen is load-bearing and dropping it unstyles the control. That is the
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
const less = require('less');
const postcss = require('postcss');
const LessPluginFunctions = require('less-plugin-functions');
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
 *              names both. `selection` is worth all but one, which is why `mapper.js` defaulting
 *              it to true is load-bearing rather than cosmetic. `active`/`visible` are the open
 *              state and only exist while open.
 *   text       the placeholder box. `divider` is Semantic's name for "nothing selected yet".
 *   icon       `icon` and `dropdown` are each worth all thirteen: the rules name `i.icon.dropdown`
 *              and `.dropdown.icon`, so BOTH tokens must be on the same element.
 *   menu       `menu` carries most of it; `transition` is the project's own animation layer and
 *              `visible` the open state. `DropdownMenu.js` hard-codes `'menu transition'`.
 *   option     `item` is the option itself; `selected` is the keyboard cursor and `active` the
 *              committed value — one rule and two rules respectively, so a replacement that names
 *              them differently loses little, but loses it silently.
 */
const TOKEN_CONTRACT = {
    control: { classes: 'ui selection dropdown active visible', total: 13,
        worth: { ui: 13, dropdown: 13, selection: 12, active: 4, visible: 1 } },
    text: { classes: 'text divider', total: 6, worth: { text: 6, divider: 2 } },
    icon: { classes: 'icon dropdown', total: 13, worth: { icon: 13, dropdown: 13 } },
    menu: { classes: 'menu transition visible', total: 14,
        worth: { menu: 11, transition: 4, visible: 3 } },
    option: { classes: 'item selected active', total: 7,
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
        const control = container.querySelector('[role="listbox"]');
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
