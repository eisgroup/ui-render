import selector from 'ui-utils-pack/selectors'
import { _TEMPLATE } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(_TEMPLATE)
export default class select {

  static loading = () => [
    state => state[_TEMPLATE].loading,
    (val) => val
  ]
}

