import { USER } from './constants'
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
  select,
}

const user = {
  NAME: USER,
  reducer,
  saga,
  select,
}

export default user
