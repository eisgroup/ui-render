import { combineReducers, handleActions, popups, uiLoading } from '../redux'
import { POPUP } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Data Handler */
const dataHandler = handleActions({
  ...popups(POPUP)
}, initState.data)

/* UI Handler */
const uiHandler = handleActions({
  ...uiLoading(POPUP)
}, initState.ui)

const allHandlers = combineReducers({
  data: dataHandler,
  ui: uiHandler
})

export default allHandlers
