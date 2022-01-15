import { Active } from 'utils-pack'

/**
 * ACTION CREATORS =============================================================
 * Works both using Next.js router and Browser react-router
 * =============================================================================
 */

/**
 * Open given Route as Modal overlaying existing Page/Scene
 * @param {String} route - URL to open
 * @param {Object} [state] - location state
 */
export function openModal (route, state = {}) {
  if (window.innerWidth <= 375) state.classNameModal = 'full-screen no-radius ' + (state.classNameModal || '')
  return Active.history.push({pathname: route, state: {isModal: true, ...state}})
}
