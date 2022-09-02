import { createSelector } from 'reselect'
import { logSelector } from 'ui-utils-pack'
import { API } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

/* Actions Pending Authentication */
export const actionsPendingAuth = createSelector(
  (state) => state[API].data.actionsPendingAuth,
  (val = []) => {
    logSelector(`${API} actionsPendingAuth`, val)
    return val
  }
)

/* Actions Pending Location */
export const actionsPendingLocation = createSelector(
  (state) => state[API].data.actionsPendingLocation,
  (val = []) => {
    logSelector(`${API} actionsPendingLocation`, val)
    return val
  }
)

/* Actions Pending Network */
export const actionsPendingNetwork = createSelector(
  (state) => state[API].data.actionsPendingNetwork,
  (val = []) => {
    logSelector(`${API} actionsPendingNetwork`, val)
    return val
  }
)
