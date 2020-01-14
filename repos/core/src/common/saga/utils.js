import { delay } from 'redux-saga'
import { call, put, spawn, take } from 'redux-saga/effects'
import { ALERT, FINISH, LOAD, START, stateAction, SYSTEM } from '../actions'
import { __CLIENT__ } from '../variables'
import { middleware } from './index'

/**
 * ASYNC TASK HELPERS ==========================================================
 * =============================================================================
 */

export { delay }
export {
  all, call, fork, put, race, select as selectState, spawn,
  take, takeEvery, takeLatest, throttle,
} from 'redux-saga/effects'

/**
 * Subscribe to the First Action and ignore incoming actions until the Task is finished
 *
 * @param {string} actionType - action type to subscribe to
 * @param {function} callback - normal or generator function to fire when action dispatches
 * @param {Array} args - arguments to pass to the started task
 */
export function * takeFirst (actionType, callback, ...args) {
  /* Take(), followed by async method call, equals takeFirst
   * because rapid actions are only executed once
   * since saga has to finish the last yield statement
   * in order to take the next same action in while loop
   */
  while (true) {
    const action = yield take(actionType)
    yield call(callback, ...args.concat(action))
  }
}

/**
 * Dispatches a loading START action
 *
 * @example
 *   takeEvery(stateActionType(SOMETHING, GET), loadingStart(SOMETHING))
 *
 * @param {string} type - The action type to dispatch a loading action for
 * @returns {Function} - A generator function that will dispatch the loading START action
 */
export function loadingStart (type) {
  return function * ({payload, meta, meta: {isLoading = true} = {}} = {}) {  // eslint-disable-line
    // Don't dispatch action if told not to
    if (!isLoading) return

    // Dispatch the load action
    yield put(stateAction(type, LOAD, START, payload, meta))
  }
}

/**
 * Dispatches a loading FINISH action
 *
 * @example
 *   takeEvery(stateActionType(SOMETHING, GET), loadingFinish(SOMETHING))
 *
 * @param {String} type - The action type to dispatch a loading action for
 * @param {Number} [wait] - milliseconds to wait before dispatching loading action
 * @returns {Function} - A generator function that will dispatch the loading FINISH action
 */
export function loadingFinish (type, wait) {
  return function * ({payload, meta} = {}) { // eslint-disable-line
    if (wait) yield call(delay, wait)
    yield put(stateAction(type, LOAD, FINISH, payload, meta))
  }
}

/**
 * Run Saga Middleware for given Generator Function
 *
 * @param {Function} func - generator function to run
 * @param {*} args - arguments to pass to generator function
 * @return {Object} Task - redux-saga task description, with .done, .cancel(), etc.
 */
export function runSaga (func, ...args) {
  return middleware.run(func.bind(this, ...args))
}

/**
 * Execute a Saga Task and Return Its Promise
 * @See: runSaga() for docs
 * @example:
 *    const result = await runTask(sagaFlowGeneratorFunction, {payload: {...}})
 */
export function runTask (...args) {
  return runSaga(...args).done
}

/* Dispatch Alert Message Action to be Handled by Appropriate Platform */
export function * systemAlert ({ message, title = 'Alert' }) {
  if (__CLIENT__) return yield put(stateAction(SYSTEM, ALERT, { items: [{ title, content: message }] }))
}

/**
 * Schedule Action Dispatch
 *
 * @param {String} [id] - of action types used for rescheduling pending actions
 * @param {Array<time, type, payload, meta>} [actions] - to schedule, each with `time` timestamp of when to dispatch,
 *    if not given, will use previously given list of actions
 * @param {Number} timeOffset - milliseconds to add to each scheduled action time, default is 0,
 *    so we can playback past actions as if they are happening right now
 * @param {Number} timeModifier - playback speed multiplier, default is 1
 */
export function * scheduleActions ({ payload: { id = '', actions = null, timeOffset = null, timeModifier = null } }) {
  if (!actions) actions = (scheduleActions[id] || {}).actions
  if (!timeOffset) timeOffset = (scheduleActions[id] || {}).timeOffset || 0
  if (!timeModifier) timeModifier = (scheduleActions[id] || {}).timeModifier || 1
  if (scheduleActions[id]) scheduleActions[id].task.cancel()
  scheduleActions[id] = { actions, timeOffset, timeModifier, task: { cancel () {} } } // create/reset schedule

  // All Actions completed/not needed anymore (allows resetting actions by passing empty array)
  if (!scheduleActions[id].actions.length) return delete scheduleActions[id]

  // Dispatch the First Action
  const action = scheduleActions[id].actions[0]
  const time = action.time + timeOffset
  scheduleActions[id].task = yield spawn(scheduleActionTask, { id, action, time, timeModifier })
}

function * scheduleActionTask ({ id, action, time, timeModifier }) {
  const wait = (time - Date.now()) * timeModifier
  if (wait > 0) yield delay(wait)

  /* Dispatch Action */
  action.meta.isScheduled = true
  yield put(action)

  // Only remove the action after execution to allow rescheduling with different playback speed
  scheduleActions[id].actions.shift()

  /* Recursively schedule the rest of actions */
  yield spawn(scheduleActions, { payload: { id } }) // spawn to prevent recursive task.cancel() error
}

/* Check if Given Action is a Scheduled Action */
export function isScheduledActionType ({ meta: { isScheduled } = {} }) {
  return isScheduled
}
