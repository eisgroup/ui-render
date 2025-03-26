import { stateAction } from 'ui-modules-pack/redux/actions'
import { Active, SET } from 'ui-utils-pack'
import { NAME as SETTINGS } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

export function setSettings (payload) {
  console.log('setSettings')
  // return Active.store.dispatch(stateAction(SETTINGS, SET, payload))
}
