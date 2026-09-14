/**
 * Puts `src/style/override/theme.config` where `semantic-ui-less` looks for it.
 *
 * WHY THIS MUTATES `node_modules`, which is otherwise a thing to avoid. Semantic's definition files
 * each open with `@import (multiple) '../../theme.config'`, resolved relative to their own location
 * inside the package — and the package ships only `theme.config.example`. The webpack builds alias
 * the specifier to our file, but anything compiling the LESS directly (jest, `build-css`, the CSS
 * fixture generator) has no alias, so the file has to exist at that path or the compile dies with
 * `'../../theme.config' wasn't found`.
 *
 * WHY IT IS SHARED. There were two copies of this — `scripts/build-css.js` and
 * `src/style/__tests__/setup.js` — with different implementations, and a third was about to be
 * written for `generate-semantic-css-fixture.js`. The fixture generator is what exposed the cost:
 * it passed locally because a prior `npx jest` run had already made the copy, and failed on CI's
 * clean checkout where nothing had. One implementation, called by all three, is both less code and
 * the only version that cannot rot in one place while working in another.
 *
 * THE MECHANICS, kept from the hardened `setup.js` version:
 *   1. Do nothing when the destination is already correct. That is the common case after the first
 *      call, so most runs perform no write at all and cannot race.
 *   2. When a write IS needed, write a process-unique temp file next to the destination and
 *      `rename` it into place. Rename within one filesystem is atomic, so a concurrent reader — a
 *      sibling jest worker compiling LESS — sees either the complete old file or the complete new
 *      one, never a half-written one.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'src/style/override/theme.config');
const DESTINATION = path.join(ROOT, 'node_modules/semantic-ui-less/theme.config');

/** Returns 'written' | 'already-current' | 'no-source'. Never throws for a missing source. */
function installThemeConfig () {
    if (!fs.existsSync(SOURCE)) return 'no-source';

    const wanted = fs.readFileSync(SOURCE);
    let current = null;
    try {
        current = fs.readFileSync(DESTINATION);
    } catch (error) {
        // Absent is expected once per clean checkout.
    }
    if (current !== null && current.equals(wanted)) return 'already-current';

    const temporary = `${DESTINATION}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, wanted);
    fs.renameSync(temporary, DESTINATION);
    return 'written';
}

module.exports = { installThemeConfig, SOURCE, DESTINATION };
