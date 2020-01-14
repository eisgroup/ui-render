import { ADD, DELETE, GET, SET } from '../../constants'
import { __CLIENT__ } from '../../variables'
import { memoryCache, performStorage, } from '../storage'

it(`${memoryCache.name}() stores and retrieves values correctly`, () => {
  const user = memoryCache()
  expect(user(SET, 'id', 7)).toEqual(7)
  expect(user(SET, 'id2', 13)).toEqual(13)
  expect(user(GET, 'id')).toEqual(7)
  expect(user(GET, 'id2')).toEqual(13)
  expect(user(GET, 'id3')).toEqual(undefined)
})

describe(`${performStorage.name}()`, () => {
  const storageKeyObj = 'testObj'
  const storageKeyObjNew = 'testObjNew'
  const storageKeyArray = 'testArray'
  const storageKeyArrayNew = 'testArrayNew'
  const obj = {id: 7}
  const objAdd = {name: 'God'}
  const array = [7]
  const arrayAdd = [111]
  const arrayAddValue = 111
  const nil = __CLIENT__ ? null : undefined
  it(`${SET} updates and ${GET} retrieves storage correctly for Object`, () => {
    performStorage(SET, storageKeyObj, obj)
    expect(performStorage(GET, storageKeyObj)).toEqual(obj)
  })
  it(`${DELETE} removes storage, so ${GET} returns undefined for Node.js (null for browser)`, () => {
    performStorage(SET, storageKeyObj, obj)
    expect(performStorage(GET, storageKeyObj)).toEqual(obj)
    performStorage(DELETE, storageKeyObj)
    expect(performStorage(GET, storageKeyObj)).toBe(nil)
  })
  it(`${ADD} updates storage correctly for new Object`, () => {
    performStorage(DELETE, storageKeyObjNew)
    performStorage(ADD, storageKeyObjNew, objAdd, {})
    expect(performStorage(GET, storageKeyObjNew)).toEqual(objAdd)
  })
  it(`${ADD} updates storage correctly for existing Object`, () => {
    performStorage(SET, storageKeyObj, obj)
    performStorage(ADD, storageKeyObj, objAdd)
    expect(performStorage(GET, storageKeyObj)).toEqual({...obj, ...objAdd})
  })
  it(`${ADD} updates storage correctly for new Array`, () => {
    performStorage(DELETE, storageKeyArrayNew)
    performStorage(ADD, storageKeyArrayNew, arrayAdd, [])
    expect(performStorage(GET, storageKeyArrayNew)).toEqual(arrayAdd)
  })
  it(`${ADD} updates storage correctly for existing Array`, () => {
    performStorage(SET, storageKeyArray, array)
    performStorage(ADD, storageKeyArray, arrayAddValue)
    expect(performStorage(GET, storageKeyArray)).toEqual([...array, arrayAddValue])
  })
})
