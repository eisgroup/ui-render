/**
 * Lets `less-plugin-functions` 1.0.0 run on LESS 4.
 *
 * THE PROBLEM, and it is one line of theirs. That plugin is how `size()` and `px()` work: they are
 * mixins in `src/style/_mixins.less` (`.function { .size() … }`) called as functions, at 186 sites
 * across 30 files. To call a mixin it does this, under a comment of its own that reads "the most
 * ugly hack ever":
 *
 *     DetachedSet.prototype.type = 'NotDetachedRuleset';
 *     …eval…
 *     DetachedSet.prototype.type = 'DetachedRuleset';
 *
 * In LESS 4 that property is defined with only a getter, so the assignment throws
 * `Cannot set property type of #<DetachedRuleset> which has only a getter` and every compile fails.
 *
 * THE FIX IS TO MAKE THE ASSIGNMENT A NO-OP, not to make it work. The hack exists so a mixin can
 * return a detached ruleset; ours return a plain `unit(...)` value, so nothing is lost by ignoring
 * it. Reads still answer `DetachedRuleset`, which is what the rest of LESS expects.
 *
 * WHY NOT the alternatives, each measured or costed:
 *   - rewriting the 186 call sites to inline arithmetic: every one changes a computed value, and
 *     the result is unreadable where the point of `size()` is readability;
 *   - forking or patching the plugin: a fork to maintain, or a `patch-package` step in the build;
 *   - staying on LESS 3: the pin was the thing being removed.
 *
 * WHAT WOULD MAKE THIS UNNECESSARY: `less-plugin-functions` publishing a LESS 4 release, or LESS
 * gaining a first-class way to call a mixin as a function. Either one, delete this file and the
 * `plugins()` entry in `less-options.js`.
 *
 * Installed BEFORE `less-plugin-functions` so the property is already neutralised when it runs.
 */
const less4Compatibility = {
    install (less) {
        const DetachedRuleset = less.tree && less.tree.DetachedRuleset;
        if (!DetachedRuleset) return;

        const descriptor = Object.getOwnPropertyDescriptor(DetachedRuleset.prototype, 'type');
        // LESS 3 has a plain writable property; only LESS 4's getter-only form needs the shim, and
        // leaving 3 untouched keeps this a no-op on the version we are migrating FROM.
        if (!descriptor || descriptor.writable !== false || descriptor.get) {
            if (!descriptor || !descriptor.get) return;
        }
        Object.defineProperty(DetachedRuleset.prototype, 'type', {
            configurable: true,
            get: () => 'DetachedRuleset',
            set: () => { /* the plugin's hack, deliberately ignored — see above */ },
        });
    },
};

module.exports = { less4Compatibility };
