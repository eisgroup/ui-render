import { popups, uiLoading } from '../../common/reducers'
import { combineReducers, handleActions } from '../../common/redux'
import { NAME } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Data Handler */
const dataHandler = handleActions({
  ...popups(NAME)
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
