/**
 * CSS pipeline parity gate — §9.5 ("CSS pipeline parity"), evidence in §2.6-7, risk R16, decision §9.9-H8.
 *
 * `css.compilation.test.js` compiles LESS and stops there, so it cannot see scoping at all: prefixwrap runs
 * *after* LESS, in PostCSS. This suite runs the two real PostCSS stages the project actually ships:
 *
 *   1. the webpack stage — the plugin list from the root `postcss.config.js`, which `postcss-loader` feeds
 *      in all three webpack configs (library, demo, watch). This is what produces the published
 *      `static/all.css`.
 *   2. the standalone stage — the prefixwrap options exported by `scripts/build-css.js`, which produces
 *      `public/static/ui-render.built.css`.
 *
 * Cost: the LESS compile is ~0.7 s and each PostCSS pass ~30 ms, so running the real pipeline in Jest is
 * cheap enough to gate on every run — no built artifact required. The published artifact is cross-checked
 * as well when it happens to be present (see the last describe block), which is what proves this in-process
 * reproduction matches what `npm run build-lib` emits.
 *
 * WHAT THIS PINS, AND WHY IT DOES NOT FIX ANYTHING
 * -----------------------------------------------
 * §9.9-H8 IS DECIDED (2026-09-11): **option (a) — the published stylesheet must not touch the host page
 * at all, only its own wrapper.** So `postcss.config.js` stopped exempting `html`, `body` and `*` from
 * prefixwrap, and the two pipelines are now identical. This file did exactly what it was written to do:
 * its own header said "when H8 is decided, these constants are meant to be edited deliberately: option (a)
 * drives every count below to 0 and makes the two pipelines identical". Every count below is 0.
 *
 * WHAT THE LEAK WAS, kept because deleting it would erase the evidence for the decision. 11 rules escaped
 * `.ui-render` and applied to any page that merely loaded `static/all.css` — and the worst of them were not
 * the reset: `display:flex; flex-direction:column; position:relative` and `flex:1; align-self:stretch`
 * landed on the host's `<body>`, alongside `margin:0`, our background colour, our base font, and
 * `box-sizing` on its `<html>`. A host with its own layout could be visibly broken by importing our CSS.
 *
 * WHERE THOSE DECLARATIONS WENT, measured rather than assumed, because the option that looks right is the
 * one that breaks: with the exemptions removed, `body { … }` becomes `.ui-render { … }` — the rules land on
 * our own root box, which is what they were always for. prefixwrap's `prefixRootTags: true` instead produces
 * `.ui-render .body { … }`, a CLASS selector matching nothing, silently dropping them. Do not turn it on.
 *
 * The suite now pins the ABSENCE, which is the durable property: nothing escapes, and the two pipelines
 * agree. A future rule written against `html`, `body` or a bare `*` fails here rather than shipping.
 */
const fs = require('fs');
const path = require('path');
const less = require('less');
const postcss = require('postcss');
const prefixwrap = require('postcss-prefixwrap');
const LessPluginFunctions = require('less-plugin-functions');

const webpackPostcssConfig = require('../../../postcss.config.js');
const standaloneBuild = require('../../../scripts/build-css.js');

const ROOT = path.resolve(__dirname, '../../..');
const STYLE_DIR = path.resolve(__dirname, '..');
const ENTRY = path.join(STYLE_DIR, 'index.less');
/** The root payload, not `dist/static/all.css` — since §0.7 the dist copy is only an `@import` re-export. */
const PUBLISHED_CSS = path.join(ROOT, 'static', 'all.css');

const WRAP = '.ui-render';

/**
 * §9.9-H8, decided: NOTHING is exempt from prefixwrap any more except the `.ui-render-*` rules, which
 * must stay global because `rc-picker` portals its dropdown outside the wrapper. Empty is the assertion.
 */
const H8_EXEMPT_SELECTORS = [];

/** §9.9-H8, decided: zero unscoped occurrences. Was `{ '*': 2, body: 6, html: 5 }` — 13 in all. */
const H8_LEAK_OCCURRENCES = {};

/**
 * R16 / §9.9-H8: the full inventory of rules the published CSS applies to the host page — the selectors and
 * the properties they set. This is the documentation of the leak: every entry is a declaration block a host
 * page receives merely by loading `static/all.css`.
 *
 * Recorded from the unminified PostCSS output, which is deterministic. The published file is minified
 * afterwards by `css-minimizer-webpack-plugin`, and cssnano legitimately merges/splits declaration blocks —
 * so the published artifact is checked at selector granularity only, further down.
 */
const H8_LEAK_INVENTORY = [];

