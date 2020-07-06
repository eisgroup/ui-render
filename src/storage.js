import { __DEV__, Active } from './_envs'
import { isList } from './array'
import { fromJSON, toJSON } from './codec'
import { ADD, DELETE, GET, SET } from './constants'
import { enumCheck } from './function'
import { log } from './log'
import { update } from './object'

/**
 * STORAGE FUNCTIONS ===========================================================
 * =============================================================================
 */

const hasLocalStorage = typeof localStorage !== 'undefined'  // eslint-disable-line

/**
 * Closure Function to Store Data in Memory (RAM)
 *
 * @param {Object|Array = Object} [initValue] - initialized value
 * @return {function(ACTION, key, value)} - to store or retrieve data in memory
 */
export function memoryCache (initValue = {}) {
  return function memoryCache (ACTION, key, value) {
    if (ACTION === GET) return initValue[key]  // eslint-disable-line
    if (ACTION === SET) return initValue[key] = value  // eslint-disable-line
    if (ACTION === DELETE) return delete initValue[key]  // eslint-disable-line
  }
}

/**
 * Perform fastest possible cache in RAM
 *
 * @param {string} ACTION - one of GET, SET, or DELETE
 * @param {string} key - stored value's key identifier
 * @param {*} value - value to store
 */
export function performCache (ACTION, key, value) {
  if (ACTION === GET) return performCache.cache[key]  // eslint-disable-line
  if (ACTION === SET) return performCache.cache[key] = value  // eslint-disable-line
  if (ACTION === DELETE) return delete performCache.cache[key]  // eslint-disable-line
}
performCache.cache = {}

/**
 * Perform localStorage (for the Web), node-persist (for Node.js) or AsyncStorage (for React Native)
 *
 * @example:
 performStorage(SET, 'token', 'Wait_for_it___Legendary_Genius')
 *
 * @NOTE:
 *  AsyncStorage takes 5 milliseconds delay on average for each storage operation, and can add up.
 *  Store in state instead, for non-persistent data, because it is much faster and synchronous.
 *
 * @param {string} ACTION - one of GET, SET, DELETE or ADD
 * @param {string} storageKey - stored value's key identifier
 * @param {*} value - value to store
 * @param {Array|Object} initialValue - used for ADD ACTION when saving the first time
 * @return {*} - Local or AsyncStorage promise result or stored value for GET action
 */
export function performStorage (ACTION, storageKey, value = null, initialValue = []) {
  /* ADD action abstraction */
  if (ACTION === ADD) {
    const oldData = performStorage(GET, storageKey) || initialValue
    return performStorage(SET, storageKey, isList(oldData) ? oldData.concat(value) : update(oldData, value))
  }

  /* SERVER (or missing localStorage) */
  if (!hasLocalStorage) return Active.Storage[performStorage.toServerAction[ACTION]](storageKey, value)

  /* CLIENT */
  enumCheck([GET, SET, DELETE], ACTION, this)
  const args = [storageKey]
  if (value != null) args.push(toJSON(value))
  let result = localStorage[performStorage.toClientAction[ACTION]](...args)

  // Storage Retrieval
  if (GET === ACTION && result) result = fromJSON(result)  // Deserialize data

  if (!__DEV__) return result

  // Development Logging
  log(`STORAGE -> ${ACTION}: ${storageKey} as:`, `color: teal`, result || value)
  return result
}
performStorage.toClientAction = {
  [GET]: 'getItem',
  [SET]: 'setItem',
  [DELETE]: 'removeItem'
}
performStorage.toServerAction = {
  [GET]: 'getItemSync',
  [SET]: 'setItemSync',
  [DELETE]: 'removeItemSync'
}

