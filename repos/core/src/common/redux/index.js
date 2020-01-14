import { connect, Provider } from 'react-redux' // import like this produces smallest js bundle size
import { combineReducers } from 'redux'
import { createAction, handleActions } from 'redux-actions' // import like this produces smallest js bundle size
import thunk from 'redux-thunk' // Middleware for async tasks

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export {
  combineReducers,
  connect,
  handleActions,
  createAction,
}
export default {
  middleware: thunk,
  Provider
}
