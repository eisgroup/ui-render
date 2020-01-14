import { distanceBetween, toRgbaColor } from '../utility'

it(`${distanceBetween.name}() returns correct distance between two points in millimeters`, () => {
  const point1 = {lat: 40.714, lng: -74.00599999999997}
  const point2 = {lat: 48.857, lng: 2.3519999999999754}
  const distance = 5843670761.836855 // using google.maps.geometry.spherical.computeDistanceBetween
  expect(distanceBetween(point1, point2)).toEqual(distance)
})

describe(`${toRgbaColor.name}()`, () => {
  it('sanitizes given value to correct format and type', () => {
    expect(toRgbaColor('0,0,0')).toEqual([0, 0, 0])
    expect(toRgbaColor('0,0,0,0')).toEqual([0, 0, 0, 0])
    expect(toRgbaColor('0,  0, 0,1 ')).toEqual([0, 0, 0, 1])
    expect(toRgbaColor('255,255,255,0')).toEqual([255, 255, 255, 0])
    expect(toRgbaColor('255,255,255,1')).toEqual([255, 255, 255, 1])
    expect(toRgbaColor([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    expect(toRgbaColor([255, 255, 255, 1])).toEqual([255, 255, 255, 1])
  })
  it('validates color code correctly', () => {
    expect(toRgbaColor('-1,0,0')).toEqual(false)
    expect(toRgbaColor([-1, 0, 0])).toEqual(false)
    expect(toRgbaColor([0, -1, 0])).toEqual(false)
    expect(toRgbaColor([0, 0, -1])).toEqual(false)
    expect(toRgbaColor([0, 0, 0, -1])).toEqual(false)
    expect(toRgbaColor([256, 0, 0, 0])).toEqual(false)
    expect(toRgbaColor([0, 256, 0, 0])).toEqual(false)
    expect(toRgbaColor([0, 0, 256, 0])).toEqual(false)
    expect(toRgbaColor([0, 0, 0, 1.1])).toEqual(false)
    expect(toRgbaColor('{0, 0, 0, 1}')).toEqual(false)
  })
})
