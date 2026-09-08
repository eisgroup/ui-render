/**
 * HOW A META'S CONFIGURED ACTION ARGUMENTS MEET THE CALLER'S — and the collision that follows
 * for any caller whose arity is not fixed.
 * =============================================================================================
 *
 * FOUND BY THE §9.7-F1 STEP 3 PART 1 AUDIT, and pinned here as MEASURED CURRENT BEHAVIOUR rather
 * than fixed, because the fix is not local: `getFunctionFromString` is how every `FIELD.FUNC`
 * action receives its meta-configured arguments, so changing the order changes every action in
 * every meta — including consumer metas this repo cannot read.
 *
 * The scheme is "caller's arguments first, configured arguments appended":
 *
 *     'setState,categoryX'  ->  (...caller) => setStates(...caller, 'categoryX')
 *
 * That is unambiguous only while the caller's arity is FIXED and known. The dropdown's is not:
 * `onChange(value, name, event)` passes three, so the call becomes
 *
 *     setStates(value, name, event, 'categoryX')
 *
 * and `setStates(value, keyPath)` reads its second POSITIONAL argument — the field's `name` — as
 * the state path, while the path the meta configured arrives fourth and is ignored.
 *
 * The codebase already knows, and works around it in exactly one place: `mapper.js` re-wraps
 * `onChange` for stable-value Selects to pass the value alone, with the comment "Only pass the
 * converted value (not name/event) so setStates uses the config keyPath, not the modified
 * input.name". Every other `view: 'Select'` with a `setState` action whose configured path differs
 * from the field's resolved name writes to the wrong state path.
 *
 * WHY IT IS NOT FIXED HERE. Three options were considered. Making `setStates` read its LAST
 * argument as the path fixes the dropdown and keeps two-argument callers working, but breaks a
 * `setState` configured with NO path at all. Generalising the mapper's workaround to every Select
 * changes what the second and third `onChange` arguments are for. Reordering the plumbing so
 * configured arguments come first changes every action. All three need the consumer-meta audit
 * that §9.7-F1 step 3's swap PR owes anyway — so this file states the behaviour precisely enough
 * that whoever takes that decision does not have to re-derive it.
 */
import { metaToProps } from '../transforms'

/**
 * Through the PUBLIC entry point rather than the module-private resolver: `getFunctionFromString`
 * is not exported, and widening a module's API for a test buys nothing here — `metaToProps` is how
 * the engine actually turns a meta's `onChange: 'setState,categoryX'` string into the function the
 * component is handed, so this drives the same code by the same route a meta does.
 */
const actionFrom = (declaration, fieldFunc) => {
    // `funcConfig` is the key `metaToProps` reads the resolvers from — the same shape `rules.js`
    // builds when it wires `FIELD.FUNC` to the instance.
    const props = metaToProps({ view: 'Select', ...declaration }, {
        data: {},
        funcConfig: {
            data: {}, fieldFunc, fieldMethods: {}, fieldNormalizer: {}, fieldParser: {}, fieldValidation: {},
        },
    })
    return props.onChange
}

describe('a configured action argument against a variable-arity caller', () => {
    const calls = []
    const fieldFunc = {
        // Deliberately variadic, so the test records the WHOLE call rather than a signature's
        // view of it. A plain function, not `jest.fn()`, per the house rule.
        setState: (...args) => calls.push(args),
    }

    beforeEach(() => { calls.length = 0 })

    it('appends the configured argument AFTER whatever the caller passed', () => {
        const action = actionFrom({ onChange: 'setState,categoryX' }, fieldFunc)

        action('gold', 'group.category', { type: 'click' })

        expect(calls).toHaveLength(1)
        expect(calls[0].slice(0, 2)).toEqual(['gold', 'group.category'])
        expect(calls[0][3]).toBe('categoryX')
    })

    it('so a two-argument reader takes the caller\'s second argument, not the configured one', () => {
        const action = actionFrom({ onChange: 'setState,categoryX' }, fieldFunc)

        // What a dropdown does: `onChange(value, name, event)`.
        action('gold', 'group.category', { type: 'click' })
        const [value, keyPathAsRead] = calls[0]

        expect(value).toBe('gold')
        // THE DEFECT, stated as the measurement: a `setStates(value, keyPath)` signature reads
        // the field's name here. `'categoryX'` — what the meta asked for — is at index 3.
        expect(keyPathAsRead).toBe('group.category')
        expect(keyPathAsRead).not.toBe('categoryX')
    })

    it('and a single-argument caller works, which is why the workaround is to strip arguments', () => {
        const action = actionFrom({ onChange: 'setState,categoryX' }, fieldFunc)

        // What `mapper.js` re-wraps stable-value Selects to do.
        action('gold')

        expect(calls[0]).toEqual(['gold', 'categoryX'])
    })

    it('passes the function straight through when the meta configures no arguments', () => {
        const action = actionFrom({ onChange: 'setState' }, fieldFunc)

        action('gold', 'group.category')

        // No wrapper at all in this case — which is why "read the LAST argument as the path" is
        // not a safe fix on its own: here the last argument is the caller's, not the meta's.
        expect(calls[0]).toEqual(['gold', 'group.category'])
    })
})
