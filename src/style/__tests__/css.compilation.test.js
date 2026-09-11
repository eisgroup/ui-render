const fs = require('fs');
const path = require('path');
const less = require('less');
const LessPluginFunctions = require('less-plugin-functions');

const STYLE_DIR = path.resolve(__dirname, '..');
const INVENTORY_FILE = path.join(STYLE_DIR, 'class-inventory.txt');

function extractClasses(css) {
    const classes = new Set();
    css.replace(/\.([a-zA-Z_][\w-]*)/g, (_, cls) => classes.add(cls));
    return classes;
}

let compiledCss;

beforeAll(async () => {
    const source = fs.readFileSync(path.join(STYLE_DIR, 'index.less'), 'utf8');
    const result = await less.render(source, {
        filename: path.join(STYLE_DIR, 'index.less'),
        paths: [STYLE_DIR],
        plugins: [new LessPluginFunctions()],
        javascriptEnabled: true,
    });
    compiledCss = result.css;
    // 60s, matching the three sibling CSS suites, and raised from 30s because this one timed out
    // on CI's React 19 job the moment a FOURTH LESS-compiling suite was added
    // (`css.dropdown-contract.test.js`): four workers compiling the whole `semantic-ui-less` tree
    // contend for CPU, and this suite had the tightest budget of the four. A `beforeAll` timeout
    // reports every test in the file as failed with an EMPTY message, which is why the failure
    // named no assertion — worth recognising, because it reads like a broken suite and is not.
}, 60000);

describe('CSS contract', () => {
    it('compiles without errors', () => {
        expect(compiledCss).toBeDefined();
        expect(compiledCss.length).toBeGreaterThan(0);
    });

    /**
     * `pagination` LEFT THE INVENTORY AT §9.7-F1 STEP 4 (2026-09-11), and the note lives here
     * because `class-inventory.txt` is a bare newline-delimited list with no comment syntax.
     *
     * It was the ONLY class lost when `collections/menu`, `elements/label` and `modules/popup` were
     * dropped — one of 1,000-odd entries, which is itself the measurement that those three modules
     * were unused. It came from Semantic's `.ui.pagination.menu`, and the import carried the comment
     * "For Pagination Component" to justify keeping the whole module for it. That was false:
     * `Pagination.js` emits `app__pagination*`, styled by `src/style/components/pagination.less`.
     * Verified before removing: no component emits a bare `pagination` class and the 38-example DOM
     * baseline contains zero occurrences.
     *
     * `label` and `menu` survive the deletion, which is worth knowing before anyone "tidies" them
     * out of the list: `modules/dropdown` still styles a `.label` and a `.menu` inside a dropdown.
     */
    it('contains all baseline classes from class-inventory.txt', () => {
        const baseline = fs.readFileSync(INVENTORY_FILE, 'utf8')
            .trim().split('\n').filter(Boolean);
        const builtClasses = extractClasses(compiledCss);

        const missing = baseline.filter(cls => !builtClasses.has(cls));
        if (missing.length > 0) {
            throw new Error(`Missing ${missing.length} classes: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '...' : ''}`);
        }
    });

    it('includes .ui-render-scoped selectors are not broken', () => {
        // Core layout classes must exist
        const required = ['flex--col', 'flex--row', 'padding', 'margin', 'button', 'border'];
        const builtClasses = extractClasses(compiledCss);
        const missing = required.filter(cls => !builtClasses.has(cls));
        expect(missing).toEqual([]);
    });

    it('includes icon font declarations', () => {
        expect(compiledCss).toContain('@font-face');
        expect(compiledCss).toContain('iconsOpenL');
    });

    it('includes the one Semantic module still loaded, and none of the dropped ones', () => {
        // `.ui.popup` was asserted here until §9.7-F1 step 4 dropped `modules/popup` — the tooltip
        // has been in-house since step 2 part 3, so the module was styling markup nothing renders.
        // The assertion is INVERTED rather than deleted: these three must stay out, or 25% of the
        // stylesheet comes back silently the next time someone uncomments a line in `_semantic.less`.
        //
        // Asserted against the SELECTORS, not the raw text, and that detail is load-bearing: LESS
        // keeps `/* … */` comments in its output, so `_semantic.less`'s own note explaining which
        // selectors were dropped contains those very strings. A raw `toContain` on the compiled text
        // reports them as still present — measured, after this test failed on exactly that.
        const withoutComments = compiledCss.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(withoutComments).toContain('.ui.dropdown');
        expect(withoutComments).not.toContain('.ui.popup');
        expect(withoutComments).not.toContain('.ui.ribbon.label');
        // `.ui.secondary.menu`, NOT `.ui.menu`. The bare form is the wrong probe and this test
        // failed on it: `modules/dropdown` — which stays — carries three rules of its own that
        // mention `.ui.menu`, styling a dropdown nested inside a Semantic menu. They are
        // unreachable here (nothing renders `.ui.menu`) but they exist, so only a selector unique
        // to `collections/menu` can tell the two modules apart.
        expect(withoutComments).not.toContain('.ui.secondary.menu');
        expect(withoutComments).not.toContain('.ui.pagination.menu');
    });
});
