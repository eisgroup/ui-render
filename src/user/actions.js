import { stateAction } from 'modules-pack/redux'
import { Active, RESET, SET } from 'utils-pack'
import { SELF } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

// Set User Data in State, and optionally sync with Backend by setting meta = {sync: true}
export function setUser (payload, meta) {
  return Active.store.dispatch(stateAction(SELF, SET, payload, meta))
}

// Reset User Data in State
export function resetUser (payload, meta) {
  return Active.store.dispatch(stateAction(SELF, RESET, payload, meta))
}
