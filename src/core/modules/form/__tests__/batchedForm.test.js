/**
 * `createBatchedForm` (2026-10-13): the fields a form registers while its validation is paused hear of each other
 * once, when it resumes, and end with the state plain final-form would have given them.
 *
 * A field's state is counted where final-form computes it, through the field's `isEqual`: `publishFieldState`
 * calls it once, and the form's recalculation twice for every field, for `dirty` and for `dirtySinceLastSubmit`.
 * The cost the batching removes is that count, not the subscribers' calls: a subscriber is called only when its
 * state changed.
 */
import { createForm } from 'final-form'
import { createBatchedForm, registrationsOf } from '../batchedForm'

const SUBSCRIPTION = { value: true, error: true, valid: true, pristine: true }

/** A form, and a field registrar that records what each field hears and counts the field states computed. */
function setUp (initialValues = {}, config = {}) {
    const form = createBatchedForm({ onSubmit: () => undefined, initialValues, ...config })
    const computed = { count: 0 }
    const fields = {}
    const register = (name, config = {}) => {
        const heard = []
        fields[name] = heard
        return form.registerField(name, state => { heard.push(state) }, SUBSCRIPTION, {
            ...config,
            isEqual: (a, b) => {
                computed.count += 1
                return a === b
            },
        })
    }
    return { form, computed, fields, register }
}

const NAMES = Array.from({ length: 50 }, (_, i) => `f${i}`)
const VALUES = Object.fromEntries(NAMES.map((name, i) => [name, i]))

