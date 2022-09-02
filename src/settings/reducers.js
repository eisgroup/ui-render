import { combineReducers, handleActions, stateActionType, uiLoading } from 'ui-modules-pack/redux'
import { performStorage, SET } from 'ui-utils-pack'
import { NAME, UI } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Data Handler (persistent settings) */
const dataHandler = handleActions({

  [stateActionType(NAME, SET)]: (state, {payload}) => {
    const settings = {...state, ...payload}
    performStorage(SET, NAME, settings)
    return settings
  }

}, initState.data)

/* UI Handler (non-persistent settings) */
const uiHandler = handleActions({
  ...uiLoading(NAME),
  [stateActionType(UI, SET)]: (state, {payload}) => ({...state, ...payload}),
}, initState.ui)

const allHandlers = combineReducers({
  data: dataHandler,
  ui: uiHandler
})

export default allHandlers
