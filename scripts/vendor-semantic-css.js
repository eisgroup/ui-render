/**
 * ONE-SHOT GENERATOR for §9.7-F1 step 4's second half: writes the CSS this repository takes over
 * from `semantic-ui-less` into `src/style/vendor/`.
 *
 * WHY THE ISOLATED COMPILE, AND NOT A SUBTRACTION FROM THE FULL BUILD. Subtraction is the obvious
 * method and it is wrong here, for a reason worth stating because it is not obvious until it bites.
 * Our own LESS extends Semantic's selectors (`input.less` does `&:extend(.input-tag all)` and
 * similar), so in the FULL build Semantic's rules already carry the widened selector lists. Vendor
 * those widened forms and the `:extend` declarations — which stay in our LESS — apply a SECOND
 * time, appending the same selectors again. Vendoring the isolated, pre-extend compile lets the
 * extends re-apply exactly once, as they do today. That is also why the dropdown's isolated compile
 * is not a byte-substring of the full build while the reset's is: the reset has nothing extending it.
 *
 * OUR OVERRIDES ARE EXCLUDED BY A FILE MANAGER, after two simpler attempts failed — both caught by
 * the parity gate, which is the whole reason it was built first.
 * ATTEMPT 1, stripping `.loadUIOverrides();`: WRONG. The mixin looks like it only pulls in our
 * files. `theme.less` defines it as TWO optional imports —
 * `@{themesFolder}/@{theme}/@{type}s/@{element}.overrides` and then
 * `@{siteFolder}/@{type}s/@{element}.overrides` — and for `globals/reset` the FIRST of those is
 * where Semantic keeps normalize.css. Stripping it produced a 7-rule reset with the normalize body
 * gone, and the gate diverged at rule 4.
 *
 * ATTEMPT 2, redefining `@siteFolder` in the definition file after `theme.config` is read: ALSO
 * WRONG, and silently so — the file still compiled to exactly the byte count of a compile that
 * includes our overrides. A LESS mixin resolves variables in the scope where it is DEFINED, and
 * `.loadUIOverrides()` is defined in `theme.less`; a redefinition in the calling file never reaches
 * it. The gate caught this one as a duplication: every override rule appeared twice, once baked in
 * and once from the explicit import beside it.
 *
 * WHAT WORKS: a LESS file manager that declines to load anything under our own `override/`
 * directory for the duration of this compile. It is in-memory, mutates nothing on disk, and is
 * precise about which imports it suppresses. Both `(optional)` imports simply miss, so the theme
 * half still loads and ours does not.
 *
 * Our own `src/style/override/**.overrides` then stay LESS: they are written against OUR variables
 * (`@color-primary`, `@select-interaction`) and our mixins, not Semantic's cascade, so they survive
 * the exit untouched and keep full theming. `_semantic.less` imports them directly after the
 * vendored file, which is the position `loadUIOverrides` gave them.
 *
 * WHAT IS LOST, measured rather than waved at: baking resolves Semantic's own variables to
 * literals, so of the 727 declarations these modules contribute, `@size-base-px` stops moving 63,
 * `@size-scale` 41 and `@radius-base` 19 — about 17%. `override/modules/dropdown.variables`
 * (`@selectedBackground`, `@hoveredItemBackground`) is baked in with them and can be deleted.
 *
 * Correctness is not argued from this comment: `css.semantic-parity.test.js` compares the compiled
 * output against the fixture taken before the swap, rule for rule and declaration for declaration.
 */
const fs = require('fs');
const path = require('path');
const less = require('less');
const LessPluginFunctions = require('less-plugin-functions');
const { installThemeConfig } = require('./install-theme-config.js');

const OUR_OVERRIDE_DIR = path.join(__dirname, '../src/style/override');

/**
 * A LESS plugin whose file manager returns empty content for any import resolving inside our own
 * `src/style/override/` tree. See the note above for why the two simpler approaches do not work.
 */
