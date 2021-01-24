import { createSelector } from 'reselect'
import { logSelector } from 'utils-pack'
import { API } from '../../constants'
import { NAME as AUTH } from './constants'

/**
 * Login Data - State Selector
 *
 * @param {Object} state - redux store
 * @return {Object} - login data state
 */
export const loginData = createSelector(
  (state) => state[API][AUTH].data,
  (data) => {
    logSelector(`${API} ${AUTH} Data`, data)
    return data
  }
)

/**
 * Login UI - State Selector
 *
 * @param {Object} state - redux store
 * @return {Object} - login ui state
 */
export const loginUi = createSelector(
  (state) => state[API][AUTH].ui,
  (ui) => {
    logSelector(`${API} ${AUTH} UI`, ui)
    return ui
  }
)

/**
 * API Token - State Selector
 *
 * @param {Object} state - redux store
 * @return {string|null} - api token
 */
export const token = createSelector(
  (state) => state[API][AUTH].data.token,
  (key) => {
    logSelector(`${API} ${AUTH} Token`, key)
    return key
  }
)
