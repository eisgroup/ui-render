import { Active } from './_envs'
import { isList } from './array'
import { fromJSON, toJSON } from './codec'
import { ADD, DELETE, GET, SET } from './constants'
import { enumCheck } from './function'
import { update } from './object'

/**
 * STORAGE FUNCTIONS ===========================================================
 * =============================================================================
 */

/** Every action `performStorage` understands */
export type StorageAction = typeof GET | typeof SET | typeof DELETE | typeof ADD

/** Actions dispatched straight to a storage backend (`ADD` is an abstraction over `GET` + `SET`) */
export type StorageActionDirect = typeof GET | typeof SET | typeof DELETE

/** Mapping of a direct action to the backend method name that performs it */
export type StorageMethods = Record<StorageActionDirect, string>

/**
 * Backend storage adapter injected as `Active.Storage` (async or sync implementation).
 * @note: methods are looked up by name at runtime, hence the index signature.
 */
export type StorageAdapter = Record<string, (...args: unknown[]) => unknown>

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
export function performStorage (
  this: unknown, ACTION: StorageAction, storageKey: string, value: unknown = null, initialValue: unknown = [],
): unknown {
  /* ADD action abstraction */
  if (ACTION === ADD) {
    if (performStorage.isAsync) {
      return (performStorage(GET, storageKey) as Promise<unknown>)
        .then(value => value || initialValue)
        .then(oldData => performStorage(SET, storageKey, isList(oldData) ? oldData.concat(value) : update(oldData, value)))
    }
    const oldData = performStorage(GET, storageKey) || initialValue
    return performStorage(SET, storageKey, isList(oldData) ? oldData.concat(value) : update(oldData, value))
  }

  enumCheck([GET, SET, DELETE], ACTION, this)

  /* SERVER (or missing localStorage) */
  if (!hasLocalStorage) return (Active.Storage as StorageAdapter)[performStorage.toServer[ACTION]](storageKey, value)

  /* CLIENT */
  const args: unknown[] = [storageKey]
  if (SET === ACTION) args.push(toJSON(value))
  let result: unknown = localStorage[performStorage.toClient[ACTION]](...args)

  // Storage Retrieval
  if (GET === ACTION && result) result = fromJSON(result)  // Deserialize data

  return result
}

export declare namespace performStorage {
  /** `true` once an asynchronous backend was wired up with `performStorage.init()` */
  let isAsync: boolean | undefined
  /** Browser `localStorage` method names */
  let toClient: StorageMethods
  /** Currently active `Active.Storage` method names (asynchronous by default) */
  let toServer: StorageMethods
  /** Synchronous `Active.Storage` method names */
  let toServerSync: StorageMethods
}

performStorage.toClient = {
  [GET]: 'getItem',
  [SET]: 'setItem',
  [DELETE]: 'removeItem'
}
const toServerAsync = performStorage.toServer = {
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
performStorage.init = function (...args: unknown[]): unknown {
  performStorage.isAsync = true
  performStorage.toServer = toServerAsync
  return (Active.Storage as StorageAdapter).init(...args)
}
// Setup Synchronous Local Storage (not recommended)
performStorage.initSync = function (...args: unknown[]): unknown {
  performStorage.isAsync = false
  performStorage.toServer = performStorage.toServerSync
  return (Active.Storage as StorageAdapter).initSync(...args)
}
