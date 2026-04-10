import { mergeReplaceArrays } from '../object'

describe('mergeReplaceArrays', () => {
    it('deep-merges plain objects', () => {
        const result = mergeReplaceArrays({ a: 1, nested: { x: 1 } }, { b: 2, nested: { y: 2 } })
        expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } })
    })

    it('replaces arrays wholesale instead of merging by index', () => {
        const base = { items: [1, 2, 3] }
        const override = { items: [4, 5] }
        const result = mergeReplaceArrays(base, override)
        expect(result.items).toEqual([4, 5])
    })

    it('replaces with empty array', () => {
        const base = { items: [1, 2, 3] }
        const override = { items: [] }
        const result = mergeReplaceArrays(base, override)
        expect(result.items).toEqual([])
    })

    it('replaces nested arrays inside objects', () => {
        const base = { outer: { list: [1, 2, 3] } }
        const override = { outer: { list: [4] } }
        const result = mergeReplaceArrays(base, override)
        expect(result.outer.list).toEqual([4])
    })

    it('does not mutate source objects', () => {
        const base = { a: 1, nested: { x: 1 } }
        const override = { nested: { y: 2 } }
        mergeReplaceArrays(base, override)
        expect(base).toEqual({ a: 1, nested: { x: 1 } })
        expect(override).toEqual({ nested: { y: 2 } })
    })

    it('second source overrides first for scalar values', () => {
        const result = mergeReplaceArrays({ a: 1 }, { a: 2 })
        expect(result.a).toBe(2)
    })

    it('preserves base keys absent from source', () => {
        const result = mergeReplaceArrays({ a: 1, b: 2 }, { a: 10 })
        expect(result).toEqual({ a: 10, b: 2 })
    })

    it('handles null/undefined base gracefully', () => {
        expect(mergeReplaceArrays(null, { a: 1 })).toEqual({ a: 1 })
        expect(mergeReplaceArrays(undefined, { a: 1 })).toEqual({ a: 1 })
    })

    it('skips undefined source values (lodash mergeWith behavior)', () => {
        const result = mergeReplaceArrays({ flag: true }, { flag: undefined })
        // lodash merge skips undefined — base value is preserved
        expect(result.flag).toBe(true)
    })

    it('null source values DO override base', () => {
        const result = mergeReplaceArrays({ flag: true }, { flag: null })
        expect(result.flag).toBe(null)
    })
})