describe('createBatchedForm', () => {
    it('computes each field\'s state a few times, not once per later field, while validation is paused', () => {
        const { form, computed, fields, register } = setUp(VALUES)
        form.pauseValidation()
        NAMES.forEach(name => register(name))
        form.resumeValidation()
        // One for each registration, its own state. On resume, each field's state once more, and twice in the form's.
        expect(computed.count).toBe(4 * NAMES.length)
        // Each field heard its own state once; nothing changed for it after that.
        NAMES.forEach((name, i) => {
            expect(fields[name].map(state => state.value)).toEqual([i])
        })
    })

    it('registers as final-form does once validation has resumed, every earlier field computed again', () => {
        const { form, computed, register } = setUp(VALUES)
        form.pauseValidation()
        form.resumeValidation()
        NAMES.forEach(name => register(name))
        // Field k publishes its own state and the k - 1 before it, and the form's recalculation computes all k twice:
        // 3k for field k, 3n(n + 1)/2 in all.
        expect(computed.count).toBe(3 * NAMES.length * (NAMES.length + 1) / 2)
    })

    it('tells an earlier field, on resume, what a later field\'s default value did to it', () => {
        const { form, fields, register } = setUp()
        form.pauseValidation()
        register('group')
        // No validator and no initial value: final-form does not hold back validation for it, so resuming
        // publishes nothing of its own, and only the batch tells `group`.
        register('group.a', { defaultValue: 'x' })
        expect(fields.group.map(state => state.value)).toEqual([undefined])
        form.resumeValidation()
        expect(fields.group.map(state => state.value)).toEqual([undefined, { a: 'x' }])
    })

    it('validates on resume what registered while paused, with each field\'s own validator', () => {
        const { form, fields, register } = setUp({ name: '' })
        form.pauseValidation()
        register('name', { getValidator: () => value => (value ? undefined : 'Required') })
        expect(fields.name.map(state => state.error)).toEqual([undefined])
        form.resumeValidation()
        expect(fields.name.map(state => state.error)).toEqual([undefined, 'Required'])
        expect(form.getState().valid).toBe(false)
    })

    it('unregisters a field it registered silently as final-form unregisters one that is not: its validator goes, and every listener hears', () => {
        const { form, register } = setUp({ a: '' })
        const valid = []
        form.subscribe(state => { valid.push(state.valid) }, { valid: true })
        form.pauseValidation()
        const unregister = register('a', { getValidator: () => value => (value ? undefined : 'Required') })
        form.resumeValidation()
        expect(valid).toEqual([true, false])
        unregister()
        expect(form.getState().valid).toBe(true)
        expect(valid).toEqual([true, false, true])
    })

    it('tells the form\'s listeners when the last field of a name it registered silently goes', () => {
        const { form, register } = setUp({ a: 1, b: 2 }, { destroyOnUnregister: true })
        const values = []
        form.subscribe(state => { values.push(state.values) }, { values: true })
        form.pauseValidation()
        const unregister = register('a')
        const unregisterAgain = register('a')
        register('b')
        form.resumeValidation()
        const heard = values.length
        // Another registration of `a` is left, so the field stays, and nobody is told anything.
        unregister()
        expect(values).toHaveLength(heard)
        unregisterAgain()
        expect(values[values.length - 1]).toEqual({ b: 2 })
    })

    it('validates again, when a field goes, with the form validator it has then', () => {
        const { form, register } = setUp({ a: 'x' }, { destroyOnUnregister: true })
        form.pauseValidation()
        const unregister = register('a', { getValidator: () => () => undefined })
        register('b')
        form.resumeValidation()
        // As react-final-form sets a `<Form validate>` that changed; any other option leaves it alone.
        form.setConfig('validate', values => (values.a ? {} : { b: 'Needs a' }))
        form.setConfig('onSubmit', () => undefined)
        unregister()
        expect(form.getState().errors).toEqual({ b: 'Needs a' })
    })

    it('registers a field with no config silently while paused, and tells the form when it goes', () => {
        const { form } = setUp({ a: 1 }, { destroyOnUnregister: true })
        const values = []
        form.subscribe(state => { values.push(state.values) }, { values: true })
        form.pauseValidation()
        const unregister = form.registerField('a', () => undefined, { value: true })
        form.resumeValidation()
        unregister()
        expect(values[values.length - 1]).toEqual({})
    })

    it('registers a probe without its validator while validation runs, so that it validates nothing', () => {
        const { form } = setUp({ a: '', b: '' })
        const validated = { count: 0 }
        const counted = () => value => {
            validated.count += 1
            return value ? undefined : 'Required'
        }
        form.registerField('a', () => undefined, { error: true }, { getValidator: counted })
        validated.count = 0
        const heard = []
        // react-final-form's probe in a field's first render: registered silently, and unregistered at once.
        form.registerField('b', state => { heard.push(state) }, { error: true, valid: true }, { silent: true, getValidator: counted })()
        expect(validated.count).toBe(0)
        expect(heard).toEqual([expect.objectContaining({ error: undefined, valid: true })])
        // The field's own registration validates, and finds the error.
        form.registerField('b', () => undefined, { error: true }, { getValidator: counted })
        expect(form.getFieldState('b').error).toBe('Required')
    })

    it('leaves a registration that asks to be silent as it is, and its unregistering', () => {
        const { form } = setUp({ a: 1 })
        const batches = { count: 0 }
        const batch = form.batch
        form.batch = fn => {
            batches.count += 1
            batch(fn)
        }
        const heard = []
        form.subscribe(state => { heard.push(state.valid) }, { valid: true })
        form.pauseValidation()
        // react-final-form's probe in a field's first render: registered silently, and unregistered at once.
        form.registerField('a', () => undefined, { value: true }, { silent: true, getValidator: () => () => 'Invalid' })()
        form.resumeValidation()
        expect(batches.count).toBe(0)
        expect(heard).toEqual([true])
    })

    it('batches nothing when nothing registered while validation was paused', () => {
        const { form, register } = setUp(VALUES)
        const batches = { count: 0 }
        const batch = form.batch
        form.batch = fn => {
            batches.count += 1
            batch(fn)
        }
        form.pauseValidation()
        form.resumeValidation()
        expect(batches.count).toBe(0)
        form.pauseValidation()
        register('f0')
        form.resumeValidation()
        expect(batches.count).toBe(1)
        // Once told, a later pause and resume has nothing to tell.
        form.pauseValidation()
        form.resumeValidation()
        expect(batches.count).toBe(1)
    })
})

