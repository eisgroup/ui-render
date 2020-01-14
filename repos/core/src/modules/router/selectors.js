import { createSelector } from 'reselect'
import { get, logSelector } from '../../common/utils'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

export const activeRoute = createSelector(
  state => get(state, `${NAME}.location.pathname`),
  (val) => {
    logSelector(`${NAME} activeRoute`, val)
    return val
  }
)
