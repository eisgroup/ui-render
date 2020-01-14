import { stateActionType } from '../../../actions'
import { handleActions } from '../../../redux'
import { ERROR } from '../../constants'
import { NAME as LOCATION, UPDATE } from './constants'
import initState from './data'

/**
 * ACTION HANDLERS =============================================================
 * Pure Functions Only - business logic to handle actions and update app state
 * =============================================================================
 */

/* Handler */
const handler = handleActions({

  [stateActionType(LOCATION, UPDATE)]: (state, {payload}) => {
    return {
      ...state,
      geoJSON: payload
    }
  },

  [stateActionType(LOCATION, ERROR)]: (state, {payload: {message} = {}}) => {
    // Alert error message once
    if (state.geoJSON || state.geoJSON === 0) {
      alert(`${message}\n\nPlease enable Location Services.`)
    }

    return {
      ...state,
      geoJSON: null  // Use to detect that Location is not available
    }
  }

}, initState)

export default handler
