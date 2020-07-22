import { NAME } from './constants'
import reducer from './reducers'
import saga from './sagas'
import select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './constants'
export * from './actions'
export {
  NAME,
  select,
}

const user = {
  NAME,
  reducer,
  saga,
  select,
}

export default user
