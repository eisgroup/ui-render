import { Active, SET } from 'utils-pack'
import { stateAction } from '../redux/actions'
import { NAME as SETTINGS } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

export function setSettings (payload) {
  return Active.store.dispatch(stateAction(SETTINGS, SET, payload))
}
