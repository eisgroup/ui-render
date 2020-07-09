import { apiAction } from 'modules-pack/../../api/actions'
import { subscribeToApiResults } from 'modules-pack/../../api/utils'
import { stateActionType } from 'modules-pack/redux/actions'
import { all, call, put, takeEvery } from 'modules-pack/saga/utils'
import { GET, get, toList } from 'utils-pack'

import { API_VALIDATE_FAIL_CODE, FORM_ASYNC_VALIDATE } from './constants'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/* Module's Combined Task to start all sagas at once */
export default function * saga () {
  yield all([
    formWatch()
  ])
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

/* Interaction */
function * formWatch () {
  yield all([
    takeEvery(stateActionType(FORM_ASYNC_VALIDATE, GET), handleAsyncValidate)
  ])
}

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Handles async validation requests
 *
 * @param {AsyncValidatorDescriptor[]} items - Objects describing the async validation operations to perform
 * @param {Function} callback - function that's called if validation passes
 * @returns {*} - result from callback function
 */
function * handleAsyncValidate ({payload: {items = [], callback}}) {
  const apiCallListeners = []
  for (const item of toList(items)) {
    const {url, payload, validateFailMessage} = item

    // Construct meta object. Add flag to ignore HTTP codes for validation failure so API doesn't trigger a popup
    const meta = {
      field: item.field,
      validateFailMessage,
      shouldIgnoreErrorCodes: [API_VALIDATE_FAIL_CODE]
    }

    // Make API call
    yield put(apiAction(url, GET, {params: payload}, meta))

    // Collect Request Results' Subscriptions
    apiCallListeners.push(call(subscribeToApiResults, url, GET, meta))
  }

  // Collect any errors
  const apiCallResults = yield apiCallListeners
  const errors = apiCallResults.reduce((accumulator, apiCallResult) => {
    if (!get(apiCallResult, 'payload.valid')) {
      const errorMessage = apiCallResult.meta.validateFailMessage
      const field = apiCallResult.meta.field

      return {...accumulator, [field]: errorMessage}
    }

    return accumulator
  }, {})

  return callback(errors)
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */
