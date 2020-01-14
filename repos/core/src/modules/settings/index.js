import View from './_View'
import { NAME, SETTING, UI } from './constants'
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
  UI,
  SETTING,
  select,
  View
}
export default {
  NAME,
  SETTING,
  reducer,
  saga,
  select,
  View
}
