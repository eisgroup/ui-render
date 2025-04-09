import {
  API,
  HTTP_401_UNAUTHORIZED,
  NETWORK,
  NETWORK_ERROR_MESSAGES,
  REQUEST_TIMEOUT_MESSAGE
} from 'ui-modules-pack/api/constants'
import { isApiActionTypeError, isApiActionTypeTimeout } from 'ui-modules-pack/api/utils'
import { stateAction, stateActionType, } from 'ui-modules-pack/redux/actions'
import { all, call, put, takeEvery } from 'ui-modules-pack/saga/utils'
import { ALERT, ERROR, get, hostname, isInList, LOGOUT, OPEN, SYSTEM, toList, } from 'ui-utils-pack'
import { POPUP, POPUP_ALERT, POPUP_ERROR } from './constants'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/* Module's Combined Task to start all sagas at once */
export default function * saga () {
  yield all([
    // List someSaga() here
    popupWatch()
  ])
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * popupWatch () {
  yield all([
    takeEvery(stateActionType(SYSTEM, ALERT), popupAlert),
    takeEvery(stateActionType(POPUP, ALERT), popupAlert),
    takeEvery(stateActionType(POPUP, ERROR), popupError),
    takeEvery(isApiActionTypeError, apiErrorFlow),
    takeEvery(isApiActionTypeTimeout, apiTimeoutAlert),
    takeEvery(stateActionType(NETWORK, ERROR), networkErrorAlert)
  ])
}

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */
let lastApiErrorMessage = null

function * apiErrorFlow ({payload = {}, meta: {shouldIgnoreErrorCodes, errorTitle, shouldAlertSameErrorOnce = false}}) {
  const {status, code, type, content, detail, message, msg} = payload
  const errors = toList(payload.errors || payload.error || {status, code, type, content, detail, message, msg})
  const errorMessage = get(errors, '[0].message', get(errors, '[0].details[0].message', payload.message))

  // Ignore any given errors
  if (shouldIgnoreErrorCodes && isInList(shouldIgnoreErrorCodes, status)) return

  // Ignore 401 Responses
  if (status === HTTP_401_UNAUTHORIZED) return

  // Dispatch LOGOUT if Error came from LOGOUT request
  if (type === LOGOUT) yield put(stateAction(API, LOGOUT))

  // Popup Error
  if (!shouldAlertSameErrorOnce || lastApiErrorMessage !== errorMessage) {
    lastApiErrorMessage = errorMessage
    yield call(popupError, {payload: {title: errorTitle, errors}})
  }
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * apiTimeoutAlert ({payload: {url} = {}}) {
  // Show Popup Alert
  yield call(popupAlert, {
    payload: {
      items: [{
        title: REQUEST_TIMEOUT_MESSAGE,
        content: `API request timed out for ${hostname(url)}, please try again.`
      }]
    }
  })
}

function * networkErrorAlert () {
  // Show Popup Alert
  yield call(popupAlert, {
    payload: {
      items: [{
        title: NETWORK_ERROR_MESSAGES[0],
        content: 'Cannot connect to the internet.'
      }]
    }
  })
}

/**
 * @param {Array} items - [{title, content}]
 */
function * popupAlert ({payload: {items} = {}}) {
  yield put(stateAction(POPUP, OPEN, {
    activePopup: POPUP_ALERT,
    [POPUP_ALERT]: {
      items
    }
  }))
}

function * popupError ({payload: {title = 'Error', errors, items} = {}}) {
  yield put(stateAction(POPUP, OPEN, {
    activePopup: POPUP_ERROR,
    [POPUP_ERROR]: {
      title,
      items: toList(errors || items)
    }
  }))
}
