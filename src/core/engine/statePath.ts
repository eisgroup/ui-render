/**
 * WHICH ARGUMENT OF A `setState` ACTION IS ITS STATE PATH.
 * =============================================================================================
 *
 * The last STRING argument, not the second positional one. Lifted out of the engine's `setStates`
 * at §9.3 step 6, so the rule is tested on its own, as a calculation, rather than through an
 * instance's prototype.
 *
 * WHY, because "second positional" looks obviously right and is wrong: a meta's configured action
 * arguments are APPENDED to the caller's by `getFunctionFromString` (`'setState,categoryX'` becomes
 * `(...caller) => setStates(...caller, 'categoryX')`), so the path's position depends on how many
 * arguments the caller passes. A `Button` passes one and the path lands second; a `Dropdown` passes
 * three — `(value, name, event)` — and the path lands FOURTH while the field's own `name` sits
 * second. Reading the second argument therefore wrote to the path named by the field instead of the
 * one the meta asked for, for every `view: 'Select'` whose two differ. `mapper.tsx` works around it
 * for stable-value Selects by stripping the extra arguments, with a comment saying exactly this;
 * nothing covered the rest.
 *
 * Measured across all four real call shapes, this rule is the only one that is right in all of
 * them — "last argument" is wrong when no path is configured and the caller's last argument is the
 * DOM event, and "second argument" is wrong for any caller passing more than one:
 *   (value, 'categoryX')                      -> 'categoryX'      configured, one-arg caller
 *   (value, name, event, 'categoryX')          -> 'categoryX'      configured, dropdown
 *   (value, name, event)                       -> name            not configured, dropdown
 *   (value)                                    -> undefined       not configured, one-arg
 * The last row keeps the behaviour it always had deliberately: `set(state, undefined, value)`
 * returns the state unchanged, so the action is a no-op rather than an error, and making it one is
 * a separate decision from fixing the path.
 *
 * Found by the §9.7-F1 step 3 part 1 audit. `transforms.action-args.test.js` pins the composer's
 * half of this and `rules.set-state-path.test.js` this half.
 *
 * @param args - what the action was called with after the value: the caller's arguments, then the
 *    meta's configured ones
 * @returns the state path, or undefined when no argument is a string
 */
export function statePathOf (args: readonly unknown[]): string | undefined {
    for (let i = args.length - 1; i >= 0; i -= 1) {
        const arg = args[i]
        if (typeof arg === 'string') return arg
    }
    return undefined
}
