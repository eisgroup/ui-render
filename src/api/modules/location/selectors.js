import { createSelector } from 'reselect'
import { logSelector } from 'utils-pack'
import { API } from '../../constants'
import { NAME as LOCATION } from './constants'

/**
 * User Location GeoJSON Object - State Selector
 *
 * @param {Object} state - redux store
 * @return {Object|null|0} - geoJSON object containing user's location if available
 */
export const geoJSON = createSelector(
  (state) => state[API][LOCATION].geoJSON,
  (geoObj) => {
    logSelector(`${API} ${LOCATION} GeoJON`, geoObj)
    return geoObj
  }
)
