import {
    changeOptionOrderForSelectFields,
    getFormsData,
    getRawFormsData,
    getLiveMergedDataKindArray,
} from '../formData'

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

describe('changeOptionOrderForSelectFields', () => {
    it('reorders data for index-based Select', () => {
        const data = {
            optionSelection: '1',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option B')
        expect(result.optionSelection).toBeUndefined()
    })

    it('does NOT reorder for non-index Select (stable value)', () => {
        const data = {
            optionSelection: 'Option B',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: 'optionName' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option A')
        expect(result.optionSelection).toBe('Option B')
    })

    it('processes nested items recursively', () => {
        const data = {
            categorySelection: '1',
            categories: [
                { categoryName: 'Basic' },
                { categoryName: 'Standard' },
            ],
        }
        const meta = {
            view: 'VerticalLayout',
            items: [
                {
                    view: 'Select',
                    name: 'categorySelection',
                    mapOptions: { text: 'categoryName', value: '{index}' },
                },
            ],
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.categories[0].categoryName).toBe('Standard')
        expect(result.categorySelection).toBeUndefined()
    })

    it('processes renderItem.items recursively', () => {
        const data = {
            selection: '0',
            items: [
                { name: 'A' },
                { name: 'B' },
            ],
        }
        const meta = {
            view: 'Table',
            renderItem: {
                items: [
                    {
                        view: 'Select',
                        name: 'selection',
                        mapOptions: { text: 'name', value: '{index}' },
                    },
                ],
            },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // selection '0' means first item, moving it to front is a no-op
        expect(result.items[0].name).toBe('A')
    })

    it('returns data unchanged when meta is null', () => {
        const data = { foo: 'bar' }
        const result = changeOptionOrderForSelectFields(data, null)
        expect(result).toEqual({ foo: 'bar' })
    })

    it('handles non-string select value (number)', () => {
        const data = {
            optionSelection: 1,
            options: [{ optionName: 'A' }, { optionName: 'B' }],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // non-string value should not trigger reorder
        expect(result.options[0].optionName).toBe('A')
        expect(result.optionSelection).toBe(1)
    })
})
