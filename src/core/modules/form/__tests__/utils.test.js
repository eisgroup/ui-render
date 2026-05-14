import { fieldValues, registeredFieldValues, registeredFieldErrors } from '../utils'

function makeForm({ values = {}, registered = [], fieldStates = {} } = {}) {
    return {
        getState: () => ({ values }),
        getRegisteredFields: () => registered,
        getFieldState: (name) => fieldStates[name] || {},
    }
}

describe('fieldValues', () => {
    it('returns the form values from state', () => {
        const form = makeForm({ values: { a: 1, b: 'x' } })
        expect(fieldValues(form)).toEqual({ a: 1, b: 'x' })
    })
})

describe('registeredFieldValues', () => {
    it('returns undefined when no fields are registered', () => {
        const form = makeForm({ registered: [] })
        expect(registeredFieldValues(form)).toBeUndefined()
    })

    it('returns undefined when no fields have values', () => {
        const form = makeForm({
            registered: ['a'],
            fieldStates: { a: { value: undefined } },
        })
        expect(registeredFieldValues(form)).toBeUndefined()
    })

    it('builds a nested object from dot-path field names', () => {
        const form = makeForm({
            registered: ['user.name', 'user.email'],
            fieldStates: {
                'user.name': { value: 'Alice' },
                'user.email': { value: 'a@b.c' },
            },
        })
        expect(registeredFieldValues(form)).toEqual({
            user: { name: 'Alice', email: 'a@b.c' },
        })
    })

    it('skips fields with null/undefined values', () => {
        const form = makeForm({
            registered: ['a', 'b'],
            fieldStates: {
                a: { value: 'x' },
                b: { value: null },
            },
        })
        expect(registeredFieldValues(form)).toEqual({ a: 'x' })
    })
})

describe('registeredFieldErrors', () => {
    it('returns undefined when no fields are registered', () => {
        expect(registeredFieldErrors(makeForm({ registered: [] }))).toBeUndefined()
    })

    it('returns undefined when no fields have errors', () => {
        const form = makeForm({
            registered: ['a'],
            fieldStates: { a: {} },
        })
        expect(registeredFieldErrors(form)).toBeUndefined()
    })

    it('maps registered fields with errors to their messages', () => {
        const form = makeForm({
            registered: ['a', 'b'],
            fieldStates: {
                a: { error: 'Required' },
                b: { error: undefined },
            },
        })
        expect(registeredFieldErrors(form)).toEqual({ a: 'Required' })
    })
})
