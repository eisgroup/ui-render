import { createSelector } from 'reselect'
import { logSelector } from 'utils-pack'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

/* Actions Pending Authentication */
export const actionsPendingAuth = createSelector(
  (state) => state[NAME].data.actionsPendingAuth,
  (val = []) => {
    logSelector(`${NAME} actionsPendingAuth`, val)
    return val
  }
)

/* Actions Pending Location */
export const actionsPendingLocation = createSelector(
  (state) => state[NAME].data.actionsPendingLocation,
  (val = []) => {
    logSelector(`${NAME} actionsPendingLocation`, val)
    return val
  }
)

/* Actions Pending Network */
export const actionsPendingNetwork = createSelector(
  (state) => state[NAME].data.actionsPendingNetwork,
  (val = []) => {
    logSelector(`${NAME} actionsPendingNetwork`, val)
    return val
  }
)
