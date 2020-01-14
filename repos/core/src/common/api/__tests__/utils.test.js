import { GET, SUCCESS } from '../../constants'
import { cloneDeep } from '../../utils'
import { API_TEST_URL } from '../../variables'
import { apiActionType } from '../actions'
import { isMatchingApiActionType } from '../utils'

it(`${isMatchingApiActionType.name}() works`, () => {
  const meta = {id: 7, type: 'test', params: {limit: 2, type: 'SELL'}}
  const action = {
    type: apiActionType(API_TEST_URL, GET, SUCCESS),
    payload: {},
    meta: cloneDeep(meta)
  }
  expect(isMatchingApiActionType(action, API_TEST_URL, GET, SUCCESS, meta)).toBe(true)
  action.meta.params = {limit: 2, type: 'BUY'}
  expect(isMatchingApiActionType(action, API_TEST_URL, GET, SUCCESS, meta)).toBe(false)
  action.meta.params = {limit: 2, type: 'SELL'}
  expect(isMatchingApiActionType(action, API_TEST_URL, GET, SUCCESS, meta)).toBe(true)
})
