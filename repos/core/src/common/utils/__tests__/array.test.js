import {
  by,
  colorScaleDistinct,
  hasCommonListValue,
  hasListValue,
  intersection,
  isEqualList,
  isInCollectionAny,
  isInList,
  isInListAny,
  isList,
  mergeLists,
  prependToList,
  removeFromList,
  shuffle,
  toListAvg,
  toListTotal,
  toListValuesTotal,
  toUniqueList,
  toUniqueListFast
} from '../array'
import { cloneDeep } from '../object'

const NON_ARRAY_VALUES = [
  100,
  1.1,
  0.0,
  1e10,
  1e-10,
  Infinity,
  -Infinity,
  NaN,
  'foo',
  '',
  {},
  null,
  undefined
]

it(`intersection() does not mutate original list, and keeps first list's order`, () => {
  const list = [1, 2, 3, 4, 5]
  const listClone = cloneDeep(list)
  const list2 = [5, 3]
  expect(intersection(list, list2)).toEqual([3, 5])
  expect(list).toEqual(listClone)
})

it(`${isEqualList.name}() returns true when elements inside the list are the same`, () => {
  let a = []
  let b = a
  expect(isEqualList(a, b)).toBe(true)
  b.push(1)
  expect(isEqualList(a, b)).toBe(true)
  b = [...a]
  expect(isEqualList(a, b)).toBe(true)
  a = [null]
  expect(isEqualList(a, b)).toBe(false)
  b = [null]
  expect(isEqualList(a, b)).toBe(true)
})

it(`${isInCollectionAny.name}() returns true when include match found for any element`, () => {
  expect(isInCollectionAny([{name: 'god', age: 'eternal'}], {name: 'dog'}, {name: 'god'})).toBe(true)
  expect(isInCollectionAny([{name: 'god', age: 'eternal'}], {name: 'dog'}, {name: 'goddess'})).toBe(false)
  expect(isInCollectionAny({entity: {name: 'god', age: 'eternal'}}, {name: 'dog'}, {name: 'god'})).toBe(true)
  expect(isInCollectionAny({name: 'god', age: 'eternal'}, {name: 'dog'}, {name: 'god'})).toBe(false)
  expect(isInCollectionAny({name: 'god', age: 'eternal'}, [undefined])).toBe(false)
})

it(`${toListAvg.name}() computes correct average number of values provided`, () => {
  expect(toListAvg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual(5.5)
})

it(`${toListTotal.name}() computes correct total number of values provided`, () => {
  expect(toListTotal([1, 2, 3, 0])).toEqual(6)
  expect(toListTotal(undefined)).toEqual(0)
  expect(toListTotal([])).toEqual(0)
  expect(toListTotal('')).toEqual(0)
  // expect(toListTotal(null)).toEqual(0)
  // expect(toListTotal(NaN)).toEqual(0)
})

it(`${toListValuesTotal.name}() computes correct total number of values provided`, () => {
  expect(toListValuesTotal([{value: 1}, {value: 2}, {value: 0}])).toEqual(3)
  expect(toListValuesTotal([{count: 1}, {count: 2}, {count: 0}], 'count')).toEqual(3)
  expect(toListValuesTotal(undefined)).toEqual(0)
  expect(toListValuesTotal([])).toEqual(0)
  expect(toListValuesTotal('')).toEqual(0)
  // expect(toListTotal(null)).toEqual(0)
  // expect(toListTotal(NaN)).toEqual(0)
})

it(`${colorScaleDistinct.name}() computes color orders correctly`, () => {
  let colors = [0, 1, 2, 3, 4, 5]
  let hues

  hues = 2  // 3 whole groups
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 3, 1, 4, 2, 5])

  hues = 3  // 2 whole groups
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 2, 4, 1, 3, 5])

  hues = 4  // not enough groups to re-order
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 1, 2, 3, 4, 5])

  colors = [0, 1, 2, 3, 4, 5, 6]
  hues = 2  // 3 groups + 1 extra color
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 4, 1, 5, 2, 6, 3])

  colors = [0, 1, 2, 3, 4, 5, 6]
  hues = 3  // 2 groups + 1 extra color
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 3, 6, 1, 4, 6, 2])

  colors = [0, 1, 2, 3, 4, 5, 6, 7]
  hues = 3  // 2 groups + 2 extra color
  expect(colorScaleDistinct(colors, hues)).toEqual([0, 3, 6, 1, 4, 7, 2, 5])
})

it(`${shuffle.name}() randomizes list value orders`, () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
  const listClone = cloneDeep(list)
  const result = shuffle(list)
  expect(list).not.toEqual(listClone)
  expect(list.length).toEqual(listClone.length)
  expect(result).toEqual(list)
})

describe(`${hasListValue.name}()`, () => {
  it('Returns true when an array with at least one item is supplied', () => {
    expect(hasListValue([1])).toEqual(true)
  })

  it('Returns false when an empty array is supplied', () => {
    expect(hasListValue([])).toEqual(false)
  })

  describe('Returns false for non-array values', () => {
    NON_ARRAY_VALUES.forEach((value) => {
      it(`[${typeof value}] ${value}`, () => {
        expect(hasListValue(value)).toBe(false)
      })
    })
  })
})

