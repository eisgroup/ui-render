import { NAME } from './constants'
import middleware from './middleware'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './utils'
export {
  middleware
}

const saga = {
  NAME,
  hasEnabledSaga: true,  // for createStore() to check
  middleware,
}

export default saga
