import { __DEV__, Active } from './_envs.js'
import { isList } from './array.js'
import { fromJSON, toJSON } from './codec.js'
import { ADD, DELETE, GET, SET } from './constants.js'
import { enumCheck } from './function.js'
import { log } from './log.js'
import { update } from './object.js'

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
 * @setup (for backend):
 *   if (!Active.Storage) {
 *     Active.Storage = require('node-persist')
 *     performStorage.init() // initiate local storage as async method to avoid blocking concurrent processes
 *   }
 * @example:
 *    performStorage(SET, 'token', 'Wait_for_it___Legendary_Genius')
 *
 * @NOTE:
 *  AsyncStorage takes 5 milliseconds delay on average for each storage operation, and can add up.
 *  Store in state instead, for non-persistent data, because it is much faster and synchronous.
 *
 * @param {string} ACTION - one of GET, SET, DELETE or ADD
 * @param {string} storageKey - stored value's key identifier
 * @param {*} value - value to store
 * @param {Array|Object} initialValue - used for ADD ACTION when saving the first time
 * @return {*} - Synchronous/Asynchronous promise result of Local Storage (or stored value for GET action)
 */
export function performStorage (ACTION, storageKey, value = null, initialValue = []) {
  /* ADD action abstraction */
  if (ACTION === ADD) {
    if (performStorage.isAsync) {
      return performStorage(GET, storageKey)
        .then(value => value || initialValue)
        .then(oldData => performStorage(SET, storageKey, isList(oldData) ? oldData.concat(value) : update(oldData, value)))
    }
    const oldData = performStorage(GET, storageKey) || initialValue
    return performStorage(SET, storageKey, isList(oldData) ? oldData.concat(value) : update(oldData, value))
  }

  /* SERVER (or missing localStorage) */
  if (!hasLocalStorage) return Active.Storage[performStorage.toServer[ACTION]](storageKey, value)

  /* CLIENT */
  enumCheck([GET, SET, DELETE], ACTION, this)
  const args = [storageKey]
  if (value != null) args.push(toJSON(value))
  let result = localStorage[performStorage.toClient[ACTION]](...args)

  // Storage Retrieval
  if (GET === ACTION && result) result = fromJSON(result)  // Deserialize data

  if (!__DEV__) return result

  // Development Logging
  log(`STORAGE -> ${ACTION}: ${storageKey} as:`, `color: teal`, result || value)
  return result
}

performStorage.toClient = {
  [GET]: 'getItem',
  [SET]: 'setItem',
  [DELETE]: 'removeItem'
}
performStorage.toServer = {
  [GET]: 'getItem',
  [SET]: 'setItem',
  [DELETE]: 'removeItem'
}
performStorage.toServerSync = {
  [GET]: 'getItemSync',
  [SET]: 'setItemSync',
  [DELETE]: 'removeItemSync'
}
// Setup Asynchronous Local Storage
performStorage.init = function (...args) {
  performStorage.isAsync = true
  return Active.Storage.init(...args)
}
// Setup Synchronous Local Storage (not recommended)
performStorage.initSync = function (...args) {
  performStorage.toServer = performStorage.toServerSync
  return Active.Storage.initSync(...args)
}