describe(`${hasCommonListValue.name}()`, () => {
  it('returns true when at least one common value is found in all arrays', () => {
    expect(hasCommonListValue([1, 2, 3, 4, 5], [1])).toEqual(true)
    expect(hasCommonListValue([1, 2, 3, 4, 5], [1], [1, 2, 4])).toEqual(true)
    expect(hasCommonListValue([1, 2, 3, 4, 'id'], [1, 3], [2, 3, 4])).toEqual(true)
    expect(hasCommonListValue([1, 2, null, 4, 'id'], [1, 3], [2, 3, 4])).toEqual(false)
    expect(hasCommonListValue([4, 'id'], [1, 3])).toEqual(false)
  })
})

describe(`${isList.name}()`, () => {
  it('Returns true for an empty array', () => {
    expect(isList([])).toEqual(true)
  })

  it('Returns true for a non-empty array', () => {
    expect(isList([1, 2, 3])).toEqual(true)
  })

  describe('Returns false for non-array values', () => {
    NON_ARRAY_VALUES.forEach((value) => {
      it(`[${typeof value}] ${value}`, () => {
        expect(isList(value)).toBe(false)
      })
    })
  })
})

describe(`${isInList.name}()`, () => {
  it('Returns true when match found', () => {
    expect(isInList([1, 2, 3], 2)).toEqual(true)
    expect(isInList([1, 2, 3], 'id')).toEqual(false)
    expect(isInList([1, 2, 'id', 3], 'id')).toEqual(true)
  })
  it('Returns false for an empty array', () => {
    expect(isInList([], '')).toEqual(false)
    expect(isInList([], null)).toEqual(false)
  })
  // Disable this for performance reasons
  // describe('Returns false for non-array values', () => {
  //   NON_ARRAY_VALUES.forEach((value) => {
  //     it(`[${typeof value}] ${value}`, () => {
  //       expect(isInList(value, '')).toBe(false)
  //     })
  //   })
  // })
})

describe(`${isInListAny.name}()`, () => {
  it('Returns true when match found', () => {
    expect(isInListAny([1, 2, 3], 2, 1)).toEqual(true)
    expect(isInListAny([1, 2, 3], 'id', 9)).toEqual(false)
    expect(isInListAny([1, 2, 'id', 3], null, 'id')).toEqual(true)
    expect(isInListAny([1, 2, 'id', 3], 'id')).toEqual(true)
  })
  it('Returns false for an empty array', () => {
    expect(isInListAny([], '')).toEqual(false)
    expect(isInListAny([], null)).toEqual(false)
    expect(isInListAny([], null, 0)).toEqual(false)
  })
  // Disable this for performance reasons
  // describe('Returns false for non-array values', () => {
  //   NON_ARRAY_VALUES.forEach((value) => {
  //     it(`[${typeof value}] ${value}`, () => {
  //       expect(isInListAny(value, '')).toBe(false)
  //     })
  //   })
  // })
})

describe(`${prependToList.name}()`, () => {
  it('Adds value to the beginning of array', () => {
    expect(prependToList([7], 1)).toEqual([1, 7])
  })
  it('Trims the list down when limit provided', () => {
    expect(prependToList([7, 7, 7, 7, 7], 1, 2)).toEqual([1, 7])
  })
})

describe(`${mergeLists.name}()`, () => {
  it('merges multiple lists in one unique list', () => {
    expect(mergeLists([1, 2, 3, 'id'], [1, 3, 4, 'id'])).toEqual([1, 2, 3, 'id', 4])
  })
  it(`'does not remove falsey values, like: 0, '', NaN, undefined, null'`, () => {
    expect(mergeLists([0, '', NaN, undefined, null])).toEqual([0, '', NaN, undefined, null])
  })
})

describe(`${removeFromList.name}()`, () => {
  it('Removes primitive value from array as expected, without mutation', () => {
    const list = [1, 'id']
    const listClone = cloneDeep(list)
    expect(removeFromList(list, 1)).toEqual(['id'])
    expect(list).toEqual(listClone)
  })
  it('Removes values of one array from another, without mutation', () => {
    const list = [1, 7, 'id']
    const listClone = cloneDeep(list)
    expect(removeFromList(list, [1, 'id'])).toEqual([7])
    expect(list).toEqual(listClone)
  })
})

describe(`${toUniqueList.name}()`, () => {
  it('keeps only unique values', () => {
    expect(toUniqueList(['id', 'id', 2, 2, [], [], {}, {}])).toEqual(['id', 2, [], {}])
  })
  it(`'does not remove falsey values, like: 0, '', NaN, undefined, null'`, () => {
    expect(toUniqueList([0, '', NaN, undefined, null])).toEqual([0, '', NaN, undefined, null])
  })
})

