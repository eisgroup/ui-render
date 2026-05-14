import {
    get,
    setWith,
    unset,
    cloneDeep,
    isEqual,
    isEmpty,
    isObjectLike,
    isPlainObject,
    matches,
    property,
    merge,
    mergeWith,
    some,
    flatten,
    min,
    max,
    difference,
    intersection,
    union,
    unionBy,
    unionWith,
    uniqWith,
    isNumber,
    capitalize,
} from '../lodash-lite'

describe('get with various paths', () => {
    it('supports dot notation', () => {
        expect(get({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1)
    })
    it('supports bracket index notation', () => {
        expect(get({ a: [{ b: 1 }] }, 'a[0].b')).toBe(1)
    })
    it('supports quoted bracket keys', () => {
        expect(get({ 'b.c': 5 }, 'a["b.c"]', undefined)).toBeUndefined()
        expect(get({ a: { 'b.c': 5 } }, 'a["b.c"]')).toBe(5)
    })
    it('supports array path', () => {
        expect(get({ a: { b: 1 } }, ['a', 'b'])).toBe(1)
    })
    it('returns default for missing path', () => {
        expect(get({}, 'a.b', 'fallback')).toBe('fallback')
    })
    it('returns default for null/undefined object', () => {
        expect(get(null, 'a', 'fb')).toBe('fb')
    })
})

describe('setWith', () => {
    it('sets a nested path, creating objects', () => {
        const obj = {}
        setWith(obj, 'a.b.c', 1)
        expect(obj).toEqual({ a: { b: { c: 1 } } })
    })
    it('creates arrays for numeric path segments', () => {
        const obj = {}
        setWith(obj, 'a[0].b', 'x')
        expect(Array.isArray(obj.a)).toBe(true)
        expect(obj.a[0]).toEqual({ b: 'x' })
    })
    it('honors customizer when provided', () => {
        const obj = {}
        setWith(obj, 'a.b', 'v', () => ({ tag: 'custom' }))
        expect(obj.a).toEqual({ tag: 'custom', b: 'v' })
    })
    it('handles null object early-return', () => {
        expect(setWith(null, 'a', 1)).toBeNull()
    })
})

describe('unset', () => {
    it('removes a leaf at a deep path', () => {
        const obj = { a: { b: { c: 1, d: 2 } } }
        expect(unset(obj, 'a.b.c')).toBe(true)
        expect(obj.a.b).toEqual({ d: 2 })
    })
    it('returns false for missing path', () => {
        expect(unset({ a: 1 }, 'b')).toBe(false)
    })
    it('returns false for null/undefined object', () => {
        expect(unset(null, 'x')).toBe(false)
    })
})

describe('cloneDeep', () => {
    it('clones nested objects and arrays', () => {
        const src = { a: [1, { b: 2 }], d: new Date(1234), r: /x/g }
        const out = cloneDeep(src)
        expect(out).toEqual(src)
        expect(out).not.toBe(src)
        expect(out.a).not.toBe(src.a)
        expect(out.a[1]).not.toBe(src.a[1])
        expect(out.d.getTime()).toBe(src.d.getTime())
        expect(out.r.source).toBe('x')
    })
    it('clones Maps and Sets', () => {
        const m = new Map([[1, { x: 1 }]])
        const s = new Set([1, 2])
        const cm = cloneDeep(m)
        const cs = cloneDeep(s)
        expect(cm.get(1)).toEqual({ x: 1 })
        expect(cm.get(1)).not.toBe(m.get(1))
        expect([...cs]).toEqual([1, 2])
    })
    it('handles circular references', () => {
        const obj = { a: 1 }
        obj.self = obj
        const out = cloneDeep(obj)
        expect(out.self).toBe(out)
    })
    it('returns primitives unchanged', () => {
        expect(cloneDeep(42)).toBe(42)
        expect(cloneDeep(null)).toBeNull()
    })
})

describe('isEqual', () => {
    it('compares dates and regex correctly', () => {
        expect(isEqual(new Date(1000), new Date(1000))).toBe(true)
        expect(isEqual(/x/g, /x/g)).toBe(true)
        expect(isEqual(/x/g, /x/i)).toBe(false)
    })
    it('compares Maps and Sets', () => {
        expect(isEqual(new Map([[1, 2]]), new Map([[1, 2]]))).toBe(true)
        expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true)
    })
    it('compares NaN equal', () => {
        expect(isEqual(NaN, NaN)).toBe(true)
    })
    it('returns false for different constructors', () => {
        expect(isEqual([], {})).toBe(false)
    })
})

describe('isEmpty', () => {
    it('treats null/undefined as empty', () => {
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
    })
    it('handles strings, arrays, maps, sets', () => {
        expect(isEmpty('')).toBe(true)
        expect(isEmpty([])).toBe(true)
        expect(isEmpty(new Map())).toBe(true)
        expect(isEmpty(new Set())).toBe(true)
        expect(isEmpty({})).toBe(true)
    })
    it('returns false for non-empty', () => {
        expect(isEmpty('a')).toBe(false)
        expect(isEmpty([1])).toBe(false)
    })
    it('returns false for non-collection primitives', () => {
        expect(isEmpty(42)).toBe(false)
    })
})

describe('matches / property / some', () => {
    it('matches checks shallow match', () => {
        expect(matches({ a: 1 })({ a: 1, b: 2 })).toBe(true)
        expect(matches({ a: 1 })({ a: 2 })).toBe(false)
    })
    it('property creates accessor', () => {
        expect(property('a.b')({ a: { b: 5 } })).toBe(5)
    })
    it('some accepts a predicate function', () => {
        expect(some([1, 2, 3], (v) => v === 2)).toBe(true)
    })
    it('some accepts an object pattern', () => {
        expect(some([{ id: 1 }, { id: 2 }], { id: 2 })).toBe(true)
    })
})

describe('flatten / min / max', () => {
    it('flattens one level', () => {
        expect(flatten([1, [2, 3], [[4]]])).toEqual([1, 2, 3, [4]])
    })
    it('min and max work', () => {
        expect(min([3, 1, 2])).toBe(1)
        expect(max([3, 1, 2])).toBe(3)
    })
    it('min/max return undefined for empty or non-array', () => {
        expect(min([])).toBeUndefined()
        expect(max([])).toBeUndefined()
        expect(min(null)).toBeUndefined()
    })
})

describe('set operations', () => {
    it('difference removes values', () => {
        expect(difference([1, 2, 3], [2])).toEqual([1, 3])
    })
    it('intersection of multiple arrays', () => {
        expect(intersection([1, 2, 3], [2, 3, 4], [3, 5])).toEqual([3])
    })
    it('union deduplicates', () => {
        expect(union([1, 2], [2, 3])).toEqual([1, 2, 3])
    })
    it('unionBy with iteratee string', () => {
        expect(unionBy([{ x: 1 }], [{ x: 1 }, { x: 2 }], 'x')).toEqual([{ x: 1 }, { x: 2 }])
    })
    it('unionWith with comparator', () => {
        const eq = (a, b) => a.id === b.id
        expect(unionWith([{ id: 1 }], [{ id: 1 }, { id: 2 }], eq)).toEqual([
            { id: 1 },
            { id: 2 },
        ])
    })
    it('uniqWith with custom comparator', () => {
        expect(uniqWith([1.1, 1.2, 2.3], (a, b) => Math.floor(a) === Math.floor(b))).toEqual([1.1, 2.3])
    })
})

describe('merge / mergeWith', () => {
    it('merges objects deeply', () => {
        expect(merge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } })
    })
    it('mergeWith respects customizer', () => {
        const out = mergeWith({ list: [1, 2, 3] }, { list: [9] }, (dst, src) => {
            if (Array.isArray(src)) return src
        })
        expect(out.list).toEqual([9])
    })
    it('mergeWith skips undefined values', () => {
        expect(merge({ a: 1 }, { a: undefined })).toEqual({ a: 1 })
    })
})