/**
 * THE LEAK AS IT SHIPPED, kept verbatim as the record of what §9.9-H8 decided against. Every entry was a
 * declaration block a host page received merely by loading `static/all.css`. It is a comment now rather
 * than an assertion because `H8_LEAK_INVENTORY` above is empty and must stay empty:
 *
 *     { at: '', global: ['body', 'html'], props: ['display', 'flex-direction', 'position'] },
 *     { at: '', global: ['body'], props: ['align-self', 'flex'] },
 *     { at: '', global: ['*'], props: ['-moz-tap-highlight-color', '-webkit-tap-highlight-color'] },
 *     { at: '', global: ['html'], props: ['box-sizing', 'font-size', 'height'] },
 *     {
 *         at: '',
 *         global: ['body'],
 *         props: [
 *             '-moz-osx-font-smoothing', '-webkit-font-smoothing', 'background-color', 'color',
 *             'min-height', 'overflow-x', 'position',
 *         ],
 *     },
 *     {
 *         at: '@media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none)',
 *         global: ['body', 'html'],
 *         props: ['display'],
 *     },
 *     { at: '', global: ['body'], props: ['font-family', 'font-size', 'font-style', 'font-weight', 'line-height'] },
 *     { at: '', global: ['*'], props: ['box-sizing'] },
 *     { at: '', global: ['html'], props: ['box-sizing'] },
 *     { at: '', global: ['html'], props: ['-ms-text-size-adjust', '-webkit-text-size-adjust', 'line-height'] },
 *     { at: '', global: ['body'], props: ['margin'] },
 */

/**
 * §9.9-H8, decided: the two pipelines no longer disagree about any rule. Was 11 — every one of them an
 * `html`/`body`/`*` rule, asserted rather than assumed. Pinned at 0 so a future exemption added to either
 * config fails here and has to be argued for.
 */
const H8_DIVERGENT_RULES = 0;

/**
 * Behavioural probe for the prefixwrap configuration difference. Comparing option objects would not work:
 * `postcss.config.js` exports already-instantiated plugins, which do not expose their options. Comparing
 * *behaviour* is also the stronger check — it survives a rewrite of either config.
 */
const PROBE_SELECTORS = [
    'html',
    'body',
    '*',
    '*:before',
    ':root',
    'button',
    '.foo',
    '.ui-render-picker',
    'html [type="button"]',
    'html body',
];

/** What each probe selector becomes. Identical rows = agreement; differing rows = the H8 divergence. */
const PROBE_EXPECTATIONS = [
    // The first three rows are where the two configs used to disagree, and they are the whole of
    // §9.9-H8 in miniature. `webpack` read `'html'`, `'body'`, `'*'` — unscoped, reaching the host.
    // Note what the scoped column actually does, because it is the reason option (a) is safe:
    // `html` and `body` become `.ui-render` ITSELF, so declarations meant for the root box land on
    // our root box rather than being dropped or being left on the host's.
    { selector: 'html', webpack: '.ui-render', standalone: '.ui-render' },
    { selector: 'body', webpack: '.ui-render', standalone: '.ui-render' },
    { selector: '*', webpack: '.ui-render *', standalone: '.ui-render *' },
    { selector: '*:before', webpack: '.ui-render *:before', standalone: '.ui-render *:before' },
    { selector: ':root', webpack: '.ui-render', standalone: '.ui-render' },
    { selector: 'button', webpack: '.ui-render button', standalone: '.ui-render button' },
    { selector: '.foo', webpack: '.ui-render .foo', standalone: '.ui-render .foo' },
    { selector: '.ui-render-picker', webpack: '.ui-render-picker', standalone: '.ui-render-picker' },
    { selector: 'html [type="button"]', webpack: '.ui-render [type="button"]', standalone: '.ui-render [type="button"]' },
    { selector: 'html body', webpack: '.ui-render body', standalone: '.ui-render body' },
];

/**
 * Classify one selector of a compiled rule.
 *
 * - `wrapped`    — inside the widget: `.ui-render`, `.ui-render .x`, `.ui-render *`.
 * - `namespaced` — the `.ui-render-*` class namespace, exempted from prefixwrap in *both* pipelines. It
 *                  exists for rc-picker, which renders its dropdown into a portal outside the wrapper; the
 *                  selectors are still class-namespaced, so they cannot match host markup.
 * - `global`     — everything else: a selector that can match host markup. This is what must not grow.
 */
function scopeOf (selector) {
    if (/^\.ui-render(?![\w-])/.test(selector)) return 'wrapped';
    if (/^\.ui-render-[\w-]/.test(selector)) return 'namespaced';
    return 'global';
}

/** `from`/`to`/`50%` inside `@keyframes` are keyframe steps, not page selectors — never scoped, never a leak. */
function isKeyframeStep (rule) {
    for (let node = rule.parent; node && node.type !== 'root'; node = node.parent) {
        if (node.type === 'atrule' && /keyframes$/i.test(node.name)) return true;
    }
    return false;
}

