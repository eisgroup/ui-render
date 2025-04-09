import { applyMiddleware, combineReducers, compose, createStore as reduxCreateStore } from 'redux'
import { ignoreActions } from 'redux-ignore'
import { all } from 'redux-saga/effects'
import { __DEV__, Active, get, hasListValue, hasObjectValue, HYDRATE, isFunction, RESET, toList } from 'ui-utils-pack'
import saga from '../saga'

export default function createStore (modules = [], {ignore} = {}) {
  modules = toList(modules)
  if (!hasListValue(modules)) return reduxCreateStore(state => state)

  /* Register Middleware */
  const middlewares = modules.filter(({middleware}) => isFunction(middleware)).map(module => module.middleware)
  let composeEnhancers = compose
  if (typeof window !== 'undefined') { // need to put this check on separate lite because of Next.js
    if (__DEV__) {
      composeEnhancers = get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', compose)
    }
  }
  const allMiddleware = composeEnhancers(applyMiddleware(...middlewares))

  /* Register Action Handlers */
  let handlers = {}
  modules.forEach(({NAME, ACTION_TYPE, reducer}) => {
    if (!NAME || !isFunction(reducer)) return
    handlers[NAME] = ignore ? ignoreActions(reducer, ({type}) => (!type || type.indexOf(ACTION_TYPE || NAME) !== 0)) : reducer
  })
  const rootReducer = hasObjectValue(handlers) ? combineReducers(handlers) : (state => state)
  const allHandlers = (state, action) => {
    if (RESET === action.type) state = undefined  // reset App to initial state
    if (HYDRATE === action.type) return action.payload  // set App to given state
    return Active.state = rootReducer(state, action)
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
