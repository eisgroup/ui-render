import {
    hasListValue,
    isCollection,
    isEqualList,
    isList,
    isInList,
    isInListAny,
    isInCollection,
    toList,
    toListValuesTotal,
    toUniqueList,
    toUniqueListFast,
    toUniqueListCaseInsensitive,
    toUniqueListByKey,
    prependToList,
    mergeLists,
    removeFromList,
    firstListValue,
    first,
    last,
    randomFromList,
    listToMap,
    sortAscending,
    sortDescending,
    sort,
    by,
    shuffle,
    toFlatList,
    min,
    max,
    difference,
    intersection,
    unionWith,
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

describe('isInList / isInListAny / isInCollection', () => {
    it('isInList finds a value', () => {
        expect(isInList([1, 2, 3], 2)).toBe(true)
        expect(isInList([1, 2, 3], 9)).toBe(false)
    })
    it('isInListAny accepts multiple needles', () => {
        expect(isInListAny([1, 2, 3], 9, 2)).toBe(true)
        expect(isInListAny([1, 2, 3], 8, 9)).toBe(false)
    })
    it('isInCollection matches partial objects', () => {
        const collection = [{ a: 1, b: 2 }, { a: 3 }]
        expect(isInCollection(collection, { a: 1 })).toBe(true)
        expect(isInCollection(collection, { a: 99 })).toBe(false)
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

describe('uniqueness helpers', () => {
    it('toUniqueList preserves first occurrence including objects', () => {
        expect(toUniqueList([1, 2, 2, { a: 1 }, { a: 1 }])).toEqual([1, 2, { a: 1 }])
    })
    it('toUniqueListFast dedupes primitives', () => {
        expect(toUniqueListFast([1, 1, 2, 3, 3])).toEqual([1, 2, 3])
    })
    it('toUniqueListCaseInsensitive dedupes case-insensitively', () => {
        expect(toUniqueListCaseInsensitive(['A', 'a', 'B'])).toEqual(['A', 'B'])
    })
    it('toUniqueListByKey unions by key', () => {
        const out = toUniqueListByKey([{ id: 1, v: 'new' }], [{ id: 1, v: 'old' }, { id: 2 }], 'id')
        expect(out).toEqual([{ id: 1, v: 'new' }, { id: 2 }])
    })
})

describe('prependToList', () => {
    it('prepends a value', () => {
        expect(prependToList([2, 3], 1)).toEqual([1, 2, 3])
    })
    it('trims to the given limit', () => {
        expect(prependToList([2, 3, 4], 1, 2)).toEqual([1, 2])
    })
})

describe('mergeLists / removeFromList', () => {
    it('mergeLists unions arrays', () => {
        expect(mergeLists([1, 2], [2, 3], [4])).toEqual([1, 2, 3, 4])
    })
    it('removeFromList removes a single value', () => {
        expect(removeFromList([1, 2, 3], 2)).toEqual([1, 3])
    })
    it('removeFromList removes all values from an array', () => {
        expect(removeFromList([1, 2, 3, 4], [2, 4])).toEqual([1, 3])
    })
})

describe('firstListValue / first / last', () => {
    it('firstListValue returns array element or original', () => {
        expect(firstListValue([1, 2])).toBe(1)
        expect(firstListValue('x')).toBe('x')
    })
    it('first returns first element', () => {
        expect(first([1, 2, 3])).toBe(1)
    })
    it('last returns the last element', () => {
        expect(last([1, 2, 3])).toBe(3)
    })
})

describe('randomFromList', () => {
    it('returns an element from the array', () => {
        const arr = ['a', 'b', 'c']
        expect(arr).toContain(randomFromList(arr))
    })
})

describe('listToMap', () => {
    it('reduces an array of {id} objects into a map', () => {
        const out = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }].reduce(listToMap, {})
        expect(out).toEqual({ a: { id: 'a', v: 1 }, b: { id: 'b', v: 2 } })
    })
})

describe('sortAscending / sortDescending / sort / by', () => {
    it('sortAscending sorts numbers ascending', () => {
        expect([3, 1, 2].sort(sortAscending)).toEqual([1, 2, 3])
    })
    it('sortDescending sorts numbers descending', () => {
        expect([1, 3, 2].sort(sortDescending)).toEqual([3, 2, 1])
    })
    it('sort by key ascending', () => {
        const arr = [{ x: 3 }, { x: 1 }, { x: 2 }]
        expect(arr.sort(sort('x'))).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }])
    })
    it('sort by key descending', () => {
        const arr = [{ x: 1 }, { x: 3 }, { x: 2 }]
        expect(arr.sort(sort('x', 'desc'))).toEqual([{ x: 3 }, { x: 2 }, { x: 1 }])
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

describe('shuffle', () => {
    it('returns a permutation of the input', () => {
        const out = shuffle([1, 2, 3, 4, 5])
        expect([...out].sort(sortAscending)).toEqual([1, 2, 3, 4, 5])
    })
})

describe('lodash re-exports', () => {
    it('min / max work', () => {
        expect(min([3, 1, 2])).toBe(1)
        expect(max([3, 1, 2])).toBe(3)
    })
    it('difference / intersection', () => {
        expect(difference([1, 2, 3], [2])).toEqual([1, 3])
        expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
    })
    it('toFlatList flattens one level', () => {
        expect(toFlatList([1, [2, 3], [4]])).toEqual([1, 2, 3, 4])
    })
    it('unionWith uses a comparator', () => {
        const eq = (a, b) => a.id === b.id
        expect(unionWith([{ id: 1 }], [{ id: 1 }, { id: 2 }], eq)).toEqual([{ id: 1 }, { id: 2 }])
    })
})
