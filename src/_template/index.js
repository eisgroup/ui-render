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

export * from './constants'
export * from './utils'
export {
  NAME,
  select,
  query,
}

const _template = {
  NAME,
  reducer,
  query,
  saga,
  select,
}

export default _template
