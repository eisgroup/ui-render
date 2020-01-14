import { NAME } from './constants'
import { createApiMiddleware } from './middleware'
import reducer from './reducers'
import saga from './sagas'
import * as select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

/** See apiMiddleware for more documentation */
export { createApiMiddleware }
export default {
  NAME,
  reducer,
  saga,
  select,
  middleware: createApiMiddleware()
}
