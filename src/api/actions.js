import { stateActionType } from 'modules-pack/redux/actions'
import {
  __DEV__,
  CREATE,
  DELETE,
  ERROR,
  GET,
  ID,
  interpolateString,
  isInList,
  LIST,
  performStorage,
  REQUEST,
  RESULT_SEPARATOR,
  SEPARATOR,
  SET,
  swapKeyWithValue,
  UPDATE,
  warn
} from 'utils-pack'
import { API_ACTIONS, API_CALL, API_RESULTS, NAME, NETWORK, STORAGE_KEY_TOKEN } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

/**
 * API Fetch Action Creator.
 *
 * @param {string} URL - API url to request, can have `{id}` placeholder
 *  -> If `id` attribute provided in payload without placeholder, it is appended to endpoint with preceding slash.
 * @param {string} [ACTION = GET] - request action, one of the API_ACTIONS constants
 * @param {object} [payload] - optional, request options
 *  -> payload.params will be converted to query string parameters
 *  -> payload.body will be JSON stringified automatically if necessary
 *  -> Example: {id: 7, params: {limit: 3}} - id `7` will be added to request endpoint, and limit response to `3` results
 * @param {Object} [meta] - optional, request meta data
 *  -> meta.url object will be used for endpoint string interpolation with matching `{key}` placeholders
 *  -> Example: {url: {'{currency}': BTC} } - endpoint `api.com/exchange/{currency}` will turn to `api.com/exchange/BTC`
 *  -> Example: {authenticate: true, callError: false} - request with token, and do not dispatch Error action
 * @returns {Object} - with [API_CALL} key as Flux Standard Action (to be consumed by apiMiddleware).
 */
export function apiAction (URL, ACTION = GET, payload = {}, meta = {}) {
  if (!URL) throw Error(`${this.name}() expects URL argument, got ${URL}`)

  // Add ID to the url if ID is provided (.replace() will clone the string)
  let url = URL
  if (payload && payload.id) url = URL.includes(ID) ? URL.replace(ID, payload.id) : `${URL}/${payload.id}`

  // Check and Interpolate url string if necessary
  url = interpolateString(url, meta.url, {formatKey: '{key}', name: URL})

  return {
    [API_CALL]: {
      type: apiActionType(URL, ACTION),  // -> if `type` is undefined, ensure apiMiddleware is registered in store
      payload: {url, ...payload},
      meta: {
        method: crudToFetch[ACTION],  // -> will be overridden if `method` is provided explicitly
        ...meta
      }
    }
  }
}

/**
 * API Fetch Action Creator for Tests.
 * Wraps API_CALL action dispatch inside Promise to test in Jest.
 * (to be dispatched with store created using `redux-mock-store` library)
 *
 * @example
 * ```
 * return store.dispatch(apiActionTest(API_TEST_URL, GET, null, { authenticate: false }))
 *  .then(() => {
 *    const calledActions = store.getActions();
 *    expect(calledActions.length).toBe(2);
 *    expect(calledActions[0].type).toEqual(apiActionType(API_TEST_URL, GET, REQUEST));
 *    expect(calledActions[1].type).toEqual(apiActionType(API_TEST_URL, GET, SUCCESS));
 *  });
 * ```
 *
 * @params - same as apiAction() method
 * @returns {function(*)} - function that takes `dispatch` as argument and returns resolved Promise
 */
export function apiActionTest (URL, ACTION, payload = {}, meta = {}) {
  return (dispatch) => {
    dispatch(apiAction(URL, ACTION, payload, meta))

    // Delay assertion to allow result action to be dispatched
    return new Promise((resolve) => {
      setTimeout(resolve, 1)  // 1 ms is enough
    })
  }
}

/**
 * API Fetch Action Type Creator.
 *
 * @param {string} URL - API url to request, can have `{id}` placeholder/s for string interpolation
 * @param {string} ACTION - request action, one of the API_ACTIONS constants
 * @param {string|null} RESULT - request result, one of the API_RESULTS constants
 * @returns {string} - API action type
 */
