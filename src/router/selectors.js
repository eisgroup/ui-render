import { get } from 'utils-pack'
import selector from 'utils-pack/selectors'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {
  static activeRoute = () => [
    (state) => get(state, `${NAME}.location.pathname`),
    (val) => val
  ]
}
