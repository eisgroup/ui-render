import { NAME } from './constants'
import * as query from './queries'
import reducer from './reducers'
import saga from './sagas'
import select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export {
  NAME,
  select,
  query,
}
export default {
  NAME,
  reducer,
  query,
  saga,
  select,
}
