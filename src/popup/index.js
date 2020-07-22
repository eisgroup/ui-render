import { Active, ALERT } from 'utils-pack'
import { stateAction } from '../redux/actions'
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
export {
  NAME,
  select,
}

const popup = {
  NAME,
  reducer,
  saga,
  select,
}

export default popup

export function popupAlert (title, content) {
  Active.store.dispatch(stateAction(NAME, ALERT, {items: [{title, content}]}))
}
