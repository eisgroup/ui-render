import {
  hasObjectValue,
  isEqualJSON,
  isObject,
  merge,
  mergeReplaceArrays,
  objChanges,
  set,
  update,
  removeNilValues,
  sanitizeResponse,
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

describe('removeNilValues', () => {
    it('removes null/undefined values', () => {
        expect(removeNilValues({ a: 1, b: null, c: undefined })).toEqual({ a: 1 })
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

