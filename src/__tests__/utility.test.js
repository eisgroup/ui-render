import { ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_WEEK, ONE_YEAR } from 'utils-pack'
import { distanceBetween, Id, timestampFromId } from '../utility'

test(`${distanceBetween.name}() returns correct distance between two points in millimeters`, () => {
  const point1 = {lat: 40.714, lng: -74.00599999999997}
  const point2 = {lat: 48.857, lng: 2.3519999999999754}
  const distance = 5843670761.836855 // using google.maps.geometry.spherical.computeDistanceBetween
  expect(distanceBetween(point1, point2)).toEqual(distance)
})

describe(`${Id.name}() and ${timestampFromId.name}()`, () => {
  const timeCharCount = Id.padCount
  const id = Id()
  const limit = Math.pow(64, timeCharCount) // the limit of timestamp

  test(`${Id.name}() generates auto incrementing ID string using Timestamp`, () => {
    // let count = 333
    // const result = []
    // while (count > 0) {
    //   count--
    //   result.push(Id())
    // }
    // console.log(result)
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
    expect(id1 > id).toBe(true)
    expect(id2 > id1).toBe(true)
    expect(id3 > id2).toBe(true)
    expect(id4 > id3).toBe(true)
    expect(id5 > id4).toBe(true)
    expect(id6 > id5).toBe(true)
    expect(id7 > id6).toBe(true)
    expect(id8 > id7).toBe(true)
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
