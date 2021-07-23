import { connect, Provider } from 'react-redux' // import like this produces smallest js bundle size
import mergeReducers from 'reduce-reducers'
import { combineReducers } from 'redux'
import { createAction, handleActions } from 'redux-actions' // import like this produces smallest js bundle size
import thunk from 'redux-thunk' // Middleware for async tasks

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './actions'
export * from './reducers'
export { default as createStore } from './createStore'
export {
  combineReducers,
  connect,
  createAction,
  handleActions,
  mergeReducers,
  Provider
}

const redux = {
  middleware: thunk,
  Provider
}

export default redux
