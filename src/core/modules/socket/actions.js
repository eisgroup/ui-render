import { stringify } from 'querystring'
import { __DEV__, Active, isInList, MESSAGE, RESULT_SEPARATOR, warn } from 'ui-utils-pack'
import { cryptoSign, cryptoSignVerify } from 'ui-utils-pack/crypto'
import { SECRET } from '../variables'
import { SOCKET_CALL, SOCKET_RESULTS } from './constants'

// =============================================================================
// OUTGOING ACTION CREATORS
// =============================================================================

/**
 * Socket Action Creator
 *
 * @example:
 *  - Send Message (and Open Socket if given new meta.params)
 *    store.dispatch(socketAction('wss://example.com', {event: 'question', channel: 'God'}))
 *    >>> 'wss://example.com -> CONNECTED'
 *    >>> 'wss://example.com -> MESSAGE'
 *        Object: {answer: 'You are the universe experiencing itself'}
 *
 *  - Close Socket Connection with given Params
 *    store.dispatch(socketAction('wss://example.com', CLOSE, {params: {event: 'question', channel: 'God'}}))
 *    >>> 'wss://example.com -> DISCONNECTED'
 *
 *  - Close All Socket Connections for given Endpoint
 *    store.dispatch(socketAction('wss://example.com', CLOSE))
 *    >>> 'wss://example.com -> DISCONNECTED'
 *    >>> 'wss://example.com -> DISCONNECTED'
 *
 * @param {string} ENDPOINT - to send message to
 * @param {Object|string} payload - request data or one of SOCKET_ACTIONS
 * @param {Object} [meta] - request meta data
 * @returns {Object} - Socket Action (to be consumed by socket middleware).
 */
export function socketAction (ENDPOINT, payload = {}, meta = {}) {
  return {
    [SOCKET_CALL]: {
      type: ENDPOINT,
      payload,
      meta: {
        socket: ENDPOINT,
        ...meta
      }
    }
  }
}

/**
 * Create Socket Action with HMAC signed payload and signature
 *
 * @Note: use isSigned() to verify payload of this function
 *
 * @param {string} ENDPOINT - to send message to
 * @param {Object|string} action - request data to sign (example: stateAction() object)
 * @param {Object} [meta] - request meta data
 * @param {string} [secret] - key used to sign action
 * @returns {Object} - Socket Action (to be consumed by socket middleware)
 *    with message being {action, signature}
 */
export function socketActionSigned (ENDPOINT, action = {}, meta = {}, secret = SECRET) {
  return {
    [SOCKET_CALL]: {
      type: ENDPOINT,
      payload: signPayload(action, secret),
      meta: {
        socket: ENDPOINT,
        ...meta
      }
    }
  }
}

/**
 * Socket Action Type Creator
 * (for subscribing to Socket streams)
 *
 * @param {string} ENDPOINT - socket URL
 * @param {string} [RESULT] - one of SOCKET_RESULTS
 * @returns {string} - socket action type
 */
export function socketActionType (ENDPOINT, RESULT = MESSAGE) {
  if (__DEV__) {
    if (RESULT && !isInList(SOCKET_RESULTS, RESULT)) {
      warn(new TypeError(`${socketActionType.name}() 'RESULT' must be one of ${SOCKET_RESULTS}, but got ${RESULT}`))
    }
  }

  return ENDPOINT + (RESULT ? RESULT_SEPARATOR + RESULT : '')
}

/**
 * Sign given Action with Secret key
 *
 * @param {Object} action - Flux Standard Action
 * @param {String} secret - key
 * @return {Object} payload - with given action and signed signature
 */
export function signPayload (action, secret = SECRET) {
  return {action, signature: cryptoSign(stringify(action), secret), id: Active.SERVICE, start: Date.now()}
}

/**
 * Verify if given Payload (from socketActionSigned()) is signed with valid Secret key
 *
 * @param {Object} payload - {action, signature} to verify
 * @param {String} [secret] - key used to verify signature
 * @return {Boolean} true - if action was signed with valid signature
 */
export function isSigned (payload, secret = SECRET) {
  const {action, signature} = payload || {}
  return cryptoSignVerify(signature, stringify(action), secret)
}

// =============================================================================
// INCOMING ACTION CREATORS
// =============================================================================

/**
 * Socket Response Action Creator
 *
 * @param {string} type - original Socket Call action type
 * @param {Object} [meta] - meta data of original Socket Call action
 * @param {string} RESULT - one of SOCKET_RESULTS
 * @param {*} payload - decoded socket response message or event
 * @return {Object} - Flux Standard Action
 */
export function createAction ({type, meta}, RESULT, payload) {
  const request = {end: Date.now()}
  if (payload.start) {
    request.start = payload.start
    request.latency = request.end - request.start
  }
  return {
    type: type + (RESULT ? RESULT_SEPARATOR + RESULT : ''),
    payload,
    meta: {...meta, result: RESULT, request}
  }
}
