import View from './_View'
import { NAME } from './constants'
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
  View
}
export default {
  NAME,
  reducer,
  saga,
  select,
  View
}
