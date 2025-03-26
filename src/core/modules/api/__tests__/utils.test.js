import { URL } from 'ui-modules-pack/variables'
import { cloneDeep, GET, SUCCESS } from 'ui-utils-pack'
import { apiActionType } from '../actions'
import { isMatchingApiActionType } from '../utils'

it(`${isMatchingApiActionType.name}() works`, () => {
  const meta = {id: 7, type: 'test', params: {limit: 2, type: 'SELL'}}
  const action = {
    type: apiActionType(URL.API_TEST, GET, SUCCESS),
    payload: {},
    meta: cloneDeep(meta)
  }
  expect(isMatchingApiActionType(action, URL.API_TEST, GET, SUCCESS, meta)).toBe(true)
  action.meta.params = {limit: 2, type: 'BUY'}
  expect(isMatchingApiActionType(action, URL.API_TEST, GET, SUCCESS, meta)).toBe(false)
  action.meta.params = {limit: 2, type: 'SELL'}
  expect(isMatchingApiActionType(action, URL.API_TEST, GET, SUCCESS, meta)).toBe(true)
})
