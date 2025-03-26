import { createSelector } from 'reselect'
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
    return val
  }
)

/* Actions Pending Location */
export const actionsPendingLocation = createSelector(
  (state) => state[API].data.actionsPendingLocation,
  (val = []) => {
    return val
  }
)

/* Actions Pending Network */
export const actionsPendingNetwork = createSelector(
  (state) => state[API].data.actionsPendingNetwork,
  (val = []) => {
    return val
  }
)
