/**
 * Captures the CSS the two vendored Semantic modules contribute (`src/style/vendor/`, imported by
 * `override/_semantic.less`), as the fixture `src/style/__tests__/semantic-contributed-css.txt`.
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
 * The commenting out happens in memory, for that one compile (`substituting` below says why).
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

const postcss = require('postcss');
const { lessOptions, plugins, less } = require('./less-options.js');

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const ENTRY = path.join(STYLE_DIR, 'index.less');
const SEMANTIC = path.join(STYLE_DIR, 'override/_semantic.less');
const FIXTURE = path.join(STYLE_DIR, '__tests__/semantic-contributed-css.txt');
const WRITE_COMMAND = 'npm run css:fixture';

/**
 * The live `@import` lines in `_semantic.less` — the ones not commented out.
 *
 * The optional `(...)` group is not decoration: an import written `@import (multiple) "..."` has to
 * match too, and when it did not, the baseline compile kept our overrides while the full one also
 * had them — so 47 rules subtracted themselves away and the gate reported them missing from the
 * OUTPUT when they were only missing from the MEASUREMENT.
 *
 * Matches the LINE shape rather than the specifier, which matters since §9.7-F1 step 4's second
 * half: it used to anchor on `@{libPath}`, the marker for an import reaching into
 * `node_modules/semantic-ui-less`, and those are gone. Each live line now imports a vendored file
 * AND the matching `override/**.overrides` beside it, so commenting the line still removes exactly
 * what `.loadUIOverrides()` used to bring along with the definitions — which is what keeps the
 * measured contribution comparable to the fixture captured before the swap.
 */
const LIVE_IMPORT = /^\s*&\s*\{\s*@import\s+(?:\([^)]*\)\s*)?"/;

/**
 * A LESS plugin that gives ONE compile `source` as the text of `filename`, which stays untouched.
 *
 * WHY IN MEMORY. The edited `_semantic.less` used to be written over the real file for the length
 * of the compile, and the original put back in a `finally`. The content always came back, but the
 * window was visible to every other process. Jest runs the CSS suites in parallel workers, and a
 * sibling that compiled `index.less` inside the window read the edited file and lost everything the
 * imports bring: `css.compilation.test.js` failed with "Missing 1 classes: item" in 4 of 40 full
 * runs, and passed on every rerun and on its own. The same write made a `webpack --watch`
 * rebuild (`css.pipeline.parity.test.js` tells that half), and a run killed inside the window would
 * have left the source edited. A preprocessor sees each file's text as LESS parses it, so the edit
 * reaches this compile and nothing else.
 */
function substituting (filename, source) {
    const substitution = { applied: false };
    substitution.plugin = {
        install (_less, pluginManager) {
            pluginManager.addPreProcessor({
                process (contents, { fileInfo }) {
                    if (path.resolve(fileInfo.filename) !== filename) return contents;
                    substitution.applied = true;
                    return source;
                },
            }, 1);
        },
    };
    return substitution;
}

async function compile (semanticSource) {
    const substitution = semanticSource === null ? null : substituting(SEMANTIC, semanticSource);
    const result = await less.render(fs.readFileSync(ENTRY, 'utf8'), {
        filename: ENTRY,
        paths: [STYLE_DIR, path.join(ROOT, 'node_modules')],
        ...lessOptions(substitution ? { plugins: [...plugins(), substitution.plugin] } : {}),
    });
    // Without this, a path that stopped matching would measure the full stylesheet against itself.
    if (substitution && !substitution.applied) {
        throw new Error(`${path.relative(ROOT, SEMANTIC)} was not part of the compile, so editing it measured nothing.`);
    }
    return result.css;
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
        + `# ${rules.length} rules contributed by the vendored Semantic imports in override/_semantic.less.\n`
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
