import { NAME } from './constants'
import initState from './data'
import reducer from './reducers'
import saga from './sagas'
import * as select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export { LOGIN, LOGOUT, LOGIN_CHECK } from './constants'
export default {
  NAME,
  initState,
  reducer,
  saga,
  select
}