describe('registrationsOf', () => {
    const required = () => value => (value ? undefined : 'Required')

    it('is the brackets of a batched form, and of a copy of one; nothing for any other form', () => {
        const form = createBatchedForm({ onSubmit: () => undefined })
        expect(registrationsOf(form)).toEqual({ begin: expect.any(Function), end: expect.any(Function) })
        // What react-final-form hands its render prop: a copy of the instance, with a `reset` of its own.
        expect(registrationsOf({ ...form, reset: () => undefined })).toBe(registrationsOf(form))
        expect(registrationsOf(createForm({ onSubmit: () => undefined }))).toBeUndefined()
        expect(registrationsOf(undefined)).toBeUndefined()
    })

    it('registers what comes between its brackets silently, and tells every field once when the outermost closes', () => {
        const { form, computed, fields, register } = setUp(VALUES)
        const { begin, end } = registrationsOf(form)
        begin()
        begin()
        expect(form.isValidationPaused()).toBe(true)
        NAMES.forEach(name => register(name))
        end()
        expect(form.isValidationPaused()).toBe(true)
        end()
        expect(form.isValidationPaused()).toBe(false)
        // As in the first render's batch: one for each registration, then once more and twice in the form's.
        expect(computed.count).toBe(4 * NAMES.length)
        NAMES.forEach((name, i) => {
            expect(fields[name].map(state => state.value)).toEqual([i])
        })
    })

    it('validates what registered between its brackets once, when they close', () => {
        const { form, register } = setUp(Object.fromEntries(NAMES.map(name => [name, ''])))
        const validated = { count: 0 }
        const counted = () => value => {
            validated.count += 1
            return value ? undefined : 'Required'
        }
        const { begin, end } = registrationsOf(form)
        begin()
        NAMES.forEach(name => register(name, { getValidator: counted }))
        expect(validated.count).toBe(0)
        end()
        expect(validated.count).toBe(NAMES.length)
        expect(Object.keys(form.getState().errors)).toHaveLength(NAMES.length)
    })

    it('holds back what the fields that go between its brackets would tell, and tells it once when they close', () => {
        const { form, register } = setUp({ a: '', b: 'x' })
        const valid = []
        form.subscribe(state => { valid.push(state.valid) }, { valid: true })
        const { begin, end } = registrationsOf(form)
        begin()
        const unregister = register('a', { getValidator: required })
        register('b')
        end()
        expect(valid).toEqual([true, false])
        // A tab switch: the old tab's field goes between the brackets of the new tab's content.
        begin()
        unregister()
        expect(valid).toEqual([true, false])
        end()
        expect(form.getState().valid).toBe(true)
        expect(valid).toEqual([true, false, true])
    })

    it('holds back the same while react-final-form has validation paused, until it resumes it', () => {
        const { form, register } = setUp({ a: '' })
        const valid = []
        form.subscribe(state => { valid.push(state.valid) }, { valid: true })
        const unregister = register('a', { getValidator: required })
        expect(valid).toEqual([true, false])
        // As its effect's cleanup does before the fields' own, under StrictMode or on unmount.
        form.pauseValidation()
        unregister()
        expect(valid).toEqual([true, false])
        form.resumeValidation()
        expect(valid).toEqual([true, false, true])
    })

    it('leaves validation that something else paused to it, and settles when that resumes it', () => {
        const { form, fields, register } = setUp({ a: '' })
        form.pauseValidation()
        const { begin, end } = registrationsOf(form)
        begin()
        register('a', { getValidator: required })
        end()
        expect(form.isValidationPaused()).toBe(true)
        expect(fields.a.map(state => state.error)).toEqual([undefined])
        form.resumeValidation()
        expect(fields.a.map(state => state.error)).toEqual([undefined, 'Required'])
    })

    it('leaves the resuming to what paused validation first, when that resumes before the bracket closes', () => {
        const { form, fields, register } = setUp({ a: '' })
        const { begin, end } = registrationsOf(form)
        form.pauseValidation()
        begin()
        register('a', { getValidator: required })
        form.resumeValidation()
        expect(fields.a.map(state => state.error)).toEqual([undefined, 'Required'])
        end()
        expect(fields.a.map(state => state.error)).toEqual([undefined, 'Required'])
        expect(form.isValidationPaused()).toBe(false)
    })

    it('closes nothing it did not open', () => {
        const { form } = setUp()
        const { end } = registrationsOf(form)
        end()
        expect(form.isValidationPaused()).toBe(false)
        form.pauseValidation()
        end()
        expect(form.isValidationPaused()).toBe(true)
    })

    it('validates what has registered before a submit that comes between its brackets', () => {
        const submitted = []
        const form = createBatchedForm({ onSubmit: values => { submitted.push(values) }, initialValues: { a: '' } })
        const { begin, end } = registrationsOf(form)
        begin()
        form.registerField('a', () => undefined, { value: true }, { getValidator: required })
        form.submit()
        expect(submitted).toEqual([])
        expect(form.getState().errors).toEqual({ a: 'Required' })
        expect(form.isValidationPaused()).toBe(true)
        end()
        expect(form.isValidationPaused()).toBe(false)
        form.change('a', 'x')
        form.submit()
        expect(submitted).toEqual([{ a: 'x' }])
    })
})
