import { all } from '../saga/utils'
// import { isFunction } from '../utils'
// import modules from './modules'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/**
 * All Tasks in this module get initiated here
 */
export default function * init () {
  yield all([
    // ...modules.filter(({saga}) => isFunction(saga)).map(module => module.saga())
  ])
}
