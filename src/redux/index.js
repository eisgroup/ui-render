import { connect, Provider } from 'react-redux' // import like this produces smallest js bundle size
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
  handleActions,
  createAction,
  Provider
}

const redux = {
  middleware: thunk,
  Provider
}

export default redux
