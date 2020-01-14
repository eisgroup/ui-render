import { all, call, put, takeEvery } from 'redux-saga/effects'
import { stateAction, stateActionType } from '../../../actions'
import { takeFirst } from '../../../saga/utils'
import { resumeActionsPending } from '../../utils/saga'
import { ERROR, NAME as LOCATION, REQUEST, UPDATE } from './constants'
import { getLocation } from './utils'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/* Module's Combined Task to start all tasks at once */
export default function * saga () {
  yield all([
    // List someSaga() here
    locationWatch()
  ])
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * locationWatch () {
  yield all([
    takeFirst(stateActionType(LOCATION, REQUEST), locationUpdate),
    takeEvery(LOCATION, UPDATE, () => resumeActionsPending('location'))
  ])
}

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

/** Update User Location */
function * locationUpdate () {
  try {
    const location = yield call(getLocation)
    yield put(stateAction(LOCATION, UPDATE, location))  // Will resume Actions Pending Location
  } catch (error) {
    yield put(stateAction(LOCATION, ERROR, error))
  }
  // Finally {
  // if (yield cancelled()) {
  // yield put(stateAction(LOCATION_CANCEL))  // redundant action
  // }
  // }
}
