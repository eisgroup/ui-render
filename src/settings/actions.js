import { stateAction } from 'modules-pack/redux/actions'
import { Active, SET } from 'utils-pack'
import { NAME as SETTINGS } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

export function setSettings (payload) {
  return Active.store.dispatch(stateAction(SETTINGS, SET, payload))
}
