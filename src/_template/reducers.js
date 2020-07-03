import { combineReducers, handleActions, stateActionType, uiLoading } from 'modules-pack/redux'
import { SET } from 'utils-pack'
import { NAME } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Data Handler */
const dataHandler = handleActions({

  [stateActionType(NAME, SET)]: (state, {payload}) => ({...state, ...payload})

}, initState.data)

/* UI Handler */
const uiHandler = handleActions({
  ...uiLoading(NAME)
}, initState.ui)

const allHandlers = combineReducers({
  data: dataHandler,
  ui: uiHandler
})

export default allHandlers
