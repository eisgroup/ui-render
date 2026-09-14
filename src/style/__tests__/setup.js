/**
 * Jest `setupFiles` entry: put `theme.config` where `semantic-ui-less` looks for it, so the CSS
 * suites can compile the real LESS.
 *
 * The mechanics and the reasoning now live in `scripts/install-theme-config.js`, shared with
 * `scripts/build-css.js` and `scripts/generate-semantic-css-fixture.js`. There used to be two
 * implementations of this copy and a third was about to be written; the fixture generator is what
 * exposed the cost, by passing locally — where a prior jest run had already made the copy — and
 * failing on CI's clean checkout, where nothing had.
 *
 * What this file keeps is the note about WHERE it runs: once per jest WORKER, which is why the
 * shared helper skips the write when the destination is already correct and renames a
 * process-unique temp file into place when it is not.
 */
const { installThemeConfig } = require('../../../scripts/install-theme-config.js');

installThemeConfig();
