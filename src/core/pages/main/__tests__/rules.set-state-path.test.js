/**
 * WHICH ARGUMENT `setState` TREATS AS ITS STATE PATH.
 * =============================================================================================
 *
 * FOUND BY THE §9.7-F1 STEP 3 PART 1 AUDIT, and worth its own file because the mechanism is not
 * where anyone would look for it. A meta's configured action arguments are APPENDED to the
 * caller's by `getFunctionFromString` — `'setState,categoryX'` becomes
 * `(...caller) => setStates(...caller, 'categoryX')` — so the path's POSITION depends on how many
 * arguments the caller passes. A `Button` passes one and the path lands second; a `Dropdown`
 * passes `(value, name, event)` and the path lands fourth, while the field's own `name` sits
 * second. `setStates(value, keyPath)` therefore wrote to the path named by the FIELD instead of
 * the one the meta asked for, for every `view: 'Select'` whose two differ. `mapper.js` worked
 * around it for stable-value Selects by stripping the extra arguments; nothing covered the rest.
 *
 * The four rows below are every real call shape, and they are why the rule is "the last STRING
 * argument": it is the only rule correct in all four. "Last argument" breaks the third row, where
 * no path is configured and the caller's last argument is a DOM event. "Second argument" breaks
 * the second row, which is the defect.
 *
 * The composer's half of this — that configured arguments are appended at all — is pinned in
 * `src/core/ui-render/__tests__/transforms.action-args.test.js`.
 */
import { UIRender } from '../rules'

/**
 * `setStates` lives on the prototype and only needs `state` and `setState` from its instance, so
 * it is called against a minimal one. Driving it through a rendered engine would exercise the
 * SAME two lines behind a form, a meta and a click, and would not say which argument was read.
 */
const callSetState = (...args) => {
    const recorded = []
    const instance = {
        state: { existing: 'kept' },
        setState (next) { recorded.push(next) },
        _meta: { cached: true },
    }
    UIRender.prototype.setStates.apply(instance, args)
    return { state: recorded[recorded.length - 1], metaCleared: instance._meta === null }
}

describe('the state path is the last string argument', () => {
    it('a configured path with a one-argument caller — the `mapper.js` workaround shape', () => {
        const { state } = callSetState('gold', 'categoryX')

        expect(state).toEqual({ existing: 'kept', categoryX: 'gold' })
    })

    it('a configured path with a dropdown caller — the shape that was broken', () => {
        // `onChange(value, name, event)` first, then the meta's `'categoryX'`.
        const { state } = callSetState('gold', 'group.category', { type: 'click' }, 'categoryX')

        // The meta's path, not the field's name. Reading the second argument wrote
        // `{group: {category: 'gold'}}` here.
        expect(state).toEqual({ existing: 'kept', categoryX: 'gold' })
        expect(state.group).toBeUndefined()
    })

    it('NO configured path with a dropdown caller — the field name is the path, as before', () => {
        const { state } = callSetState('gold', 'group.category', { type: 'click' })

        // This shape worked before and must keep working: with nothing configured, the field's
        // own name IS the path. It is also why "read the last argument" is not the fix — the last
        // argument here is the DOM event.
        expect(state).toEqual({ existing: 'kept', group: { category: 'gold' } })
    })

    it('NO configured path and a one-argument caller — a no-op, as before', () => {
        const { state, metaCleared } = callSetState('gold')

        // `set(state, undefined, value)` returns the state unchanged. Preserved deliberately:
        // making an unresolvable path an ERROR is a separate decision from fixing the path, and
        // this file is about the path.
        expect(state).toEqual({ existing: 'kept' })
        expect(metaCleared).toBe(true)
    })

    it('clears the cached meta, so `{state.xxx}` templates re-resolve', () => {
        const { metaCleared } = callSetState('gold', 'categoryX')

        expect(metaCleared).toBe(true)
    })
})
