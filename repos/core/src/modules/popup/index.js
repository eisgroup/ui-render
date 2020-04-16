import { ALERT, stateAction } from '../../common/actions'
import { ACTIVE } from '../../common/variables'
import { POPUP } from '../exports'
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
}
export default {
  NAME,
  reducer,
  saga,
  select,
}

export function popupAlert (title, content) {
  ACTIVE.store.dispatch(stateAction(POPUP, ALERT, {items: [{title, content}]}))
}
