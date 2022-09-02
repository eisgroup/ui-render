import { handleActions, stateActionType, uiLoading } from 'modules-pack/redux'
import { SET } from 'ui-utils-pack'
import { _TEMPLATE } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

export default handleActions({

  [stateActionType(_TEMPLATE, SET)]: (state, {payload}) => ({...state, ...payload}),

  ...uiLoading(_TEMPLATE)
}, initState)
