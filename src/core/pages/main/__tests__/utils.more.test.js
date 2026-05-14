import {
    getFormsData,
    getRawFormsData,
    getLiveMergedDataKindArray,
    replaceDeep,
    errorsProcessing,
} from '../utils'
import { errorsMap, clearErrorsMap } from '../rules'

function makeForm(values) {
    return {
        getState: () => ({ values }),
    }
}

describe('getLiveMergedDataKindArray', () => {
    it('returns [] when no form holds the path', () => {
        const forms = new Map([
            ['f1', { form: makeForm({ other: 'x' }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([])
    })

    it('merges per-row data across forms', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }, { a: 2 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ b: 10 }, { b: 20 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([
            { a: 1, b: 10 },
            { a: 2, b: 20 },
        ])
    })

    it('later forms win on conflicting keys', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ x: 1 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ x: 2 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ x: 2 }])
    })

    it('caps result length to the shortest non-empty array', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }, { a: 2 }, { a: 3 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ b: 1 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 1, b: 1 }])
    })

    it('skips forms without getState', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }] }), meta: {} }],
            ['b', { form: {}, meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 1 }])
    })

    it('returns empty objects for null entries', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [null, { x: 1 }] }), meta: {} }],
        ])
        const out = getLiveMergedDataKindArray('items', forms)
        expect(out).toHaveLength(2)
        expect(out[0]).toEqual({})
        expect(out[1]).toEqual({ x: 1 })
    })
})

describe('getFormsData', () => {
    it('returns master form values when only one form', () => {
        const forms = new Map([
            ['master', { form: makeForm({ a: 1, b: 2 }), meta: {} }],
        ])
        expect(getFormsData(forms)).toEqual({ a: 1, b: 2 })
    })

    it('merges a sub-form at relativePath/relativeIndex into the master', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{}, {}] }), meta: {} }],
            ['child', {
                form: makeForm({ name: 'Alice' }),
                meta: { relativePath: 'items', relativeIndex: 1 },
            }],
        ])
        const out = getFormsData(forms)
        expect(out.items[1]).toEqual({ name: 'Alice' })
    })

    it('skips sub-forms missing relativeIndex', () => {
        const forms = new Map([
            ['master', { form: makeForm({ a: 1 }), meta: {} }],
            ['orphan', { form: makeForm({ b: 2 }), meta: { relativePath: 'items' } }],
        ])
        expect(getFormsData(forms)).toEqual({ a: 1 })
    })
})

describe('getRawFormsData', () => {
    it('merges form values without Select reordering', () => {
        const forms = new Map([
            ['master', {
                form: makeForm({
                    optionSelection: '1',
                    options: [{ name: 'A' }, { name: 'B' }],
                }),
                meta: {},
            }],
        ])
        const out = getRawFormsData(forms)
        // Order is preserved (no reorder)
        expect(out.options[0].name).toBe('A')
        expect(out.optionSelection).toBe('1')
    })

    it('places sub-form values at the right index', () => {
        const forms = new Map([
            ['master', { form: makeForm({ rows: [{}, {}, {}] }), meta: {} }],
            ['child', {
                form: makeForm({ value: 42 }),
                meta: { relativePath: 'rows', relativeIndex: 2 },
            }],
        ])
        const out = getRawFormsData(forms)
        expect(out.rows[2]).toEqual({ value: 42 })
    })
})

describe('replaceDeep', () => {
    it('replaces matching keys at the top level', () => {
        const obj = { name: 'old', other: 1 }
        replaceDeep(obj, 'name', 'new')
        expect(obj.name).toBe('new')
        expect(obj.other).toBe(1)
    })

    it('recurses into nested objects', () => {
        const obj = { a: { name: 'x', deep: { name: 'y' } } }
        replaceDeep(obj, 'name', 'replaced')
        expect(obj.a.name).toBe('replaced')
        expect(obj.a.deep.name).toBe('replaced')
    })

    it('recurses into arrays', () => {
        const obj = { items: [{ name: 'a' }, { name: 'b' }] }
        replaceDeep(obj, 'name', 'X')
        expect(obj.items[0].name).toBe('X')
        expect(obj.items[1].name).toBe('X')
    })

    it('ignores non-collection values', () => {
        expect(() => replaceDeep('plain', 'name', 'x')).not.toThrow()
        expect(() => replaceDeep(null, 'name', 'x')).not.toThrow()
        expect(() => replaceDeep(42, 'name', 'x')).not.toThrow()
    })
})

describe('errorsProcessing', () => {
    function makeFormWithErrors (fieldStates, registered = Object.keys(fieldStates)) {
        return {
            getRegisteredFields: () => registered,
            getFieldState: (name) => fieldStates[name] || {},
        }
    }

    beforeEach(() => {
        clearErrorsMap()
        // Clear errorsMap which is the live module reference
        for (const k of Object.keys(errorsMap)) delete errorsMap[k]
    })

    it('returns early when meta has relativePath but no relativeIndex', () => {
        const form = makeFormWithErrors({})
        expect(() => errorsProcessing(form, { relativePath: 'x' })).not.toThrow()
    })

    it('returns early when no fields are registered', () => {
        const form = makeFormWithErrors({}, [])
        expect(() => errorsProcessing(form, {})).not.toThrow()
    })

    it('does nothing when fields have no error', () => {
        const form = makeFormWithErrors({ foo: { name: 'foo', touched: true } })
        errorsProcessing(form, {})
        expect(errorsMap.foo).toBeUndefined()
    })
})
