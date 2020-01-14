import createSagaMiddleware from 'redux-saga' // Middleware for async tasks
import { NAME } from './constants'
import saga from './sagas'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export const middleware = createSagaMiddleware()
export default {
  NAME,
  hasEnabledSaga: true,  // for createStore() to check
  middleware,
  saga
}
