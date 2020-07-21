import { call, delay, put, race, select, take } from 'redux-saga/effects'
import { stateAction } from '../../actions'
import { ERROR, SUCCESS, TIMEOUT, VOID } from '../../constants'
import { hasListValue, hasObjectValue, isInCollection, toUpperCase } from '../../utils'
import { apiAction, apiActionResultsType, apiActionType, fetchToCrud } from '../actions'
import { CLEAR_ACTIONS_PENDING_NETWORK, HTTP_401_UNAUTHORIZED, NETWORK, REQUEST_TIMEOUT, } from '../constants'
import { actionsPendingNetwork } from '../selectors'

/**
 * ASYNC TASK HELPERS ==========================================================
 * =============================================================================
 */

/* Resume API Actions Pending Valid State */
export function * resumeActionsPending (type) {
  /**
   * @param {string} type - one of AUTH, LOCATION, or NETWORK;
   */
  let actionsSelector
  let CLEAR_ACTION

  switch (type) {
    // case AUTH:
    //   actionsSelector = actionsPendingAuth
    //   CLEAR_ACTION = CLEAR_ACTIONS_PENDING_AUTH
    //   break
    //
    // case LOCATION:
    //   actionsSelector = actionsPendingLocation
    //   CLEAR_ACTION = CLEAR_ACTIONS_PENDING_LOCATION
    //   break

    case NETWORK:
      actionsSelector = actionsPendingNetwork
      CLEAR_ACTION = CLEAR_ACTIONS_PENDING_NETWORK
      break

    default:
      return
  }

  const actionsPending = yield select(actionsSelector)

  if (hasListValue(actionsPending)) {
    for (const action of actionsPending) {
      // Dispatch each pending action
      yield put(action)
    }

    // Clear all actions from state to prevent recursive loop (must be called last)
    yield put(stateAction(CLEAR_ACTION))
  }
}

/**
 * Subscribe to all API Request results
 * (optionally resubscribe once on HTTP 401 response)
 *
 * @example
 const {payload = {}, meta: {result} = {}} = yield call(subscribeToApiActionResults, URL, GET, meta)
 if (result === SUCCESS) return payload
 *
 * @return {Object} - action with payload and meta data (payload may not exist on TIMEOUT/VOID results)
 */
export function * subscribeToApiResults (URL, ACTION, meta = null, resubscribe = false) {
  /* Match specific action with given meta data */
  if (hasObjectValue(meta)) {
    const listener = race({
      success: take(action => isMatchingApiActionType(action, URL, ACTION, SUCCESS, meta)),
      error: take(action => isMatchingApiActionType(action, URL, ACTION, ERROR, meta)),
      timeout: take(action => isMatchingApiActionType(action, URL, ACTION, TIMEOUT, meta)),
      void: delay(REQUEST_TIMEOUT + 100)  // in case API request was not called
    })
    let response = yield listener

    // Ignore the first HTTP 401 Unauthorised Response to retry with Token Refresh flow
    if (resubscribe && response.error) {
      const {error: {payload: {status} = {}} = {}} = response
      if (status === HTTP_401_UNAUTHORIZED) response = yield listener  // Re-subscribe
    }

    return response.success || response.error || response.timeout || {meta: {result: VOID}}  // Return action
  }  // eslint-disable-line

  /* Match generic action */
  else {
    const listener = race({
      action: take(apiActionResultsType(URL, ACTION)),
      void: delay(REQUEST_TIMEOUT + 100)  // in case API request was not called
    })
    let response = yield listener

    // Ignore the first HTTP 401 Unauthorised Response to retry with Token Refresh flow
    if (resubscribe && response.action) {
      const {payload: {status} = {}, meta: {result} = {}} = response.action
      if (result === ERROR && status === HTTP_401_UNAUTHORIZED) response = yield listener  // Re-subscribe
    }

    return response.action || {meta: {result: VOID}}  // Return action
  }
}

/**
 * Async Fetch Request Task that always resolves with predictable result
 * @example:
 *    const {payload = {}, meta: {result} = {}} = await runTask(fetchFlow, {url, payload: {params: {q: 'query'}}})
 *
 * @returns {IterableIterator<*>} {payload = {}, meta: {result} = {}} - result can be one of API_RESULTS, or VOID
 */
export function * fetchFlow ({url, payload, method = 'GET', meta: {headers, ...meta}}) {
  const ACTION = fetchToCrud[toUpperCase(method)]
  // noinspection JSCheckFunctionSignatures
  yield put(apiAction(url, ACTION, payload, {headers, ...meta}))
  return yield call(subscribeToApiResults, url, ACTION, meta)
}

/**
 * Check if Action is of API Action Type with Matching Result
 *
 * @param {object} action - Flux Standard Action to check
 * @param {string} RESULT - API request response type
 * @return {bool} - true if it is an API Action
 */
export function isApiActionType (action, RESULT = SUCCESS) {
  const {type, meta = {}} = action
  return (meta.result === RESULT) && (/^http/i.test(type))
}

export function isApiActionTypeSuccess (action) {
  return isApiActionType(action, SUCCESS)
}

export function isApiActionTypeTimeout (action) {
  return isApiActionType(action, TIMEOUT)
}

export function isApiActionTypeError (action) {
  return isApiActionType(action, ERROR)
}

/**
 * Check if Action is a Matching API Action Type with given Result and Meta data
 * (for subscribing to the exact apiAction).
 *
 * @param {object} action - Flux Standard Action to check against
 * @param {string} URL - API request URL
 * @param {string} ACTION - API request method type
 * @param {string} RESULT - API request response type
 * @param {Object} meta - API meta data to match (with include comparison)
 * @return {bool} - true if it's a matching API Action
 */
export function isMatchingApiActionType (action, URL, ACTION, RESULT, meta) {
  return action.type === apiActionType(URL, ACTION, RESULT) && isInCollection([action.meta], meta)
}
