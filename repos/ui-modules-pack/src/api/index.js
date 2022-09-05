import { API } from './constants'
import middleware, { createApiMiddleware } from './middleware'
import reducer from './reducers'
import * as select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './constants'
export * from './actions'
export * from './fetch'
export * from './utils'

/** See apiMiddleware for more documentation */
export { createApiMiddleware }

const api = {
  NAME: API,
  reducer,
  select,
  middleware
}

export default api
