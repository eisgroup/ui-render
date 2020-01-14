import { isFunction } from '../function'

const NON_OBJECT_VALUES = [
  100,
  NaN,
  null,
  undefined,
  'foo',
  '',
  []
]
const NON_FUNCTION_VALUES = [
  ...NON_OBJECT_VALUES
]

it(`${isFunction.name}() returns true for normal and generator functions`, () => {
  NON_FUNCTION_VALUES.forEach(val => {
    expect(isFunction(val)).toBe(false)
  })
  expect(isFunction(() => {})).toBe(true)
  expect(isFunction(function * () {})).toBe(true)
})
