import { Active, ALERT } from 'utils-pack'
import { stateAction } from '../redux/actions'
import { POPUP } from './constants'
import reducer from './reducers'
import saga from './sagas'
import select from './selectors'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './constants'
export {
  POPUP,
  select,
}

const popup = {
  NAME: POPUP,
  reducer,
  saga,
  select,
}

export default popup

export function popupAlert (title, content) {
  Active.store.dispatch(stateAction(POPUP, ALERT, {items: [{title, content}]}))
}
