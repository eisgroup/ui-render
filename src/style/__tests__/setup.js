/**
 * Jest `setupFiles` entry — now a deliberate no-op, kept rather than deleted.
 *
 * It used to copy `src/style/override/theme.config` into `node_modules/semantic-ui-less/`, because
 * Semantic's definition files import `'../../theme.config'` from inside their own package and the
 * package ships only `theme.config.example`. That made an ordinary `npx jest` MUTATE `node_modules`
 * — a gotcha this repository documented in CLAUDE.md and worked around in three places.
 *
 * §9.7-F1 step 4 removed the need: the CSS those definitions produced is vendored under
 * `src/style/vendor/`, nothing imports `semantic-ui-less` any more, and the package is gone from
 * `devDependencies`. No test writes to `node_modules`.
 *
 * The file stays because `jest.config.js` names it in `setupFiles`, and an empty hook is a cheaper,
 * more obvious place for the next global test-time setup than a config edit plus a new file. If
 * none arrives, delete both together.
 */
