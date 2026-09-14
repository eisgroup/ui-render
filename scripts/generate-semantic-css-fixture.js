/**
 * Captures the CSS the remaining `semantic-ui-less` imports contribute, as the fixture
 * `src/style/__tests__/semantic-contributed-css.txt`.
 *
 * WHY THIS EXISTS. §9.7-F1 step 4's stated criterion is "pixel parity of extracted CSS vs current
 * compiled output", and until now there was no mechanism for it — `grep` over `e2e/` finds no
 * screenshot assertion anywhere. Step 4's second half stops importing Semantic's LESS and owns the
 * CSS instead, so "did the output change?" is the whole question, and it has to be answerable by a
 * test rather than by looking.
 *
 * A screenshot gate would have been the obvious reading of "pixel parity" and the wrong tool: it is
 * slow, it is flaky across platforms, and it cannot say WHICH declaration moved. Comparing the
 * compiled CSS is deterministic, and when it fails it names the rule.
 *
 * HOW THE SET IS DERIVED. Not by listing selectors by hand — by compiling the stylesheet twice,
 * once as it is and once with `_semantic.less`'s imports commented out, and taking the difference.
 * That is the same technique the first half of step 4 used to prove three modules were unused, and
 * it means the fixture cannot drift from what the imports actually contribute.
 *
 * WHAT IT PINS. Selector, declarations AND relative order — the cascade is part of the contract, so
 * a reordering that changes which rule wins has to fail here too.
 *
 * Run `npm run css:fixture` to regenerate. Regenerate ONLY when the change to the Semantic-derived
 * CSS is the intended product of the commit, and read the diff: every line is a declaration a
 * consumer's rendering depends on.
 */
const fs = require('fs');
const path = require('path');
const less = require('less');
const postcss = require('postcss');
const LessPluginFunctions = require('less-plugin-functions');
const { installThemeConfig } = require('./install-theme-config.js');

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const ENTRY = path.join(STYLE_DIR, 'index.less');
const SEMANTIC = path.join(STYLE_DIR, 'override/_semantic.less');
const FIXTURE = path.join(STYLE_DIR, '__tests__/semantic-contributed-css.txt');
const WRITE_COMMAND = 'npm run css:fixture';

/**
 * The live `@import` lines in `_semantic.less` — the ones not commented out.
 *
 * Matches the LINE shape rather than the specifier, which matters since §9.7-F1 step 4's second
 * half: it used to anchor on `@{libPath}`, the marker for an import reaching into
 * `node_modules/semantic-ui-less`, and those are gone. Each live line now imports a vendored file
 * AND the matching `override/**.overrides` beside it, so commenting the line still removes exactly
 * what `.loadUIOverrides()` used to bring along with the definitions — which is what keeps the
 * measured contribution comparable to the fixture captured before the swap.
 */
const LIVE_IMPORT = /^\s*&\s*\{\s*@import\s+"/;

async function compile (semanticSource) {
    // REQUIRED, and its absence is what made this script pass locally and fail on CI: Semantic's
    // definitions import `'../../theme.config'` from inside their own package, which ships only
    // `theme.config.example`. Locally a prior `npx jest` had already placed ours through the same
    // helper; on a clean checkout nothing had, and the compile died with
    // `'../../theme.config' wasn't found`.
    installThemeConfig();

    const original = fs.readFileSync(SEMANTIC, 'utf8');
    if (semanticSource !== null) fs.writeFileSync(SEMANTIC, semanticSource);
    try {
        const result = await less.render(fs.readFileSync(ENTRY, 'utf8'), {
            filename: ENTRY,
            paths: [STYLE_DIR, path.join(ROOT, 'node_modules')],
            javascriptEnabled: true,
            plugins: [new LessPluginFunctions()],
        });
        return result.css;
    } finally {
        if (semanticSource !== null) fs.writeFileSync(SEMANTIC, original);
    }
}

/** Ordered `selector\n  prop: value` blocks, at-rule context included. */
function ruleList (css) {
    const out = [];
    postcss.parse(css).walkRules(rule => {
        const declarations = rule.nodes
            .filter(node => node.type === 'decl')
            // `.trim()` on the value, in the ONE place both sides of the comparison come from.
            // PostCSS preserves trailing whitespace inside a declaration value and CSS does not
            // care about it; without this the fixture and a fresh compile differ on a rule whose
            // value happens to end in a space (`content: '\f0da' ` — measured, rule 236).
            .map(node => `  ${node.prop}: ${String(node.value).trim()}`);
        if (!declarations.length) return;
        const at = [];
        for (let parent = rule.parent; parent && parent.type === 'atrule'; parent = parent.parent) {
            at.unshift(`@${parent.name} ${parent.params}`);
        }
        out.push([...at, rule.selector.replace(/\s*\n\s*/g, ' '), ...declarations].join('\n'));
    });
    return out;
}

async function contributedRules () {
    const source = fs.readFileSync(SEMANTIC, 'utf8');
    const withoutImports = source.split('\n')
        .map(line => (LIVE_IMPORT.test(line) ? '// removed to measure the contribution' : line))
        .join('\n');

    const [full, without] = [await compile(null), await compile(withoutImports)];
    const baseline = new Set(ruleList(without));
    // Order preserved: this is the cascade, not a set.
    return ruleList(full).filter(rule => !baseline.has(rule));
}

async function main (argv) {
    const rules = await contributedRules();
    if (!rules.length) {
        throw new Error('the semantic imports contribute no rules at all — either the exit is complete'
            + ' and this fixture should be retired, or the import detection broke.');
    }
    const generated = `# GENERATED — run \`${WRITE_COMMAND}\` to regenerate. See ${path.relative(ROOT, __filename)}.\n`
        + `# ${rules.length} rules contributed by the semantic-ui-less imports in override/_semantic.less.\n`
        + `# Order is the cascade order and is part of the contract.\n\n`
        + rules.join('\n\n') + '\n';

    const current = fs.existsSync(FIXTURE) ? fs.readFileSync(FIXTURE, 'utf8') : null;
    if (argv.includes('--check')) {
        if (current === generated) {
            console.log(`${path.relative(ROOT, FIXTURE)} is up to date (${rules.length} rules)`);
            return 0;
        }
        console.error(`${path.relative(ROOT, FIXTURE)} is out of date — run \`${WRITE_COMMAND}\`.`);
        return 1;
    }
    fs.writeFileSync(FIXTURE, generated);
    console.log(`${path.relative(ROOT, FIXTURE)}: ${current === null ? 'created' : 'updated'} (${rules.length} rules)`);
    return 0;
}

module.exports = { contributedRules, ruleList, compile, FIXTURE, WRITE_COMMAND };

if (require.main === module) {
    main(process.argv.slice(2))
        .then(code => { process.exitCode = code; })
        .catch(error => { console.error(error.message); process.exitCode = 1; });
}
