import { rgbFromColor3, rgbFromHex, rgbToColor3, rgbToHex, toRgbaColor } from '../color'

test(`${rgbToColor3.name}() converts correct RGB color array to Scaled Color3 array`, () => {
  expect(rgbToColor3([255, 0, 125])).toEqual([1, 0, 0.490196])
  expect(rgbToColor3([0, 125, 255], 2)).toEqual([0, 0.49, 1])
})

test(`${rgbFromColor3.name}() converts correct Scaled Color3 array to RGB color`, () => {
  expect(rgbFromColor3([1, 0, 0.490196])).toEqual([255, 0, 125])
  expect(rgbFromColor3([0, 0.49, 1])).toEqual([0, 125, 255])
})

test(`${rgbToHex.name}() converts correct RGB color to Hex string`, () => {
  expect(rgbToHex([0, 51, 255])).toEqual('#0033ff')
  expect(() => rgbToHex(['0', '51', '255'])).toThrow()
  expect(() => rgbToHex('[0, 51, 255]')).toThrow()
  expect(() => rgbToHex('0, 51, 255')).toThrow()
})

test(`${rgbFromHex.name}() converts correct Hex string to RGB color`, () => {
  expect(rgbFromHex('#0033ff')).toEqual([0, 51, 255])
  expect(rgbFromHex('0033ff')).toEqual([0, 51, 255])
  expect(rgbFromHex('')).toBe(null)
  expect(rgbFromHex('#')).toBe(null)
  expect(rgbFromHex('#0033f')).toBe(null)
  expect(rgbFromHex('#0033fp')).toBe(null)
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
