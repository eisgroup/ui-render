import { __DEV__, Active } from './_envs.js'
import { isList } from './array.js'
import { fromJSON, toJSON } from './codec.js'
import { ADD, DELETE, GET, SET } from './constants.js'
import { enumCheck } from './function.js'
import { update } from './object.js'

/**
 * STORAGE FUNCTIONS ===========================================================
 * =============================================================================
 */

const hasLocalStorage = typeof localStorage !== 'undefined'  // eslint-disable-line

/**
 * Perform localStorage (for the Web)
 *
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

