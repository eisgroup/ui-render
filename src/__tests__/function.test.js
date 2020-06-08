import { isAsync, isFunction } from '../function'

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

test(`${isFunction.name}() returns true for normal, async and generator functions`, () => {
  NON_FUNCTION_VALUES.forEach(val => {
    expect(isFunction(val)).toBe(false)
  })
  expect(isFunction(() => {})).toBe(true)
  expect(isFunction(async () => {})).toBe(true)
  expect(isFunction(function * () {})).toBe(true)
})

test(`${isAsync.name}() returns true for async functions only`, () => {
  expect(isAsync(() => {})).toBe(false)
  expect(isAsync(async () => {})).toBe(true)
  expect(isAsync(function * () {})).toBe(false)
})
