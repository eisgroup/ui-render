import { NAME } from './constants'
import reducer from './reducers'
import select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './constants'
const upload = {
  NAME,
  reducer,
  select,
}

export default upload
