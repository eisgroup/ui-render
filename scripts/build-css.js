const fs = require('fs');
const path = require('path');
const less = require('less');
const postcss = require('postcss');
const prefixwrap = require('postcss-prefixwrap');
const LessPluginFunctions = require('less-plugin-functions');

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const OUT_DIR = path.join(ROOT, 'public/static');

function setupSemanticThemeConfig() {
    const src = path.join(STYLE_DIR, 'override/theme.config');
    const dest = path.join(ROOT, 'node_modules/semantic-ui-less/theme.config');
    fs.copyFileSync(src, dest);
}

async function compileLess(entryFile) {
    const source = fs.readFileSync(entryFile, 'utf8');
    const result = await less.render(source, {
        filename: entryFile,
        paths: [path.dirname(entryFile)],
        plugins: [new LessPluginFunctions()],
        javascriptEnabled: true,
    });
    return result.css;
}

async function applyPrefixWrap(css) {
    const result = await postcss([
        prefixwrap('.ui-render', { ignoredSelectors: [/^\.ui-render-(.+)$/] }),
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
    setupSemanticThemeConfig();

    // Compile all styles (including Semantic UI) with .ui-render prefix
    await buildFile(
        path.join(STYLE_DIR, 'index.less'),
        path.join(OUT_DIR, 'ui-render.built.css'),
        { prefix: true },
    );

    console.log('Done.');
}

main().catch(err => {
    console.error('Build failed:', err.message);
    if (err.filename) console.error(`  at ${err.filename}:${err.line}:${err.column}`);
    process.exit(1);
});
