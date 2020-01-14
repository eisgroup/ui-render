import { SET, stateAction } from '../../common/actions'
import { ACTIVE } from '../../common/variables'
import { SELF } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

export function setUser (payload) {
  return ACTIVE.store.dispatch(stateAction(SELF, SET, payload))
}
