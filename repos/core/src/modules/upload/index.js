import View from './_View'
import { NAME } from './constants'
import reducer from './reducers'
import select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  NAME,
  reducer,
  select,
  View
}
