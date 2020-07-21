import { all, call, cancel, cancelled, delay, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { stateAction, stateActionType } from '../../../actions'
import { enumCheck, get, isInStringAny, logTask } from '../../../utils'
import { ANIMATION_DURATION, URL_LOGIN, URL_LOGIN_REFRESH, URL_LOGOUT } from '../../../variables'
import Api, { apiAction, apiActionType } from '../../actions'
import { isApiActionTypeSuccess, resumeActionsPending } from '../../utils'

import {
  ADD_ACTIONS_PENDING_AUTH,
  API,
  AUTH,
  CANCEL,
  CLOSE,
  CREATE,
  ERROR,
  FINISH,
  LOGIN,
  LOGIN_CHECK,
  LOGOUT,
  OPEN,
  PREFETCH,
  REFRESH,
  REQUEST,
  RESET,
  SUCCESS,
  TIMEOUT,
  UPDATE
} from './constants'
import { token as tokenSelector } from './selectors'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/* Module's Combined Task to start all tasks at once */
export default function * saga () {
  yield all([
    // List someSaga() here
    loginWatch(),
    logoutWatch()
    // tokenWatch()  // only enable if needed, for performance reasons
  ])
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * loginWatch () {
  /* Must takeLatest to ensure login request is always processed
   * no matter if Logout action was called or not subsequently,
   * to prevent apiActionsPending from blocking Login
   */
  yield all([
    takeLatest([LOGIN_CHECK, ADD_ACTIONS_PENDING_AUTH], loginCheckFlow),
    takeLatest(stateActionType(API, LOGIN, REQUEST), (action) => loginRequestFlow(action, REQUEST)),
    takeLatest(stateActionType(API, LOGIN, REFRESH), (action) => loginRequestFlow(action, REFRESH)),
    takeEvery(stateActionType(API, LOGIN, SUCCESS), loginSuccessFlow)
  ])
}

function * logoutWatch () {
  /* Take(), followed by async method call, equals takeFirst
   * because rapid actions are only executed once
   * since saga has to finish the last yield statement
   * in order to take the next same action in while loop
   */
  while (true) {
    yield take(stateActionType(API, LOGOUT))
    yield all([
      call(Api.clearToken),  // Remove token from Storage
      put(stateAction(RESET)),  // Reset the whole app state
      put(stateAction(API, LOGOUT, FINISH)) // Signal logout complete
    ])
  }
}

/* Update Token on Success Responses */
function * tokenWatch () {  // eslint-disable-line
  yield all([
    takeLatest(isApiActionTypeSuccess, tokenUpdate)
  ])
}

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Login Request Actions Flow
 *
 * @param {Object} payload - action.payload
 * @param {String} [actionType] - optional, one of enum values [REQUEST, REFRESH]
 */
function * loginRequestFlow ({payload}, actionType = REQUEST) {
  enumCheck([REQUEST, REFRESH], actionType)

  // Start API Login asynchronously, waiting for response
  let task
  if (actionType === REQUEST) {
    task = yield fork(tokenRequest, URL_LOGIN, payload, {authenticate: false})
  } else if (actionType === REFRESH) {
    task = yield fork(tokenRequest, URL_LOGIN_REFRESH)
  }

  // Keep listening for new Actions if Login is interrupted by Logout
  const {type} = yield take([
    stateActionType(API, LOGOUT),
    stateActionType(API, LOGIN, ERROR)
  ])

  // Cancel Login if Logout
  if (type === stateActionType(API, LOGOUT)) yield cancel(task)
}

function * loginSuccessFlow () {
  /* Signal Prefetching of Resources */
  yield put(stateAction(PREFETCH))

  /* Resume Actions Pending Authentication */
  yield call(resumeActionsPending, AUTH)

  /* Ensure Token is Still Valid */
  const token = yield select(tokenSelector)

  if (token) {
    try {
      /* Close Login View */
      yield call(loginViewClose)
    } catch (e) {
      // Do nothing
    }
  }  // eslint-disable-line brace-style

  /* Token Expired */
  else {
    yield put(stateAction(LOGIN_CHECK))
  }
}

/**
 * Check if API Token Exists
 *
 * * Open Login View if not already open and no token exists
 * * Dispatch LOGIN SUCCESS on APP Launch if token exists in Storage
 * * Refresh Token if a token already exists in the state
 */
function * loginCheckFlow () {
  // Delay check to ensure all kinds of transition animations have completed
  const duration = Math.max(ANIMATION_DURATION * 3, 300)
  yield delay(duration)

  logTask('loginCheckFlow')
  let token = yield select(tokenSelector)

  /* APP LAUNCH */
  if (!token) {
    // Because state token is empty -> can only be App Open, or after LOGOUT

    // try getting token from Storage first
    // (useful for subsequent App launches where user logged in before)
    const retrievedToken = yield call(Api.getToken)
    token = retrievedToken ? String(retrievedToken).replace('Bearer ', '') : null

    /* LOGIN ALREADY */
    if (token) {
      // Set Token in State
      yield put(stateAction(API, LOGIN, SUCCESS, {token}))
    }  // eslint-disable-line brace-style

    /* LOGOUT BEFORE */
    else {
      yield call(loginViewOpen)
    }
  }  // eslint-disable-line brace-style

  /* TOKEN EXPIRED */
  else {
    // Because state has token but it's not valid
    // Refresh Token
    yield put(stateAction(API, LOGIN, REFRESH))
  }
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

/** Open Login View */
function * loginViewOpen () {
  yield put(stateAction(API, LOGIN, OPEN))
}

/** Close Login View */
function * loginViewClose () {
  yield put(stateAction(API, LOGIN, CLOSE))
}

/**
 * Request Token from API Server
 * (Used for Initial Login and Token Refresh).
 *
 * @param {[string]} URL - API endpoint to fetch
 * @param {Object} apiPayload - payload to send with apiAction
 * @param {Object} apiMeta - meta data to send with apiAction
 */
function * tokenRequest (URL, apiPayload, apiMeta) {
  try {
    /* Token Request */
    yield put(apiAction(URL, CREATE, apiPayload, {
      ...apiMeta
      // ResponseHandler: (response) => {
      //   const headers = response.headers;
      //   console.log('response.headers', headers);
      //   return response;
      // }
    }))

    const {payload = {}, meta = {}} = yield take([
      // Take any of these action types
      apiActionType(URL, CREATE, SUCCESS),
      apiActionType(URL, CREATE, ERROR),
      apiActionType(URL, CREATE, TIMEOUT)
    ])

    /* Request Error */
    if (meta.result === ERROR) {
      // Signal Error
      yield put(stateAction(API, LOGIN, ERROR))

      const isRefresh = !apiPayload
      if (isRefresh) {
        // Logout
        yield put(stateAction(API, LOGOUT))
      }
    }  // eslint-disable-line brace-style

    /* Request Timeout */
    else if (meta.result === TIMEOUT) {
      // Signal timeout with message from API Middleware
      yield put(stateAction(API, LOGIN, TIMEOUT, payload))
    }  // eslint-disable-line brace-style

    /* Request Success */
    else if (meta.result === SUCCESS) {
      const token = get(meta, 'headers.token') || get(payload, 'token') || get(payload, 'key')
      if (token) yield call(Api.storeToken, token)

      // Set token in state
      yield put(stateAction(API, LOGIN, SUCCESS, {token, ...payload}))
    }
  }  // eslint-disable-line brace-style

    /* Other Errors */
  catch (error) {
    // Signal Error + alert
    yield put(stateAction(API, LOGIN, ERROR, error))
  }  // eslint-disable-line brace-style

    /* Request Canceled */
  finally {
    // Unset isLoading state without alert, by omitting payload
    if (yield cancelled()) yield put(stateAction(API, LOGIN, CANCEL))
  }
}

/**
 * Update Token in Storage and State
 * (when new token is returned from success responses).
 */
function * tokenUpdate ({type, payload, meta}) {
  // Match all Success API Fetch Responses, except from Login endpoints
  if (isInStringAny(type, URL_LOGIN, URL_LOGIN_REFRESH, URL_LOGOUT)) return

  const oldToken = yield select(tokenSelector)
  const token = get(meta, 'headers.token') || get(payload, 'token') || get(payload, 'key')

  // Update Token If It Has Changed
  if (token && oldToken && token !== oldToken) {
    yield call(Api.storeToken, token)
    yield put(stateAction(API, LOGIN, UPDATE, {token}))
  }
}
