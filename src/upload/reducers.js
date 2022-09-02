import { handleActions, stateActionType, uiLoading } from 'ui-modules-pack/redux'
import { SET } from 'ui-utils-pack'
import { UPLOAD } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

export default handleActions({
  [stateActionType(UPLOAD, SET)]: (state, {payload}) => ({...state, ...payload}),
  ...uiLoading(UPLOAD)
}, initState)
