import { applyMiddleware, combineReducers, compose, createStore as reduxCreateStore } from 'redux'
import { ignoreActions } from 'redux-ignore'
import { all } from 'redux-saga/effects'
import { HYDRATE, RESET } from '../actions'
import saga from '../saga'
import { get, hasListValue, hasObjectValue, isFunction, toList } from '../utils'
import { __DEV__ } from '../variables'

/**
 * STORE CREATION ==============================================================
 * =============================================================================
 */

/**
 * Creates the Redux store for the app
 * @Note:
 *    - redux action execution takes 0.5 microseconds by default
 *    - every new reducer adds about 0.45 microseconds to action execution
 *    - every new saga adds about 0.75 microseconds to action execution
 *    => optimize performance with `redux-ignore` library to filter actions
 *
 * @param {Array|Object} modules - list of modules to activate {NAME, middleware, reducer, saga}
 * @returns {Object} - redux store
 */
export default function createStore (modules = []) {
  modules = toList(modules)
  if (!hasListValue(modules)) return reduxCreateStore(state => state)

  /* Register Middleware */
  const middlewares = modules.filter(({middleware}) => isFunction(middleware)).map(module => module.middleware)
  const composeEnhancers = (__DEV__ && (typeof window !== 'undefined')) ? (get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__') || compose) : compose
  const allMiddleware = composeEnhancers(applyMiddleware(...middlewares))

  /* Register Action Handlers */
  let handlers = {}
  modules.forEach(({NAME, ACTION_TYPE, reducer}) => {
    if (!NAME || !isFunction(reducer)) return
    handlers[NAME] = ignoreActions(reducer, ({type}) => (!type || type.indexOf(ACTION_TYPE || NAME) !== 0))
  })
  const rootReducer = hasObjectValue(handlers) ? combineReducers(handlers) : (state => state)
  const allHandlers = (state, action) => {
    if (RESET === action.type) state = undefined  // reset App to initial state
    if (HYDRATE === action.type) return action.payload  // set App to given state
    return rootReducer(state, action)
  }

  /* Register Store */
  const store = reduxCreateStore(allHandlers, allMiddleware)

  /* Register Async Tasks when Enabled */
  if (modules.find(({hasEnabledSaga}) => hasEnabledSaga)) {
    saga.middleware.run(function * () {
      yield all(modules.filter(({saga}) => isFunction(saga)).map(module => module.saga()))
    })
  }

  return store
}
