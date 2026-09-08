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

    it('includes Semantic UI components', () => {
        // Semantic UI dropdown and popup should be present
        expect(compiledCss).toContain('.ui.dropdown');
        expect(compiledCss).toContain('.ui.popup');
    });
});
