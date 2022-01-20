import { apiAction, subscribeToApiResults } from 'modules-pack/api'
import { stateAction, stateActionType } from 'modules-pack/redux'
import { all, call, delay, put, spawn, takeLatest } from 'modules-pack/saga/utils'
import { ROUTE, URL } from 'modules-pack/variables'
import { Active, CREATE, LOGIN, RESET, sanitizeResponse, SET, SUCCESS } from 'utils-pack'
import { SELF, USER_LOGIN } from '../constants'
import * as m from '../mutations' // setup Active.UserMutation
import * as q from '../queries' // setup Active.UserQuery

const sideEffects = {m, q}

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
    takeLatest(stateActionType(LOGIN), loginOpen),
    takeLatest(stateActionType(SELF, SET), userUpdate),
    takeLatest(stateActionType(LOGIN, SUCCESS), loginSuccessFlow),
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
 * Close Login Modal, Get Required Info and Refresh Requested Route
 */
function * loginSuccessFlow ({meta: {form} = {}}) {
  if ((form && form !== USER_LOGIN) || ROUTE.LOGIN !== Active.history.location.pathname) return
  const {history} = Active
  let routeToRefresh = ROUTE.HOME

  // Close Login Modal
  // @note: history.goBack() will reload browser if no previous page exists (i.e. Login page entered directly),
  // causing the entire redux store to reset as if loading the app initially,
  // thus, below code will be canceled.
  // However, history.length always return 2, even if Login page was entered directly.
  // Thus, we need to check if Login was opened by loginOpen() using state identifier `isModal`,
  // and only fire history.goBack() if it was opened as Modal.
  const {state: {isModal} = {}} = history.location
  if (isModal) {
    // the standard uses history.back() while `react-router` uses history.goBack
    (history.back || history.goBack)()
    yield delay(10)
    routeToRefresh = Active.history.location.pathname
    // Refresh Requested Route
    // Because react-router has no refresh function any more
    // we have to manually force Component re-mount by first pushing Loading route
    history.push(ROUTE.LOADING)
  }

  // Get Required Info
  yield all([
    call(infoGqlFlow),
    delay(10),
  ])

  history.push(routeToRefresh)
}


/**
 * Get User Profile Data from GraphQl Server
 */
export function * infoGqlFlow () {
  /* API Request and Wait for Response */
  const body = {query: Active.UserQuery}
  yield put(apiAction(URL.API_GQL, CREATE, {body}, {...body, headers}))
  const {payload = {}, meta: {result} = {}} = yield call(subscribeToApiResults, URL.API_GQL, CREATE, body)
  if (result !== SUCCESS) return

  /* Update State */
  const {user} = payload.data || {}
  if (user) yield put(stateAction(SELF, RESET, sanitizeResponse(user)))
}

// Sync User Data with Backend
function * userUpdate ({payload, meta}) {
  const {sync} = meta || {}
  if (!sync) return
  yield call(userMutate, {payload, meta})
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

function * loginOpen () {
  if (ROUTE.LOGIN === Active.history.location.pathname) return
  Active.history.push({pathname: ROUTE.LOGIN, state: {isModal: true, canCloseModal: false}})
}

function * userMutate ({payload}) {
  const body = {query: Active.UserMutation, variables: {user: payload}}
  yield put(apiAction(URL.API_GQL, CREATE, {body}, {...body, headers}))
}

const headers = {'Content-Type': 'application/json'}
