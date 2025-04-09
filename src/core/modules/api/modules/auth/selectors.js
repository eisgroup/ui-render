import { createSelector } from 'reselect'
import { API } from '../../constants'
import { NAME as AUTH } from './constants'

/**
 * API Token - State Selector
 *
 * @param {Object} state - redux store
 * @return {string|null} - api token
 */
export const token = createSelector(
  (state) => state[API][AUTH].data.token,
  (key) => {
    return key
  }
)
