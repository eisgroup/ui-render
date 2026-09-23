const fs = require('fs');
const path = require('path');

const postcss = require('postcss');
const prefixwrap = require('postcss-prefixwrap');
const { lessOptions, less } = require('./less-options.js');

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const OUT_DIR = path.join(ROOT, 'public/static');



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

async function buildFile(entryFile, outFile, { prefix = false } = {}) {
    let css = await compileLess(entryFile);
    if (prefix) {
        css = await applyPrefixWrap(css);
    }
    fs.writeFileSync(outFile, css);
    const sizeKB = (css.length / 1024).toFixed(1);
    console.log(`  ${path.basename(outFile)} (${sizeKB} KB)`);
}

async function main() {
    console.log('Building CSS...');

    // Compile all styles (including Semantic UI) with .ui-render prefix
    await buildFile(
        path.join(STYLE_DIR, 'index.less'),
        path.join(OUT_DIR, 'ui-render.built.css'),
        { prefix: true },
    );

    console.log('Done.');
}

module.exports = { PREFIX, PREFIXWRAP_OPTIONS };

// Only build when invoked as a script; `require()`ing this module (the parity gate does) must be inert.
if (require.main === module) {
    main().catch(err => {
        console.error('Build failed:', err.message);
        if (err.filename) console.error(`  at ${err.filename}:${err.line}:${err.column}`);
        process.exit(1);
    });
}
