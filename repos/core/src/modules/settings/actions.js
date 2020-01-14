import { SET, stateAction } from '../../common/actions'
import { ACTIVE } from '../../common/variables'
import { NAME as SETTINGS } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

export function setSettings (payload) {
  return ACTIVE.store.dispatch(stateAction(SETTINGS, SET, payload))
}