export function apiActionType (URL, ACTION = GET, RESULT = null) {
  if (__DEV__) {
    if (ACTION && !isInList(API_ACTIONS, ACTION)) {
      warn(new TypeError(`${NAME} action must be one of ${API_ACTIONS}`))
    }

    if (RESULT && !isInList(API_RESULTS, RESULT)) {
      warn(new TypeError(`${NAME} result must be one of ${API_RESULTS}`))
    }
  }

  return URL + SEPARATOR + ACTION + (RESULT ? RESULT_SEPARATOR + RESULT : '')
}

/**
 * Multiple API request Action Types Creator.
 * (For Async Tasks - Sagas to Subscribe to)
 *
 * @NOTE:
 * See documentation for apiActionType() method
 *
 * @param {String} URL - API request URL to subscribe to
 * @param {Array} ACTIONS - list of request actions to subscribe to (i.e. [GET, CREATE, LIST, DELETE])
 * @param {String} [RESULT] - the same result for given actions (i.e. SUCCESS)
 * @returns {Array} - list of different API action types with the same result
 */
export function apiActionsType (URL, ACTIONS, RESULT = null) {
  const typeList = []

  ACTIONS.forEach(ACTION => {
    typeList.push(apiActionType(URL, ACTION, RESULT))
  })

  return typeList
}

/**
 * Multiple API request Action Type Results Creator.
 * (For Async Tasks - Sagas to Subscribe to)
 *
 * @NOTE:
 * See documentation for apiActionType() method
 *
 * @param {string} URL - API request URL to subscribe to
 * @param {String} ACTION - request action to subscribe to (i.e. GET)
 * @param {Array} [RESULTS] - list of request results for given action (i.e. [SUCCESS, ERROR, TIMEOUT, CANCEL])
 * @returns {Array} - list of the same API action with different results
 */
export function apiActionResultsType (URL, ACTION, RESULTS = API_RESULTS) {
  const resultList = [stateActionType(NETWORK, ERROR)]  // Catch NETWORK ERROR use case by default

  RESULTS.forEach(RESULT => {
    if (RESULT !== REQUEST) resultList.push(apiActionType(URL, ACTION, RESULT))
  })

  return resultList
}

/**
 * Multiple API URLs request Action Type Creator.
 * (For Async Tasks - Sagas to Subscribe to)
 *
 * @NOTE:
 *  - FASTER than having individual subscriptions
 *  - See documentation for apiActionType() method
 *
 * @example:
 takeEvery(apiActionTypeURLList([
 API_INFO,
 API_TICKERS,
 API_ORDERS,
 ], GET, SUCCESS), tradeUpdate)
 *
 * @param {Array} URLS - list of different API request URLs to subscribe to
 * @param {String} ACTION -  request action to subscribe to (i.e. GET)
 * @param {String} [RESULT] - request result for given action (i.e. SUCCESS)
 * @returns {Array} - list of different API action types with the same result
 */
export function apiActionURLsType (URLS, ACTION, RESULT = null) {
  const typeList = []

  URLS.forEach(URL => {
    typeList.push(apiActionType(URL, ACTION, RESULT))
  })

  return typeList
}

/**
 * API Standard Flux Action Creator
 */
export function createAction ({type, payload, meta}, RESULT) {
  return {
    type: type + (RESULT ? RESULT_SEPARATOR + RESULT : ''),
    payload,
    meta: {
      ...meta,
      result: RESULT
    }
  }
}

/**
 * API Helper Class to Perform Token Storage
 */
export default class Api {
  static storeToken (token) {
    if (!token) throw new Error(`${NAME} expects token, got ${token}`)
    return performStorage(SET, STORAGE_KEY_TOKEN, token)
  }

  static getToken () {
    return performStorage(GET, STORAGE_KEY_TOKEN)
  }

  static clearToken () {
    return performStorage(DELETE, STORAGE_KEY_TOKEN)
  }
}

/**
 * Convert API CRUD ACTION to RESTFul Request Method.
 *
 * @Rationale:
 * encapsulate away the RESTFul implementation,
 * because the API can be GraphQL or something else.
 */
export const crudToFetch = {
  [LIST]: 'GET',
  [GET]: 'GET',
  [CREATE]: 'POST',
  [UPDATE]: 'PATCH',
  [DELETE]: 'DELETE',
}
export const fetchToCrud = swapKeyWithValue(crudToFetch)
