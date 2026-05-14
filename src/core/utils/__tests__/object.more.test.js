import {
    hasObjectValue,
    isEqualJSON,
    isObject,
    merge,
    mergeReplaceArrays,
    objChanges,
    set,
    update,
    hasObjMatch,
    hasObjKeys,
    findObjByKeys,
    findAllObjsByKeys,
    toFlatObj,
    fromFlatObj,
    pop,
    removeKey,
    removeKeys,
    removeEmptyValues,
    removeNilValues,
    removeDeletedItems,
    sanitizeResponse,
    sortObjKeys,
    swapKeyWithValue,
    toObjValuesTotal,
} from '../object'

describe('hasObjectValue', () => {
    it('returns true for non-empty objects', () => {
        expect(hasObjectValue({ a: 1 })).toBe(true)
    })
    it('returns false for empty objects', () => {
        expect(hasObjectValue({})).toBe(false)
    })
    it('returns false for non-objects', () => {
        expect(hasObjectValue([])).toBe(false)
        expect(hasObjectValue(null)).toBe(false)
        expect(hasObjectValue('hi')).toBe(false)
    })
})

describe('isEqualJSON', () => {
    it('returns true for equal JSON-serialised values', () => {
        expect(isEqualJSON({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })
    it('returns false when stringified differs', () => {
        expect(isEqualJSON({ a: 1 }, { a: 2 })).toBe(false)
    })
})

describe('isObject', () => {
    it('returns true for plain objects', () => {
        expect(isObject({})).toBe(true)
    })
    it('returns false for arrays / null / primitives', () => {
        expect(isObject([])).toBe(false)
        expect(isObject(null)).toBe(false)
        expect(isObject('a')).toBe(false)
    })
})

describe('merge', () => {
    it('merges multiple objects deeply', () => {
        expect(merge({ a: { x: 1 } }, { a: { y: 2 }, b: 3 })).toEqual({ a: { x: 1, y: 2 }, b: 3 })
    })
    it('does not mutate inputs', () => {
        const a = { x: 1 }
        merge(a, { y: 2 })
        expect(a).toEqual({ x: 1 })
    })
})

describe('mergeReplaceArrays', () => {
    it('replaces arrays wholesale instead of merging', () => {
        expect(mergeReplaceArrays({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] })
    })
    it('still merges nested objects', () => {
        expect(mergeReplaceArrays({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } })
    })
})

describe('objChanges', () => {
    it('returns only the changed keys', () => {
        expect(objChanges({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: 3 })
    })
    it('marks removed props as null', () => {
        expect(objChanges({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: null })
    })
    it('returns undefined when there are no changes', () => {
        expect(objChanges({ a: 1 }, { a: 1 })).toBeUndefined()
    })
    it('recurses into nested objects', () => {
        expect(
            objChanges({ a: { x: 1, y: 2 } }, { a: { x: 1, y: 3 } })
        ).toEqual({ a: { y: 3 } })
    })
})

describe('set', () => {
    it('sets a value at a deep path', () => {
        const obj = {}
        set(obj, 'a.b.c', 42)
        expect(obj).toEqual({ a: { b: { c: 42 } } })
    })
})

describe('update', () => {
    it('updates nested properties, preserving siblings', () => {
        expect(update({ user: { name: 'A', sign: 's' } }, { user: { sign: 'x' } })).toEqual({
            user: { name: 'A', sign: 'x' },
        })
    })
    it('clones deeply when shouldCloneDeep=true', () => {
        const state = { a: { b: 1 } }
        const result = update(state, { a: { b: 2 } }, true)
        expect(state.a.b).toBe(1)
        expect(result.a.b).toBe(2)
    })
    it('deletes null when deleteNull=true', () => {
        expect(update({ a: 1, b: 2 }, { a: null }, false, true)).toEqual({ b: 2 })
    })
})

describe('hasObjMatch', () => {
    it('finds nested match', () => {
        expect(hasObjMatch([[[1, -1], [2, -2]]], [1, -1])).toBe(true)
    })
    it('returns false when no match exists', () => {
        expect(hasObjMatch({ a: { b: 1 } }, { b: 99 })).toBe(false)
    })
})

describe('hasObjKeys', () => {
    it('matches with deep comparison', () => {
        expect(hasObjKeys({ a: 1 }, { a: 1 })).toBe(true)
        expect(hasObjKeys({ a: 1 }, { a: 2 })).toBe(false)
    })
    it('matches paths with shallow comparison', () => {
        expect(hasObjKeys({ x: { id: 7 } }, { 'x.id': 7 }, 'shallow')).toBe(true)
    })
    it('shallow returns false on object mismatch', () => {
        expect(hasObjKeys({ a: { x: 1 } }, { a: { x: 2 } }, 'shallow')).toBe(false)
    })
    it('include returns true when value is an object that matches', () => {
        expect(hasObjKeys({ x: { id: 7 } }, { x: { id: 7 } }, 'include')).toBe(true)
    })
    it('include returns false when value is primitive and mismatches', () => {
        expect(hasObjKeys({ a: 1 }, { a: 2 }, 'include')).toBe(false)
    })
    it('include traverses nested objects for matches', () => {
        expect(hasObjKeys({ x: [{ a: 1 }, { a: 2 }] }, { x: { a: 1 } }, 'include')).toBe(true)
    })
})

describe('findObjByKeys / findAllObjsByKeys', () => {
    const obj = {
        items: [
            { id: 1, type: 'A' },
            { id: 2, type: 'B' },
            { id: 3, type: 'A' },
        ],
    }
    it('finds first matching nested object', () => {
        expect(findObjByKeys(obj, { type: 'A' })).toEqual({ id: 1, type: 'A' })
    })
    it('finds all matching nested objects', () => {
        expect(findAllObjsByKeys(obj, { type: 'A' })).toEqual([
            { id: 1, type: 'A' },
            { id: 3, type: 'A' },
        ])
    })
})

describe('toFlatObj / fromFlatObj', () => {
    it('flattens nested objects', () => {
        expect(toFlatObj({ a: { b: { c: 1 } } })).toEqual({ 'a.b.c': 1 })
    })
    it('round-trips via unflatten', () => {
        const original = { a: { b: { c: 1, d: [1, 2] } }, e: 'x' }
        expect(fromFlatObj(toFlatObj(original))).toEqual(original)
    })
    it('respects custom delimiter', () => {
        expect(toFlatObj({ a: { b: 1 } }, { delimiter: '/' })).toEqual({ 'a/b': 1 })
    })
})

describe('pop', () => {
    it('extracts and removes a value at a key path', () => {
        const obj = { a: { b: 1 } }
        expect(pop(obj, 'a.b')).toBe(1)
        expect(obj).toEqual({ a: {} })
    })
    it('returns the fallback when value is missing', () => {
        expect(pop({}, 'x.y', 'fb')).toBe('fb')
    })
})

describe('removeKey', () => {
    it('returns new object without the key', () => {
        const obj = { a: 1, b: 2 }
        expect(removeKey(obj, 'a')).toEqual({ b: 2 })
        expect(obj).toEqual({ a: 1, b: 2 })
    })
})

describe('removeKeys', () => {
    it('removes top-level keys', () => {
        expect(removeKeys({ a: 1, b: 2 }, ['a'])).toEqual({ b: 2 })
    })
    it('removes keys recursively when requested', () => {
        const out = removeKeys({ a: 1, child: { a: 2, b: 3 } }, ['a'], { recursive: true })
        expect(out).toEqual({ child: { b: 3 } })
    })
    it('clones when requested', () => {
        const obj = { a: 1, b: 2 }
        const out = removeKeys(obj, ['a'], { clone: true })
        expect(out).toEqual({ b: 2 })
        expect(obj).toEqual({ a: 1, b: 2 })
    })
})

describe('removeEmptyValues', () => {
    it('removes empty strings', () => {
        expect(removeEmptyValues({ a: 'x', b: '' })).toEqual({ a: 'x' })
    })
    it('removes falsy from arrays', () => {
        expect(removeEmptyValues([1, '', 2, ''])).toEqual([1, 2])
    })
})

describe('removeNilValues', () => {
    it('removes null/undefined values', () => {
        expect(removeNilValues({ a: 1, b: null, c: undefined })).toEqual({ a: 1 })
    })
})

describe('removeDeletedItems', () => {
    it('removes items with truthy .delete from collection', () => {
        const out = removeDeletedItems({ a: { id: 1 }, b: { id: 2, delete: true } })
        expect(out).toEqual({ a: { id: 1 } })
    })
})

describe('sanitizeResponse', () => {
    it('removes __typename and null', () => {
        expect(sanitizeResponse({ __typename: 'X', a: 1, b: null })).toEqual({ a: 1 })
    })
    it('removes custom tags and clones when asked', () => {
        const input = { secret: 'x', a: 1 }
        const out = sanitizeResponse(input, { tags: ['secret'], clone: true })
        expect(out).toEqual({ a: 1 })
        expect(input).toEqual({ secret: 'x', a: 1 })
    })
})

describe('sortObjKeys', () => {
    it('sorts ascending by default', () => {
        expect(Object.keys(sortObjKeys({ b: 1, a: 2, c: 3 }))).toEqual(['a', 'b', 'c'])
    })
    it('sorts descending when requested', () => {
        expect(Object.keys(sortObjKeys({ b: 1, a: 2, c: 3 }, 'desc'))).toEqual(['c', 'b', 'a'])
    })
})

describe('swapKeyWithValue', () => {
    it('swaps keys with values', () => {
        expect(swapKeyWithValue({ id: 1, name: 'Tom' })).toEqual({ 1: 'id', Tom: 'name' })
    })
})

describe('toObjValuesTotal', () => {
    it('sums numeric values', () => {
        expect(toObjValuesTotal({ a: 1, b: 2, c: 3 })).toBe(6)
    })
})
