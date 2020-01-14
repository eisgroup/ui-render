import { combineReducers, handleActions } from '../redux'
import { toUniqueList } from '../utils'
import { ADD_ACTIONS_PENDING_NETWORK, CLEAR_ACTIONS_PENDING_NETWORK } from './constants'
import initState from './data'
// import modules, { auth, location } from './modules'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

// const authActions = modules.some(({NAME}) => auth.NAME === NAME) && {
//   [ADD_ACTIONS_PENDING_AUTH]: (state, {payload}) => {
//     return {
//       ...state,
//       actionsPendingAuth: toUniqueList([
//         ...state.actionsPendingAuth,
//         ...payload
//       ])
//     }
//   },
//   [CLEAR_ACTIONS_PENDING_AUTH]: (state) => {
//     return {
//       ...state,
//       actionsPendingAuth: []  // Clear all actions
//     }
//   }
// }
// const locationActions = modules.some(({NAME}) => location.NAME === NAME) && {
//   [ADD_ACTIONS_PENDING_LOCATION]: (state, {payload}) => {
//     return {
//       ...state,
//       actionsPendingLocation: toUniqueList([
//         ...state.actionsPendingLocation,
//         ...payload
//       ])
//     }
//   },
//   [CLEAR_ACTIONS_PENDING_LOCATION]: (state) => {
//     return {
//       ...state,
//       actionsPendingLocation: []  // Clear all actions
//     }
//   }
// }

/* Handler */
const data = handleActions({
  // ...authActions,
  // ...locationActions,
  [ADD_ACTIONS_PENDING_NETWORK]: (state, {payload}) => {
    return {
      ...state,
      actionsPendingNetwork: toUniqueList([
        ...state.actionsPendingNetwork,
        ...payload
      ])
    }
  },
  [CLEAR_ACTIONS_PENDING_NETWORK]: (state) => {
    return {
      ...state,
      actionsPendingNetwork: []  // Clear all actions
    }
  }
}, initState.data)

// const moduleHandlers = {}
// modules.forEach(module => { if (isFunction(module.reducer)) moduleHandlers[module.NAME] = module.reducer })
const allHandlers = combineReducers({
  data,
  // ...moduleHandlers
})

export default allHandlers
