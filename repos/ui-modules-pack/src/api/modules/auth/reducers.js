import { combineReducers, handleActions } from 'ui-modules-pack/redux'
import { stateActionType } from 'ui-modules-pack/redux/actions'
import { LOGIN, LOGOUT, SUCCESS, UPDATE } from 'ui-utils-pack'
import { API } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Login DATA Handler */
const dataHandler = handleActions({

  [stateActionType(API, LOGIN, SUCCESS)]: (state, {payload: {token} = {}}) => ({...state, token}),

  [stateActionType(API, LOGIN, UPDATE)]: (state, {payload: {token} = {}}) => ({...state, token}),

  [stateActionType(API, LOGOUT)]: (state) => ({...state, token: null})

}, initState.data)

/* Login Combined Handler */
const handler = combineReducers({
  data: dataHandler
})

export default handler
