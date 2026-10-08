const fs = require('fs');
const path = require('path');

const postcss = require('postcss');
const prefixwrap = require('postcss-prefixwrap');
const { lessOptions, less } = require('./less-options.js');

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const OUT_DIR = path.join(ROOT, 'public/static');
/**
 * Committed, because the demo site carries it: `webpack.demo.config.mjs` copies `public/static`. So a
 * change to the styles has to rebuild it, and twice one did not: the date picker's `z-index` reached it
 * a day late, and the deprecated CSS replaced on 2026-10-08 only when this check first ran. `--check`
 * compares instead of writing, and CI runs it (`npm run build-css:check`); `css.pipeline.parity.test.js`
 * makes the same comparison in every jest leg.
 */
const OUT_FILE = path.join(OUT_DIR, 'ui-render.built.css');
const WRITE_COMMAND = 'npm run build-css';



async function compileLess(entryFile) {
    const source = fs.readFileSync(entryFile, 'utf8');
    const result = await less.render(source, lessOptions({
        filename: entryFile,
        paths: [path.dirname(entryFile)],
    }));
    return result.css;
}

/**
 * prefixwrap options for this standalone build — now READ FROM the shared source, not copied.
 *
 * The comment that stood here said these "deliberately differ from the webpack `postcss.config.js`
 * today: that one also exempts `html`, `body` and `*`", and called unifying them part of the OPEN
 * §9.9-H8 decision. That decision closed on 2026-09-11 and the exemptions went with it, so the two
 * had been identical for weeks while this file still described them as divergent. §9.9-H7 removed
 * the second copy rather than correcting its description a second time.
 *
 * Still re-exported, because the parity gate imports `PREFIX`/`PREFIXWRAP_OPTIONS` from this module.
 */
const { PREFIX, PREFIXWRAP_OPTIONS } = require('./prefixwrap-options.js');

async function applyPrefixWrap(css) {
    const result = await postcss([
        prefixwrap(PREFIX, PREFIXWRAP_OPTIONS),
    ]).process(css, { from: undefined });
    return result.css;
}

// Compile all styles (including the vendored Semantic modules) with .ui-render prefix
async function buildCss() {
    return applyPrefixWrap(await compileLess(path.join(STYLE_DIR, 'index.less')));
}

async function main(argv) {
    const check = argv.includes('--check');
    if (!check) console.log('Building CSS...');
    const css = await buildCss();
    if (check) {
        const relative = path.relative(ROOT, OUT_FILE);
        const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : null;
        if (current === css) {
            console.log(`${relative} is up to date`);
            return 0;
        }
        console.error(`${relative} is out of date — run \`${WRITE_COMMAND}\`.`);
        return 1;
    }
    fs.writeFileSync(OUT_FILE, css);
    console.log(`  ${path.basename(OUT_FILE)} (${(css.length / 1024).toFixed(1)} KB)`);
    console.log('Done.');
    return 0;
}

module.exports = { PREFIX, PREFIXWRAP_OPTIONS, OUT_FILE, WRITE_COMMAND };

// Only build when invoked as a script; `require()`ing this module (the parity gate does) must be inert.
if (require.main === module) {
    main(process.argv.slice(2))
        .then(code => { process.exitCode = code; })
        .catch(err => {
            console.error('Build failed:', err.message);
            if (err.filename) console.error(`  at ${err.filename}:${err.line}:${err.column}`);
            process.exitCode = 1;
        });
}
