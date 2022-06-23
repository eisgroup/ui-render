import {
  cloneDeep,
  hasDuplicateInList,
  isId,
  isTruthy,
  ONE_HOUR,
  ONE_MINUTE,
  ONE_MONTH,
  ONE_SECOND,
  ONE_WEEK,
  ONE_YEAR
} from 'utils-pack'
import { distanceBetween, Id, timestampFromId } from '../utility'

const NON_TRUTHY_VALUES = [
  false,
  undefined,
  null,
  NaN,
  0,
  0.0,
  -0,
  +0,
  -0.0,
  +0.0,
  '',
  {},
  [],
]
const TRUTHY_VALUES = [
  true,
  1,
  -1,
  +1,
  1.1,
  100,
  10n,
  1e7,
  1e-7,
  Infinity,
  -Infinity,
  '0',
  '0.0',
  '-0',
  '+0',
  '-0.0',
  '+0.0',
  '0.0b',
  '1',
  '1.1',
  '1a',
  'foo',
  ['0'],
  ['1'],
  {0: 0},
  [0],
  () => {},
  new Date(),
]
const ALL_VALUE_TYPES = [
  undefined,
  null,
  NaN,
  0,
  -0,
  +0,
  0.0,
  -0.0,
  +0.0,
  1,
  -1,
  +1,
  1.1,
  100,
  10n,
  1e7,
  1e-7,
  Infinity,
  -Infinity,
  '',
  '0',
  '0.0',
  '0.0b',
  '1',
  '1.1',
  '1a',
  'foo',
  [],
  [0],
  {},
  {0: 0},
  () => {},
  new Date(),
]

describe(`${isTruthy.name}() returns false for all non truthy values, true otherwise`, () => {
  NON_TRUTHY_VALUES.forEach((value) => {
    test(`[${typeof value}] ${value}`, () => {
      expect(isTruthy(value)).toBe(false)
    })
  })

  TRUTHY_VALUES.forEach((value) => {
    test(`[${typeof value}] ${value}`, () => {
      expect(isTruthy(value)).toBe(true)
    })
  })
})

test(`${distanceBetween.name}() returns correct distance between two points in millimeters`, () => {
  const point1 = {lat: 40.714, lng: -74.00599999999997}
  const point2 = {lat: 48.857, lng: 2.3519999999999754}
  const distance = 5843670761.836855 // using google.maps.geometry.spherical.computeDistanceBetween
  expect(distanceBetween(point1, point2)).toEqual(distance)
})