describe('isObjectLike / isPlainObject / isNumber', () => {
    it('isObjectLike works', () => {
        expect(isObjectLike({})).toBe(true)
        expect(isObjectLike([])).toBe(true)
        expect(isObjectLike(null)).toBe(false)
        expect(isObjectLike(42)).toBe(false)
    })
    it('isPlainObject works', () => {
        expect(isPlainObject({})).toBe(true)
        expect(isPlainObject(Object.create(null))).toBe(true)
        expect(isPlainObject([])).toBe(false)
        class Foo {}
        expect(isPlainObject(new Foo())).toBe(false)
    })
    it('isNumber works', () => {
        expect(isNumber(1)).toBe(true)
        // eslint-disable-next-line no-new-wrappers
        expect(isNumber(new Number(1))).toBe(true)
        expect(isNumber('1')).toBe(false)
    })
})

describe('capitalize', () => {
    it('uppercases first char and lowercases the rest', () => {
        expect(capitalize('hELLO')).toBe('Hello')
    })
    it('returns empty for null/undefined', () => {
        expect(capitalize(null)).toBe('')
        expect(capitalize(undefined)).toBe('')
    })
})

describe('setWith branches', () => {
    it('treats trailing string segment as object key, not array index', () => {
        const obj = {}
        setWith(obj, 'a', 1)
        expect(obj).toEqual({ a: 1 })
    })
    it('handles empty path gracefully', () => {
        const obj = { a: 1 }
        setWith(obj, '', 'x')
        // Empty path produces no change
        expect(obj.a).toBe(1)
    })
    it('honors customizer returning null/undefined (falls back to default)', () => {
        const obj = {}
        setWith(obj, 'a.b', 'v', () => null)
        // Customizer returned null → falls back to default object creation
        expect(obj.a).toEqual({ b: 'v' })
    })
})

describe('isMatch via matches() branches', () => {
    it('identical primitives match', () => {
        expect(matches(42)(42)).toBe(true)
    })
    it('primitive source against object returns false', () => {
        expect(matches(42)({ a: 1 })).toBe(false)
    })
    it('nested object mismatch returns false', () => {
        expect(matches({ a: { b: 1 } })({ a: { b: 2 } })).toBe(false)
    })
})

describe('some with non-array, non-null collection', () => {
    it('iterates object values', () => {
        expect(some({ a: 1, b: 2, c: 3 }, (v) => v === 2)).toBe(true)
        expect(some({ a: 1, b: 2 }, (v) => v === 9)).toBe(false)
    })
    it('returns false for null collection', () => {
        expect(some(null, () => true)).toBe(false)
    })
})

describe('mergeWith with deep nested array of objects', () => {
    it('merges by index into existing dst array', () => {
        const dst = { items: [{ a: 1 }, { a: 2 }] }
        const src = { items: [{ b: 10 }, { b: 20 }] }
        const out = mergeWith(dst, src)
        expect(out.items[0]).toEqual({ a: 1, b: 10 })
        expect(out.items[1]).toEqual({ a: 2, b: 20 })
    })

    it('mergeWith customizer can short-circuit per-key', () => {
        const out = mergeWith({ a: 1 }, { a: 2 }, (dstVal) => dstVal * 10)
        expect(out.a).toBe(10)
    })
})

describe('cloneDeep edge cases', () => {
    it('returns the input unchanged for class instances', () => {
        class Foo { constructor (x) { this.x = x } }
        const input = new Foo(1)
        // class instances are not isPlainObject → keep reference
        expect(cloneDeep(input)).toBe(input)
    })
})
