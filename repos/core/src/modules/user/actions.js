import { SET, stateAction } from '../../common/actions'
import { ACTIVE } from '../../common/variables'
import { SELF } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

// Set User Data in State, and optionally sync with Backend by setting meta = {sync: true}
export function setUser (payload, meta) {
  return ACTIVE.store.dispatch(stateAction(SELF, SET, payload, meta))
}
