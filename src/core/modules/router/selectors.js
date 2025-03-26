import { get } from 'ui-utils-pack'
import selector from 'ui-utils-pack/selectors'
import { ROUTER } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(ROUTER)
export default class select {
  static activeRoute = () => [
    (state) => get(state, `${ROUTER}.location.pathname`),
    (val) => val
  ]
}
