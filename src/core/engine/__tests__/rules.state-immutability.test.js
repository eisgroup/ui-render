/**
 * THE ENGINE MUST NOT REWRITE A STATE OBJECT IT HAS ALREADY HANDED OUT.
 * =============================================================================================
 *
 * Four update paths were written as `this.setState(set(this.state, path, value))`, and `set()` is
 * documented as mutating its argument. So the state object React had already given to
 * `shouldComponentUpdate`, `componentDidUpdate(prevProps, prevState)` and every consumer holding a
 * reference was rewritten in place: `prevState` carried the NEXT value, and a state comparison
 * could not see a change it was supposed to react to.
 *
 * `setStates` and the `data` setter only need `state` and `setState` from their instance, so they
 * are called against a minimal one — the same approach as `rules.set-state-path.test.js`, and for
 * the same reason: driving this through a rendered engine would exercise the same lines behind a
 * form and a click without saying which object was written.
 */
import { UIRender } from '../rules'

/**
 * `setState` BATCHES, and the fake has to as well.
 *
 * A fake that assigns `instance.state` on the spot hides the defect that matters most here: two
 * `setState(object)` calls in one React batch BOTH read the state as it was before either of them,
 * so the second object overwrites what the first one set. Applying the queue only on flush is what
 * makes that visible — and it is why these paths pass an updater rather than an object.
 */
const makeInstance = state => {
    const pending = []
    const instance = Object.create(UIRender.prototype)
    instance.state = state
    instance.props = {}
    instance.setState = function (next) {
        pending.push(next)
    }
    instance.flushState = function () {
        while (pending.length) {
            const next = pending.shift()
            const partial = typeof next === 'function' ? next(instance.state, instance.props) : next
            instance.state = { ...instance.state, ...partial }
        }
    }
    return instance
}

describe('engine state updates leave the previous state object intact', () => {
    it('setStates', () => {
        const observed = { existing: 'kept' }
        const instance = makeInstance(observed)

        instance.setStates('gold', 'categoryX')
        instance.flushState()

        expect(observed).toEqual({ existing: 'kept' })
        expect(instance.state.categoryX).toBe('gold')
    })

    it('setStates writing a nested path', () => {
        const group = { category: 'silver' }
        const observed = { group }
        const instance = makeInstance(observed)

        instance.setStates('gold', 'group.category')
        instance.flushState()

        expect(group.category).toBe('silver')
        expect(instance.state.group.category).toBe('gold')
    })

    it('the `data` setter', () => {
        const data = { json: { label: 'first' } }
        const observed = { data, meta: { json: undefined } }
        const instance = makeInstance(observed)

        instance.data = { label: 'second' }
        instance.flushState()

        expect(data.json).toEqual({ label: 'first' })
        expect(instance.state.data.json).toEqual({ label: 'second' })
    })

    it('incoming data and meta props', () => {
        const data = { json: { label: 'first' } }
        const meta = { json: { view: 'Row' } }
        const observed = { data, meta }
        const instance = makeInstance(observed)
        instance.props = { data: { label: 'first' }, meta: { view: 'Row' } }

        instance.UNSAFE_componentWillReceiveProps({
            data: { label: 'second' },
            meta: { view: 'Col' },
        })
        instance.flushState()

        expect(data.json).toEqual({ label: 'first' })
        expect(meta.json).toEqual({ view: 'Row' })
        expect(instance.state.data.json).toEqual({ label: 'second' })
        expect(instance.state.meta.json).toEqual({ view: 'Col' })
    })

    it('keeps both writes when two state paths are set in one batch', () => {
        // Two meta actions can land in a single React batch. While the update MUTATED the state,
        // the second call read the first one's result and both survived; an immutable copy built
        // from `this.state` would be built from the state as it was BEFORE either, so the second
        // partial would carry the first path's old value and undo it. Hence the updater form.
        const instance = makeInstance({ existing: 'kept' })

        instance.setStates('gold', 'group.first')
        instance.setStates('silver', 'group.second')
        instance.flushState()

        expect(instance.state.group).toEqual({ first: 'gold', second: 'silver' })
    })

    it('keeps the no-op shape when no state path was configured', () => {
        // `setStates` with no string argument has always been a no-op rather than an error, and
        // `mapper.js` relies on that for callers that pass only a value.
        const observed = { existing: 'kept' }
        const instance = makeInstance(observed)

        instance.setStates('gold')
        instance.flushState()

        expect(instance.state).toEqual({ existing: 'kept' })
        expect(observed).toEqual({ existing: 'kept' })
    })
})
