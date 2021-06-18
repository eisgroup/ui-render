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
  const timeCharCount = Id.padCount
  const id = Id()
  const limit = Math.pow(64, timeCharCount) // the limit of timestamp

  test(`${Id.name}() generates auto incrementing ID string using Timestamp`, () => {
    expect(id.length).toBeGreaterThanOrEqual(Id.padCount + 3)
    expect(Id({timestamp: 0}).substring(0, timeCharCount)).toEqual('-------')
    expect(Id({timestamp: 1}).substring(0, timeCharCount)).toEqual('------0')
    expect(Id({timestamp: 11}).substring(0, timeCharCount)).toEqual('------A')
    expect(Id({timestamp: 36}).substring(0, timeCharCount)).toEqual('------Z')
    expect(Id({timestamp: 37}).substring(0, timeCharCount)).toEqual('------_')
    expect(Id({timestamp: 38}).substring(0, timeCharCount)).toEqual('------a')
    expect(Id({timestamp: 63}).substring(0, timeCharCount)).toEqual('------z')
    expect(Id({timestamp: 64}).substring(0, timeCharCount)).toEqual('-----0-')
    expect(Id({timestamp: 65}).substring(0, timeCharCount)).toEqual('-----00')
    expect(Id({timestamp: limit - 1}).substring(0, timeCharCount)).toEqual('zzzzzzz')
    expect(Id({timestamp: limit}).substring(0, timeCharCount + 1)).toEqual('0-------')
  })

  test(`${Id.name}() string generated sorts chronologically`, () => {
    const id1 = Id()
    const now = Date.now()
    const id2 = Id({timestamp: now + ONE_SECOND})
    const id3 = Id({timestamp: now + ONE_MINUTE})
    const id4 = Id({timestamp: now + ONE_HOUR})
    const id5 = Id({timestamp: now + ONE_WEEK})
    const id6 = Id({timestamp: now + ONE_MONTH})
    const id7 = Id({timestamp: now + ONE_YEAR})
    const id8 = Id({timestamp: now + 10 * ONE_YEAR})
    const id9 = Id({timestamp: now + 20 * ONE_YEAR})
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
  const list = Array(testCount).fill(true).map(() => Id())
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
    expect(timestampFromId('-------God')).toEqual(0)
    expect(timestampFromId('----------God')).toEqual(0)
    expect(timestampFromId('------_god')).toEqual(37)
    expect(timestampFromId('-----0-Sex')).toEqual(64)
    expect(timestampFromId('-----00Sex')).toEqual(65)
    expect(timestampFromId('zzzzzzzL0L')).toEqual(limit - 1)
    expect(timestampFromId('0-------abs')).toEqual(limit)
  })

  test(`${timestampFromId.name}() throws error for invalid Id string`, () => {
    expect(() => timestampFromId('-------$God')).toThrow()
    expect(() => timestampFromId('-----0.Sex')).toThrow()
    expect(() => timestampFromId('~zzzzzzzL0L')).toThrow()
    expect(() => timestampFromId('0---~----abs')).toThrow()
  })
})
