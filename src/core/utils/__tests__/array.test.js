import {
  hasListValue,
  isCollection,
  isEqualList,
  isList,
  isInListAny,
  toList,
  toListValuesTotal,
  last,
  sortAscending,
  sortDescending,
  by,
  toFlatList,
} from '../array'

describe('hasListValue', () => {
    it('returns true for non-empty arrays', () => {
        expect(hasListValue([1])).toBe(true)
    })
    it('returns false for empty arrays', () => {
        expect(hasListValue([])).toBe(false)
    })
    it('returns false for non-arrays', () => {
        expect(hasListValue('abc')).toBe(false)
        expect(hasListValue(null)).toBe(false)
    })
})

describe('isCollection', () => {
    it('returns true for arrays and plain objects', () => {
        expect(isCollection([])).toBe(true)
        expect(isCollection({})).toBe(true)
    })
    it('returns false for primitives and null', () => {
        expect(isCollection(null)).toBe(false)
        expect(isCollection('abc')).toBe(false)
    })
})

describe('isEqualList', () => {
    it('returns true for identical references', () => {
        const a = [1, 2, 3]
        expect(isEqualList(a, a)).toBe(true)
    })
    it('returns true for arrays with same elements', () => {
        expect(isEqualList([1, 2, 3], [1, 2, 3])).toBe(true)
    })
    it('returns false for different lengths', () => {
        expect(isEqualList([1, 2], [1, 2, 3])).toBe(false)
    })
    it('returns false when an arg is missing', () => {
        expect(isEqualList(null, [1])).toBe(false)
        expect(isEqualList([1], null)).toBe(false)
    })
})

describe('isList', () => {
    it('returns true for arrays', () => {
        expect(isList([])).toBe(true)
    })
    it('returns false for non-arrays', () => {
        expect(isList({})).toBe(false)
        expect(isList(null)).toBe(false)
    })
})

describe('isInListAny', () => {
    it('isInListAny accepts multiple needles', () => {
        expect(isInListAny([1, 2, 3], 9, 2)).toBe(true)
        expect(isInListAny([1, 2, 3], 8, 9)).toBe(false)
    })
})

describe('toList / toListValuesTotal', () => {
    it('wraps non-array values', () => {
        expect(toList('x')).toEqual(['x'])
        expect(toList([1, 2])).toEqual([1, 2])
    })
    it('cleans falsy values when clean=true', () => {
        expect(toList([1, 0, '', null, 2], true)).toEqual([1, 2])
    })
    it('sums values using the default key', () => {
        expect(toListValuesTotal([{ value: 1 }, { value: 2 }])).toBe(3)
    })
    it('sums values using a custom key', () => {
        expect(toListValuesTotal([{ count: 1 }, { count: 2 }], 'count')).toBe(3)
    })
})

describe('last', () => {
    it('last returns the last element', () => {
        expect(last([1, 2, 3])).toBe(3)
    })
})

describe('sortAscending / sortDescending / by', () => {
    it('sortAscending sorts numbers ascending', () => {
        expect([3, 1, 2].sort(sortAscending)).toEqual([1, 2, 3])
    })
    it('sortDescending sorts numbers descending', () => {
        expect([1, 3, 2].sort(sortDescending)).toEqual([3, 2, 1])
    })
    it('by supports descending prefix', () => {
        const arr = [{ a: 1 }, { a: 3 }, { a: 2 }]
        expect(arr.sort(by('-a'))).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }])
    })
    it('by supports dot paths', () => {
        const arr = [{ a: { b: 1 } }, { a: { b: 3 } }, { a: { b: 2 } }]
        expect(arr.sort(by('a.b'))).toEqual([{ a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 3 } }])
    })
    it('by chains multiple sort keys', () => {
        const arr = [{ a: 1, b: 'z' }, { a: 1, b: 'a' }, { a: 0, b: 'm' }]
        expect(arr.sort(by('a', 'b'))).toEqual([
            { a: 0, b: 'm' },
            { a: 1, b: 'a' },
            { a: 1, b: 'z' },
        ])
    })
    it('by supports a custom comparator function', () => {
        const arr = [3, 1, 2]
        expect(arr.sort(by((a, b) => a - b))).toEqual([1, 2, 3])
    })
})

describe('lodash re-exports', () => {
    it('toFlatList flattens one level', () => {
        expect(toFlatList([1, [2, 3], [4]])).toEqual([1, 2, 3, 4])
    })
})
