import { fromFlatObj, get, mergeReplaceArrays, toFlatObj } from '../object'

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

describe('toFlatObj / fromFlatObj', () => {
    it('flattens nested objects with dot keys', () => {
        const nested = { a: 1, b: { c: 2, d: { e: 3 } } }
        expect(toFlatObj(nested)).toEqual({
            a: 1,
            'b.c': 2,
            'b.d.e': 3,
        })
    })

    it('round-trips nested objects', () => {
        const original = { x: 1, y: { z: [1, 2] } }
        const flat = toFlatObj(original)
        const back = fromFlatObj(flat)
        expect(back).toEqual(original)
    })

    it('preserves shallow values', () => {
        expect(toFlatObj({ only: 'top' })).toEqual({ only: 'top' })
    })

    it('respects maxDepth when flattening', () => {
        const input = { a: { b: { c: 1 } } }
        // depth 1: keys at `a`; depth 2: one more level → `a.b` holds the remainder
        expect(toFlatObj(input, { maxDepth: 2 })).toEqual({
            'a.b': { c: 1 },
        })
    })

    it('unflatten returns non-objects as-is', () => {
        expect(fromFlatObj(null)).toBe(null)
        expect(fromFlatObj('x')).toBe('x')
    })
})

describe('get', () => {
    const obj = { a: { b: [10, 20] }, top: 'value' }

    it('resolves dot and bracket paths', () => {
        expect(get(obj, 'top')).toBe('value')
        expect(get(obj, 'a.b[1]')).toBe(20)
    })

    it('returns the fallback for an empty path instead of the whole object', () => {
        // `label: {name: ''}` in a meta config must resolve to the fallback, not to the data
        // object — rendering an object as a React child throws.
        expect(get(obj, '', '')).toBe('')
        expect(get(obj, '')).toBeUndefined()
        expect(get(obj, null, 'fb')).toBe('fb')
    })

    it('returns the fallback for a missing path', () => {
        expect(get(obj, 'a.missing', 'fb')).toBe('fb')
        expect(get(obj, 'nope.deep', 'fb')).toBe('fb')
    })

    // A path with an empty segment must not silently resolve to an ancestor value: dropping the
    // empty segment would make `get(data, 'a..b')` return `data.a.b`, and `get(data, 'a.')`
    // return `data.a` — handing out whole objects for a malformed path.
    it('returns the fallback for paths with empty segments', () => {
        expect(get(obj, 'a.', 'fb')).toBe('fb')
        expect(get(obj, '.a', 'fb')).toBe('fb')
        expect(get(obj, 'a..b', 'fb')).toBe('fb')
        expect(get(obj, '.', 'fb')).toBe('fb')
        expect(get(obj, 'a[]', 'fb')).toBe('fb')
    })

    it('still resolves brackets written after a dot', () => {
        expect(get(obj, 'a.b.[1]')).toBe(20)
    })
})