const excludeOurOverrides = {
    install (lessInstance, pluginManager) {
        const FileManager = lessInstance.FileManager;
        class SkipOurOverrides extends FileManager {
            ours (filename, currentDirectory) {
                const resolved = path.resolve(currentDirectory || '', filename);
                return resolved.startsWith(OUR_OVERRIDE_DIR) && resolved.endsWith('.overrides');
            }
            // BOTH `supports` and `supportsSync` must answer, and the sync one is not optional
            // here: without it LESS falls back to its default manager for the synchronous import
            // path, and the whole compile takes a different route — measured, it folded
            // `calc(100% + 2px)` into the wrong `calc(102%)`, which the gate caught at rule 87.
            supports (filename, currentDirectory) { return this.ours(filename, currentDirectory); }
            supportsSync (filename, currentDirectory) { return this.ours(filename, currentDirectory); }

            loadFile (filename, currentDirectory) {
                return Promise.resolve(this.loadFileSync(filename, currentDirectory));
            }
            loadFileSync (filename, currentDirectory) {
                return {
                    contents: '/* our own overrides, excluded while vendoring — they stay LESS */',
                    filename: path.resolve(currentDirectory || '', filename),
                };
            }
        }
        pluginManager.addFileManager(new SkipOurOverrides());
    },
};

const ROOT = path.resolve(__dirname, '..');
const STYLE_DIR = path.join(ROOT, 'src/style');
const VENDOR_DIR = path.join(STYLE_DIR, 'vendor');
const DEFINITIONS = path.join(ROOT, 'node_modules/semantic-ui-less/definitions');

const MODULES = [
    { id: 'reset', from: 'globals/reset', to: 'semantic-reset.less' },
    { id: 'dropdown', from: 'modules/dropdown', to: 'semantic-dropdown.less' },
];

const HEADER = (from) => `/*
 * VENDORED from semantic-ui-less 2.5.0 — \`definitions/${from}\`, compiled output.
 *
 * GENERATED by scripts/vendor-semantic-css.js at §9.7-F1 step 4. Do not hand-edit: our own layer
 * lives in src/style/override/ and in the components' own LESS, and an edit here would be lost the
 * next time this is regenerated. MODIFIED from upstream only by compilation — our theme variables
 * were resolved into it, and Semantic's \`.loadUIOverrides()\` hook was removed so that our
 * overrides stay LESS instead of being baked.
 *
 * Licence: MIT. See THIRD-PARTY-NOTICES.md at the repository root for the full text and for what
 * upstream does and does not state about its copyright holder.
 */
`;

async function compileModule (spec) {
    installThemeConfig();
    const source = fs.readFileSync(path.join(DEFINITIONS, `${spec.from}.less`), 'utf8');
    // Compiled with the definition file's own path as `filename`, so its relative `@import`s
    // (`'../../theme.config'`, its theme files) resolve exactly as they do today.
    const result = await less.render(source, {
        filename: path.join(DEFINITIONS, `${spec.from}.less`),
        paths: [STYLE_DIR, path.join(ROOT, 'node_modules')],
        javascriptEnabled: true,
        plugins: [new LessPluginFunctions(), excludeOurOverrides],
    });
    return result.css;
}

/**
 * LESS RE-EVALUATES WHAT IT PARSES, which is the sting in vendoring compiled CSS as a `.less` file.
 * The generated file has to stay `.less` — `:extend` in our own stylesheets must still reach these
 * rules, and `@import (inline)` would put them beyond its reach — but that means every value goes
 * through the expression evaluator a second time.
 *
 * Measured, and caught by the parity gate at rule 87: `calc(100% +  2px )` was written correctly
 * into the vendored file and came out of the next compile as `calc(102%)`. Semantic builds that
 * value from escaped strings (`themes/default/modules/dropdown.variables:41`) precisely so LESS
 * leaves it alone; once it is a plain literal in a `.less` file, nothing protects it, and
 * `100% + 2px` is not `102%` — percentages and pixels do not add.
 *
 * So every `calc(...)` is re-escaped on the way out. The gate is what proves the list is complete:
 * any other construct LESS would fold differently fails there with the rule named.
 */
function escapeForReparse (css) {
    return css.replace(/([:,\s])(calc\([^;{}]*?\))/g, (whole, lead, expression) => (
        `${lead}~"${expression}"`
    ));
}

async function main () {
    fs.mkdirSync(VENDOR_DIR, { recursive: true });
    for (const spec of MODULES) {
        const css = await compileModule(spec);
        const target = path.join(VENDOR_DIR, spec.to);
        fs.writeFileSync(target, HEADER(spec.from) + escapeForReparse(css.replace(/^\n+/, '')));
        console.log(`${path.relative(ROOT, target)}: ${css.length} bytes`);
    }
    return 0;
}

module.exports = { compileModule, MODULES, VENDOR_DIR };

if (require.main === module) {
    main().then(code => { process.exitCode = code; })
        .catch(error => { console.error(error.message); process.exitCode = 1; });
}