describe(`${toUniqueListFast.name}()`, () => {
  it('keeps only unique primitive values', () => {
    expect(toUniqueListFast(['id', 'id', 2, 2, [], [], {}, {}])).toEqual(['id', 2, [], [], {}, {}])
    expect(toUniqueListFast([
      '5ae9ba3ea1de6c7ecf6eacce',
      '5aab0ee727cc2b15ebb25767',
      '5aab0ee727cc2b15ebb25767'
    ])).toEqual(['5ae9ba3ea1de6c7ecf6eacce', '5aab0ee727cc2b15ebb25767'])
  })
  it(`'does not remove falsey values, like: 0, '', undefined, null', except 'NaN'`, () => {
    expect(toUniqueListFast([0, '', NaN, undefined, null])).toEqual([0, '', undefined, null])
  })
})

describe(`${by.name}()`, () => {
  const i1 = {name: 'a', rank: 1, age: '27', user: {id: 1}}  // 1
  const i2 = {name: 'a', rank: 1, age: '28', user: {id: 2}}  // 1
  const i3 = {name: 'a', rank: 2, age: '27', user: {id: 3}}  // 0.5
  const i4 = {name: 'ben', rank: 1, age: '27', user: {id: 4}}  // 3
  const i5 = {name: 'cool', rank: 1, age: '27', user: {id: 5}}  // 4
  const list = [i4, i2, i5, i3, i1]
  const descending = (a, b) => {
    if ((a.name.length / a.rank) > (b.name.length / b.rank)) return -1
    if ((a.name.length / a.rank) < (b.name.length / b.rank)) return 1
    return 0
  }

  it(`sorts list ascending using String Key (with chaining)`, () => {
    expect(cloneDeep(list).sort(by('name'))).toEqual([i2, i3, i1, i4, i5])
    expect(cloneDeep(list).sort(by('name', 'rank'))).toEqual([i2, i1, i3, i4, i5])
    expect(cloneDeep(list).sort(by('name', 'rank', 'age'))).toEqual([i1, i2, i3, i4, i5])
  })
  it(`sorts list descending using String Key (with chaining)`, () => {
    expect(cloneDeep(list).sort(by('-name'))).toEqual([i5, i4, i2, i3, i1])
    expect(cloneDeep(list).sort(by('-name', '-rank'))).toEqual([i5, i4, i3, i2, i1])
    expect(cloneDeep(list).sort(by('-name', '-rank', '-age'))).toEqual([i5, i4, i3, i2, i1])
  })
  it(`sorts list ascending with descending combination using String Key`, () => {
    expect(cloneDeep(list).sort(by('-name', 'rank'))).toEqual([i5, i4, i2, i1, i3])
    expect(cloneDeep(list).sort(by('-name', 'rank', '-age'))).toEqual([i5, i4, i2, i1, i3])
    expect(cloneDeep(list).sort(by('-name', 'rank', 'age'))).toEqual([i5, i4, i1, i2, i3])
    expect(cloneDeep(list).sort(by('name', '-rank'))).toEqual([i3, i2, i1, i4, i5])
    expect(cloneDeep(list).sort(by('name', '-rank', '-age'))).toEqual([i3, i2, i1, i4, i5])
    expect(cloneDeep(list).sort(by('name', '-rank', 'age'))).toEqual([i3, i1, i2, i4, i5])
  })
  it(`sorts list using String Path`, () => {
    expect(cloneDeep(list).sort(by('user.id'))).toEqual([i1, i2, i3, i4, i5])
    expect(cloneDeep(list).sort(by('-user.id'))).toEqual([i5, i4, i3, i2, i1])
  })
  it(`sorts list using Function`, () => {
    expect(cloneDeep(list).sort(by(descending))).toEqual([i5, i4, i2, i1, i3])
  })
  it(`sorts list using Function, String Key and Path combination`, () => {
    expect(cloneDeep(list).sort(by(descending, 'age'))).toEqual([i5, i4, i1, i2, i3])
    expect(cloneDeep(list).sort(by('name', descending))).toEqual([i2, i1, i3, i4, i5])
    expect(cloneDeep(list).sort(by('name', descending, 'user.id'))).toEqual([i1, i2, i3, i4, i5])
    expect(cloneDeep(list).sort(by('name', descending, 'age'))).toEqual([i1, i2, i3, i4, i5])
  })
  it(`sorts list of objects with numbered strings`, () => {
    const i1 = {name: 'C_1'}
    const i2 = {name: 'C_2'}
    const i9 = {name: 'C_9'}
    const i10 = {name: 'C_10'}
    const i11 = {name: 'C_11'}
    const i20 = {name: 'C_20'}
    const i21 = {name: 'C_21'}
    const i101 = {name: 'C_101'}
    const list = [i20, i10, i21, i101, i1, i11, i2, i9]
    const expected = [i1, i2, i9, i10, i11, i20, i21, i101]
    expect(list.sort(by('name.length', 'name'))).toEqual(expected)
    expect(list.sort(by('-name.length', '-name'))).toEqual(expected.reverse())
  })
})
