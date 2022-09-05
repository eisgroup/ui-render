import { createAction } from 'redux-actions'
import { delay, race, take } from 'redux-saga/effects'
import {
  ALL_ACTIONS,
  ALL_RESULTS,
  CANCEL,
  ERROR,
  isInCollection,
  isInList,
  isInListAny,
  RECEIVED,
  RESULT_SEPARATOR,
  SEPARATOR,
  SUCCESS,
  TIMEOUT,
  VOID
} from 'ui-utils-pack'
import { STATE_ACTION_TIMEOUT } from '../variables/configs'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

/**
 * State Action Creator.
 *
 * @example
 *   Valid usage options:
 *   >>> stateAction('SOMETHING', 'GET', 'FINISH', { foo: 'bar' }, { type: 1 })
 *   >>> stateAction('SOMETHING', 'GET', { foo: 'bar' }, { type: 1 })
 *   >>> stateAction('SOMETHING', 'FINISH', { foo: 'bar' }, { type: 1 })
 *   >>> stateAction('SOMETHING', { foo: 'bar' }, { type: 1 })
 *   >>> stateAction('SOMETHING', { foo: 'bar' })
 *   >>> stateAction('SOMETHING')
 *
 * @param {String} TYPE - action type to dispatch
 * @param {String|Null|Object} [ACTION] - optional, one of ALL_ACTIONS, if not provided, second argument can be @payload
 * @param {String|Null|Object} [RESULT] - optional, one of ALL_RESULTS, if not provided, third argument can be @payload
 * @param {Object|Null} [payload] - optional, action.payload
 * @param {Object} [meta] - optional meta data, action.meta
 * @return {Object} Flux Standard Action
 */
export function stateAction (TYPE, ACTION, RESULT, payload = {}, meta = {}) {
  const hasAction = isInList(ALL_ACTIONS, ACTION)
  const hasResult = isInListAny(ALL_RESULTS, ACTION, RESULT)

  // Case 1: All arguments provided
  let finalACTION = ACTION
  let finalRESULT = RESULT
  let finalPayload = payload
  let finalMeta = meta

  // Case 2: ACTION provided, but RESULT not provided
  // make 3nd argument payload and 4rd argument meta
  if (hasAction && !hasResult) {
    finalRESULT = null
    finalPayload = RESULT
    finalMeta = payload
  }

  // Case 3: ACTION not provided, but RESULT provided
  // make 3rd argument payload and 4rd argument meta
  if (!hasAction && hasResult) {
    finalACTION = null
    finalRESULT = ACTION
    finalPayload = RESULT
    finalMeta = payload
  }

  // Case 4: ACTION and RESULT not provided
  // make 2nd argument payload and 3rd argument meta
  if (!hasAction && !hasResult) {
    finalACTION = null
    finalRESULT = null
    finalPayload = ACTION
    finalMeta = RESULT
  }

  return createAction(stateActionType(TYPE, finalACTION, finalRESULT), null, () => (finalMeta || {}))(finalPayload)
}

/**
 * ACTION TYPE CREATORS --------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * State Action Type Creator.
 *
 * @example
 *   stateActionType(FUN, GET, START);
 *   >>> String: 'FUN -> GET_START'
 *
 * @param {string} NAME - action type identifier
 * @param {string|null} ACTION - optional, action type name suffix, if not provided, 2nd argument can be @RESULT
 * @param {string|null} RESULT - optional, action type name result suffix
 * @return {string} action type
 */
export function stateActionType (NAME, ACTION = null, RESULT = null) {
  return NAME +
    (ACTION ? SEPARATOR + ACTION : '') +
    ((!ACTION && RESULT) ? SEPARATOR + RESULT : '') +
    ((ACTION && RESULT) ? RESULT_SEPARATOR + RESULT : '')
}

/**
 * Multiple State Action Types Creator
 *
 * @param {Array} NAMES - list of action type identifiers
 * @param {string|null} ACTION - optional, action type name suffix, if not provided, 2nd argument can be @RESULT
 * @param {string|null} RESULT - optional, action type name result suffix
 * @return {Array} - list of action types
 */
export function stateActionNamesType (NAMES, ACTION = null, RESULT = null) {
  return NAMES.reduce((list, NAME) => list.concat(stateActionType(NAME, ACTION, RESULT)), [])
}

/**
 * ACTION HELPERS --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Subscribe to All State Action results
 *
 * @example
 *    const {payload = {}, meta = {}} = yield call(subscribeToResults, GOD, GET, meta, contractActionType)
 *    if (meta.result === SUCCESS) return payload
 *
 * @param {string} NAME - action type identifier
 * @param {string} ACTION - state action method type
 * @param {object} [meta] - meta data to match (with include comparison)
 * @param {function} [actionType] - action type creator, default is stateActionType()
 * @param {boolean} [hasTimeout] - whether to timeout automatically
 * @return {object} - action with payload and meta data (payload may not exist on TIMEOUT/VOID results)
 */
export function * subscribeToResults (NAME, ACTION, meta = null, actionType = stateActionType, hasTimeout = true) {
  /* Match specific action with given meta data */
  if (meta) {
    const listener = race({
      received: take(action => isMatchingActionType(action, NAME, ACTION, null, meta, actionType)),
      success: take(action => isMatchingActionType(action, NAME, ACTION, SUCCESS, meta, actionType)),
      error: take(action => isMatchingActionType(action, NAME, ACTION, ERROR, meta, actionType)),
      cancel: take(action => isMatchingActionType(action, NAME, ACTION, CANCEL, meta, actionType)),
      timeout: take(action => isMatchingActionType(action, NAME, ACTION, TIMEOUT, meta, actionType)),
      ...hasTimeout && {void: delay(STATE_ACTION_TIMEOUT + 100)}  // in case State action was not called
    })
    let {received, success, error, cancel, timeout} = yield listener

    if (received) {
      received.meta.result = RECEIVED
      return received
    }

    if (success) {
      success.meta.result = SUCCESS
      return success
    }

    if (error) {
      error.meta.result = ERROR
      return error
    }

    if (cancel) {
      cancel.meta.result = CANCEL
      return cancel
    }

    if (timeout) {
      timeout.meta.result = TIMEOUT
      return timeout
    }

    return {meta: {result: VOID}}
  }
}

/**
 * Check if Action is a Matching State Action Type with given Result and Meta data
 * (for subscribing to the exact stateAction).
 *
 * @param {object} action - Flux Standard Action to check against
 * @param {string} NAME - action type identifier
 * @param {string} ACTION - state action method type
 * @param {string} RESULT - state action response type
 * @param {Object} meta - meta data to match (with include comparison)
 * @param {Function} actionType - action type creator, default is stateActionType()
 * @return {bool} - true if it's a matching State Action
 */
export function isMatchingActionType (action, NAME, ACTION, RESULT, meta, actionType) {
  return action.type === actionType(NAME, ACTION, RESULT) && isInCollection([action.meta], meta)
}

export const errorPattern = new RegExp(`(?:[^a-zA-Z0-9])(${ERROR})$`)

export function isError (action) {
  return errorPattern.test(action.type)
}

/* Extract ACTION constant from Action Type */
export function actionFromType (type) {
  return type.split(RESULT_SEPARATOR)[0].split(SEPARATOR).pop()
}
