import { NAME, SETTING, UI } from './constants'
import reducer from './reducers'
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
  UI,
  SETTING,
  select,
}

const settings = {
  NAME,
  SETTING,
  reducer,
  sagas: {},
  select,
}

export default settings