/** `@media …` / `@supports …` context a rule sits in, so two otherwise-identical rules stay distinguishable. */
function atRuleContext (rule) {
    const context = [];
    for (let node = rule.parent; node && node.type !== 'root'; node = node.parent) {
        if (node.type === 'atrule') context.unshift(`@${node.name} ${node.params.replace(/\s+/g, ' ').trim()}`);
    }
    return context.join(' > ');
}

function selectorsOf (rule) {
    return rule.selectors.map(selector => selector.replace(/\s+/g, ' ').trim());
}

/** Every rule that carries at least one host-reaching selector, with the properties it sets. */
function globalRuleInventory (css) {
    const inventory = [];
    postcss.parse(css).walkRules(rule => {
        if (isKeyframeStep(rule)) return;
        const global = selectorsOf(rule).filter(selector => scopeOf(selector) === 'global');
        if (global.length === 0) return;
        const props = [];
        rule.walkDecls(decl => { if (!props.includes(decl.prop)) props.push(decl.prop); });
        inventory.push({ at: atRuleContext(rule), global: global.sort(), props: props.sort() });
    });
    return inventory;
}

function occurrenceCounts (inventory) {
    const counts = {};
    inventory.forEach(rule => rule.global.forEach(selector => {
        counts[selector] = (counts[selector] || 0) + 1;
    }));
    return counts;
}

function allSelectorsByScope (css, scope) {
    const found = [];
    postcss.parse(css).walkRules(rule => {
        if (isKeyframeStep(rule)) return;
        selectorsOf(rule).forEach(selector => { if (scopeOf(selector) === scope) found.push(selector); });
    });
    return found;
}

/** Rule-by-rule selector lists, index-aligned — both pipelines see the same LESS, so indices correspond. */
function ruleSelectorList (css) {
    const list = [];
    postcss.parse(css).walkRules(rule => list.push(selectorsOf(rule).join(', ')));
    return list;
}

function runPostcss (plugins, css) {
    return postcss(plugins).process(css, { from: undefined }).then(result => result.css);
}

let compiledLess;
let webpackCss;
let standaloneCss;

beforeAll(async () => {
    // Same LESS invocation `scripts/build-css.js` uses. `src/style/__tests__/setup.js` (a global
    // `setupFiles` entry) has already placed `theme.config` where semantic-ui-less expects it.
    const result = await less.render(fs.readFileSync(ENTRY, 'utf8'), {
        filename: ENTRY,
        paths: [STYLE_DIR],
        plugins: [new LessPluginFunctions()],
        javascriptEnabled: true,
    });
    compiledLess = result.css;

    webpackCss = await runPostcss(webpackPostcssConfig.plugins, compiledLess);
    standaloneCss = await runPostcss(
        [prefixwrap(standaloneBuild.PREFIX, standaloneBuild.PREFIXWRAP_OPTIONS)],
        compiledLess,
    );
}, 60000);

