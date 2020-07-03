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

export default {
  NAME,
  hasEnabledSaga: true,  // for createStore() to check
  middleware,
}
