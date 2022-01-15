import { handleActions, stateActionType, uiLoading } from 'modules-pack/redux'
import { SET } from 'utils-pack'
import { ROUTER } from '../constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

export default handleActions({
  [stateActionType(ROUTER, SET)]: (state, {payload}) => ({...state, ...payload}),
  ...uiLoading(ROUTER)
}, initState)
