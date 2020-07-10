import { NAME } from './constants'
import middleware, { createApiMiddleware } from './middleware'
import reducer from './reducers'
import * as select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './actions'
export * from './utils'

/** See apiMiddleware for more documentation */
export { createApiMiddleware }

const api = {
  NAME,
  reducer,
  select,
  middleware
}

export default api
