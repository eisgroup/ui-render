import {
  Active,
  CLOSE,
  CONNECTED,
  DISCONNECTED,
  ERROR,
  formatNumber,
  isFunction,
  isInCollection,
  MESSAGE,
  TEN_SECONDS,
  TIMEOUT
} from 'ui-utils-pack'
import { stateAction } from '../redux/actions'
import { call, delay, put, race, spawn, take } from '../saga/utils'
import { URL } from '../variables'
import { socketAction, socketActionSigned, socketActionType } from './actions'
import { CONNECT_TIMEOUT } from './constants'

// =============================================================================
// SAGA HELPER FUNCTIONS
// =============================================================================

/**
 * Subscribe to Socket response from given Endpoint containing specific Payload message and Meta data
 *
 * @param {string} ENDPOINT - socket URL
 * @param {Object} payload - socket response message to match
 * @param {Object} [meta] - data to match
 * @return {Object} action - with Socket payload message (if exists) and meta data
 */
export function * subscribeToSocketMessage (ENDPOINT, payload, meta) {
  // Match specific action with payload and meta data
  const listener = race({
    message: take(action => isMatchingSocketPayloadActionType(action, ENDPOINT, MESSAGE, payload, meta)),
    error: take(action => isMatchingSocketActionType(action, ENDPOINT, ERROR, meta)),
    disconnected: take(action => isMatchingSocketActionType(action, ENDPOINT, DISCONNECTED, meta)),
    timeout: delay(CONNECT_TIMEOUT)
  })

  let response = yield listener
  return response.message || response.error || response.disconnected || {meta: {result: TIMEOUT}}  // Return action

}

/**
 * Subscribe to Socket Response Results from given Endpoint containing specific Meta data
 *
 * @param {string} ENDPOINT - socket URL
 * @param {Object} [meta] - data to match
 * @return {Object} action - with Socket payload message (if exists) and meta data
 */
export function * subscribeToSocketResults (ENDPOINT, meta) {
  // Match specific action with meta data
  const listener = race({
    success: take(action => isMatchingSocketActionType(action, ENDPOINT, MESSAGE, meta)),
    error: take(action => isMatchingSocketActionType(action, ENDPOINT, ERROR, meta)),
    disconnected: take(action => isMatchingSocketActionType(action, ENDPOINT, DISCONNECTED, meta)),
    timeout: delay(CONNECT_TIMEOUT)
  })

  let response = yield listener
  return response.success || response.error || response.disconnected || {meta: {result: TIMEOUT}}  // Return action
}

/**
 * Check if Action is a Matching Socket Action Type with Specified Result and Meta Data
 * (for subscribing to the exact apiAction).
 *
 * @param {object} action - Flux Standard Action to check against
 * @param {string} ENDPOINT - socket URL
 * @param {string} RESULT - socket response type
 * @param {Object} meta - API meta data to match (with include comparison)
 * @return {bool} - true if it's a matching socket Action
 */
export function isMatchingSocketActionType (action, ENDPOINT, RESULT, meta) {
  return (
    action.type === socketActionType(ENDPOINT, RESULT) &&
    isInCollection([action.meta], meta)
  )
}

/**
 * Check if Action is a Matching Socket Action Type with Specified Result, Payload and Meta Data
 * (for subscribing to the exact socketAction).
 *
 * @param {object} action - Flux Standard Action to check against
 * @param {string} ENDPOINT - socket URL
 * @param {string} RESULT - socket response type
 * @param {Object} payload - socket response message to match (with include comparison)
 * @param {Object} meta - socket meta data to match (with include comparison)
 * @return {bool} - true if it's a matching socket Action
 */
export function isMatchingSocketPayloadActionType (action, ENDPOINT, RESULT, payload, meta) {
  return (
    action.type === socketActionType(ENDPOINT, RESULT) &&
    isInCollection([action.payload], payload) &&
    isInCollection([action.meta], meta)
  )
}

/**
 * Persist Connection to Socket Server
 *
 * @param {String} clientId - unique identifier for connecting socket client
 * @param {String} [endpoint] - socket URL to connect to, default is SOCKET_SERVER
 * @param {Function} [callback] - function to call on successful connection, will receives all arguments
 * @param {Function} [args] - arguments to pass to 'callback' function
 */
export function * socketConnect (clientId = Active.SERVICE, endpoint = URL.SOCKET_SERVER, callback = null, ...args) {
  const payload = {clientId}
  yield put(socketActionSigned(endpoint, stateAction(clientId, CONNECTED, null, payload)))

  /* Wait for confirmation Message */
  const {meta: {result} = {}} = yield call(subscribeToSocketMessage, endpoint, payload)

  /* Retry until Connected */
  if (result !== MESSAGE) {
    yield delay(TEN_SECONDS)  // throttle retries
    socketConnect.attempts += 1

    // Close Socket after Max Tries because Retrying closed Socket does not work
    if (socketConnect.attempts > socketConnect.maxAttempts) {
      yield put(socketAction(endpoint, CLOSE))
      socketConnect.attempts = 1
    }

    // Reconnect
    const attemptCount = formatNumber(socketConnect.attempts, {ordinal: true})
    console.warn(`✋  ${endpoint} not connected, retrying ▶ ${socketConnect.name}() ${attemptCount} time...`)
    return yield spawn(socketConnect, clientId, endpoint, callback, ...args)
  }

  /* Successful Connection */
  socketConnect.attempts = 0
  console.log(`⚡  ${clientId} connected to socket ${endpoint}`)
  if (isFunction(callback)) yield spawn(callback, clientId, endpoint, ...args)

  /* Watch for Disconnection and Reconnect */
  yield take(action => isMatchingSocketActionType(action, endpoint, DISCONNECTED))
  return yield spawn(socketConnect, clientId, endpoint, callback, ...args)
}

socketConnect.attempts = 0
socketConnect.maxAttempts = 7
