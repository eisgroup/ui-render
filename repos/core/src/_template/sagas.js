import { all, spawn } from '../common/saga/utils'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/**
 * All Tasks in this module get initiated here
 */
export default function * init () {
  yield spawn(watch)
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * watch () {
  yield all([
    // List task subscriptions here
  ])
}

/**
 * PERPETUAL TASKS (Action Initialisations) ------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */
