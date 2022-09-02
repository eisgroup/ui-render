import { Active, ALERT } from 'ui-utils-pack'
import { stateAction } from '../redux/actions'
import { POPUP } from './constants'

/**
 * Open Popup Alert with given messages
 * @param {String|Number|Node|JSX} title
 * @param {String|Number|Node|JSX} [content]
 */
export function popupAlert (title, content) {
  Active.store.dispatch(stateAction(POPUP, ALERT, {items: [{title, content}]}))
}
