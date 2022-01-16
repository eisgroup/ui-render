import { handleActions, stateActionType, uiLoading } from 'modules-pack/redux'
import { Active, performStorage, RESET, SET } from 'utils-pack'
import { SELF, USER } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Data Handler */
export default handleActions({
  [stateActionType(USER, SET)]: (state, {payload}) => ({...state, ...payload}),
  [stateActionType(SELF, SET)]: (state, {payload}) => {
    const data = {
      ...state,
      self: Active.user = {...state.self, ...payload}
    }
    performStorage(SET, USER, data.self)
    return data
  },
  [stateActionType(SELF, RESET)]: (state, {payload}) => {
    const data = {
      ...state, // always keep `lastLogin` for checking if user is new or returning visitor
      self: Active.user = {lastLogin: state.self.lastLogin, ...payload},
    }
    performStorage(SET, USER, data.self)
    return data
  },
  ...uiLoading(USER)
}, initState)
