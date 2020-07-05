import { rgbToColor3, toRgbaColor } from '../color'

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

test(`${rgbToColor3.name}() converts correct RGB color array to Scaled Color3 array`, () => {
  expect(rgbToColor3([255, 0, 125])).toEqual([1, 0, 0.490196])
  expect(rgbToColor3([0, 125, 255], 2)).toEqual([0, 0.49, 1])
})