describe('CSS pipeline parity — final CSS, post-PostCSS (§9.5)', () => {
    it('both stages ran over the same compiled LESS', () => {
        expect(compiledLess.length).toBeGreaterThan(100000);
        expect(webpackCss.length).toBeGreaterThan(compiledLess.length);
        expect(standaloneCss.length).toBeGreaterThan(compiledLess.length);
    });

    describe('(a) webpack pipeline — postcss.config.js, the config that builds the published CSS', () => {
        it('lets nothing escape .ui-render except the pinned R16/H8 exempt set', () => {
            const escaping = [...new Set(allSelectorsByScope(webpackCss, 'global'))].sort();
            // A new entry here means a NEW leak, not the known one — scope it or justify it in §9.9-H8.
            expect(escaping).toEqual(H8_EXEMPT_SELECTORS);
        });

        it('leaks exactly the pinned number of global rules and occurrences (R16 — H8 pending)', () => {
            const inventory = globalRuleInventory(webpackCss);
            expect(occurrenceCounts(inventory)).toEqual(H8_LEAK_OCCURRENCES);
            expect(inventory).toHaveLength(H8_LEAK_INVENTORY.length);
        });

        it('documents every declaration block the published CSS imposes on host pages (R16 — H8 pending)', () => {
            expect(globalRuleInventory(webpackCss)).toEqual(H8_LEAK_INVENTORY);
        });

        it('emits no scoped counterpart of the exempt rules, so the host page really is restyled', () => {
            // §2.6-7's evidence: the built CSS carries `html`/`body` rules and zero `.ui-render html`.
            // prefixwrap drops an exempt selector from wrapping entirely rather than emitting both forms.
            expect(webpackCss).not.toContain(`${WRAP} html`);
        });

        it('keeps the .ui-render-* class namespace unscoped on purpose (rc-picker portal)', () => {
            const namespaced = new Set(allSelectorsByScope(webpackCss, 'namespaced'));
            expect(namespaced.size).toBeGreaterThan(50);
            // Class-namespaced, therefore inert on host markup — unlike the html/body/* set above.
            const foreign = [...namespaced].filter(selector => !selector.startsWith('.ui-render-picker'));
            expect(foreign).toEqual([]);
        });
    });

    describe('(b) scripts/build-css.js pipeline — scoped identically? (§2.6-7 says no)', () => {
        it('scopes html/body/* — it does NOT carry the webpack exemptions', () => {
            // The standalone build already implements §9.9-H8 option (a). The published library CSS does not.
            expect([...new Set(allSelectorsByScope(standaloneCss, 'global'))].sort()).toEqual([]);
            expect(globalRuleInventory(standaloneCss)).toEqual([]);
        });

        it('agrees with the webpack pipeline about the .ui-render-* namespace', () => {
            expect([...new Set(allSelectorsByScope(standaloneCss, 'namespaced'))].sort())
                .toEqual([...new Set(allSelectorsByScope(webpackCss, 'namespaced'))].sort());
        });

        it('diverges from the webpack pipeline in exactly the pinned R16/H8 rules and nothing else', () => {
            const fromWebpack = ruleSelectorList(webpackCss);
            const fromStandalone = ruleSelectorList(standaloneCss);
            expect(fromStandalone).toHaveLength(fromWebpack.length);

            const divergent = fromWebpack
                .map((selector, index) => ({ index, webpack: selector, standalone: fromStandalone[index] }))
                .filter(row => row.webpack !== row.standalone);

            expect(divergent).toHaveLength(H8_DIVERGENT_RULES);
            // Every divergence must be an html/body/* one. Anything else would mean the two pipelines
            // disagree about ordinary widget CSS, which is a far worse problem than R16.
            divergent.forEach(row => {
                const changed = row.webpack.split(', ')
                    .filter((selector, i) => selector !== row.standalone.split(', ')[i]);
                changed.forEach(selector => expect(H8_EXEMPT_SELECTORS).toContain(selector));
            });
        });
    });

    describe('prefixwrap configuration — no longer divergent (the other half of §9.9-H8)', () => {
        it('wraps under the same .ui-render prefix in both pipelines', () => {
            expect(standaloneBuild.PREFIX).toBe(WRAP);
            expect(webpackCss).toContain(`${WRAP} .flex--col`);
            expect(standaloneCss).toContain(`${WRAP} .flex--col`);
        });

        it('treats every selector identically, html/body/* included', async () => {
            const probe = PROBE_SELECTORS.map(selector => `${selector}{color:red}`).join('\n');
            const fromWebpack = ruleSelectorList(await runPostcss(webpackPostcssConfig.plugins, probe));
            const fromStandalone = ruleSelectorList(
                await runPostcss([prefixwrap(standaloneBuild.PREFIX, standaloneBuild.PREFIXWRAP_OPTIONS)], probe),
            );

            expect(PROBE_SELECTORS.map((selector, index) => ({
                selector,
                webpack: fromWebpack[index],
                standalone: fromStandalone[index],
            }))).toEqual(PROBE_EXPECTATIONS);
        });
    });
});

/**
 * Fidelity cross-check: does the in-process reproduction above actually match what webpack emits?
 *
 * Only runnable against a built artifact, and CI runs Jest before `npm run build-lib`, so this is a
 * best-effort layer rather than the gate — the gate is the in-process pipeline above, which always runs.
 * Selector granularity only: the published file is minified, and cssnano may merge or split declaration
 * blocks without changing scoping.
 */
const hasPublishedCss = fs.existsSync(PUBLISHED_CSS);
const describeIfBuilt = hasPublishedCss ? describe : describe.skip;

describeIfBuilt('published static/all.css (needs `npm run build-lib` — skipped when absent)', () => {
    let publishedCss;

    beforeAll(() => {
        publishedCss = fs.readFileSync(PUBLISHED_CSS, 'utf8');
    });

    it('leaks the same global selectors as the in-process webpack pipeline', () => {
        expect(occurrenceCounts(globalRuleInventory(publishedCss))).toEqual(H8_LEAK_OCCURRENCES);
    });

    it('carries no scoped counterpart of the exempt rules (§2.6-7 evidence)', () => {
        expect(publishedCss).not.toContain(`${WRAP} html`);
    });

    it('lets nothing else escape .ui-render', () => {
        const escaping = [...new Set(allSelectorsByScope(publishedCss, 'global'))].sort();
        expect(escaping).toEqual(H8_EXEMPT_SELECTORS);
    });
});