describe(`${Id.name}(), ${isId.name}(), and ${timestampFromId.name}()`, () => {
  const padCount = 7
  const args = {caseSensitive: true, padCount}
  const id = Id(args)
  const limit = Math.pow(Id.alphabet.length, padCount) // the limit of timestamp

  test(`${Id.name}() generates auto incrementing ID string using Timestamp`, () => {
    expect(id.length).toBeGreaterThanOrEqual(padCount + 3)
    expect(Id({timestamp: 0, ...args}).substring(0, padCount)).toEqual('0000000')
    expect(Id({timestamp: 1, ...args}).substring(0, padCount)).toEqual('0000001')
    expect(Id({timestamp: 10, ...args}).substring(0, padCount)).toEqual('000000A')
    expect(Id({timestamp: 35, ...args}).substring(0, padCount)).toEqual('000000Z')
    expect(Id({timestamp: 36, ...args}).substring(0, padCount)).toEqual('000000a')
    expect(Id({timestamp: 61, ...args}).substring(0, padCount)).toEqual('000000z')
    expect(Id({timestamp: 62, ...args}).substring(0, padCount)).toEqual('0000010')
    expect(Id({timestamp: 63, ...args}).substring(0, padCount)).toEqual('0000011')
    expect(Id({timestamp: limit - 1, ...args}).substring(0, padCount)).toEqual('zzzzzzz')
    expect(Id({timestamp: limit, ...args}).substring(0, padCount + 1)).toEqual('10000000')
  })

  test(`${Id.name}() string generated sorts chronologically`, () => {
    const id1 = Id(args)
    const now = Date.now()
    const id2 = Id({timestamp: now + ONE_SECOND, ...args})
    const id3 = Id({timestamp: now + ONE_MINUTE, ...args})
    const id4 = Id({timestamp: now + ONE_HOUR, ...args})
    const id5 = Id({timestamp: now + ONE_WEEK, ...args})
    const id6 = Id({timestamp: now + ONE_MONTH, ...args})
    const id7 = Id({timestamp: now + ONE_YEAR, ...args})
    const id8 = Id({timestamp: now + 10 * ONE_YEAR, ...args})
    const id9 = Id({timestamp: now + 20 * ONE_YEAR, ...args})
    const list = [id, id1, id2, id3, id4, id5, id6, id7, id8, id9]
    const listSorted = cloneDeep(list)
    listSorted.sort()
    expect(id1 > id).toBe(true)
    expect(id2 > id1).toBe(true)
    expect(id3 > id2).toBe(true)
    expect(id4 > id3).toBe(true)
    expect(id5 > id4).toBe(true)
    expect(id6 > id5).toBe(true)
    expect(id7 > id6).toBe(true)
    expect(id8 > id7).toBe(true)
    expect(id9 > id8).toBe(true)
    expect(list).toEqual(listSorted)
  })

  const testCount = 10000
  const start = Date.now()
  const list = Array(testCount).fill(true).map(() => Id(args))
  const end = Date.now()
  const total = Math.round(testCount / (end - start)).toLocaleString()
  const totalPerSec = (total * 1000).toLocaleString()

  test(`${Id.name}() can generate ${total} Ids per millisecond (${totalPerSec}/s) without duplicate`, () => {
    expect(hasDuplicateInList(list)).toBe(false)
  })

  test(`${isId.name}() returns true for correct string format`, () => {
    expect(isId(Id.alphabet)).toBe(true)
  })

  test(`${isId.name}() returns false for incorrect format`, () => {
    expect(isId(Id.alphabet + '#')).toBe(false)
    expect(isId(Id.alphabet + '!')).toBe(false)
    expect(isId(Id.alphabet + '@')).toBe(false)
    expect(isId(Id.alphabet + '>')).toBe(false)
    expect(isId('<' + Id.alphabet + '>')).toBe(false)
  })

  test(`${isId.name}() returns false for numbers or non-string types`, () => {
    expect(isId(12345567890)).toBe(false)
    expect(isId({})).toBe(false)
    expect(isId([])).toBe(false)
    expect(isId(null)).toBe(false)
    expect(isId(false)).toBe(false)
    expect(isId(undefined)).toBe(false)
    expect(isId(NaN)).toBe(false)
  })

  test(`${timestampFromId.name}() converts Id string to Timestamp in milliseconds`, () => {
    // The last three characters are random string, not used for timestamp
    expect(timestampFromId('0000000God')).toEqual(0)
    expect(timestampFromId('0000000000God')).toEqual(0)
    expect(timestampFromId('000000ZGod')).toEqual(35)
    expect(timestampFromId('0000010Sex')).toEqual(62)
    expect(timestampFromId('0000011Sex')).toEqual(63)
    expect(timestampFromId('zzzzzzzL0L')).toEqual(limit - 1)
    expect(timestampFromId('10000000abs')).toEqual(limit)
  })

  test(`${timestampFromId.name}() throws error for invalid Id string`, () => {
    expect(() => timestampFromId('0000000$God')).toThrow()
    expect(() => timestampFromId('000000.Sex')).toThrow()
    expect(() => timestampFromId('~zzzzzzzL0L')).toThrow()
    expect(() => timestampFromId('0000~0000abs')).toThrow()
  })
})
