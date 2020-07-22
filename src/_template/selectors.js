import selector from 'utils-pack/selectors'
import { NAME as _TEMPLATE } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(_TEMPLATE)
export default class select {

  static isLoading = () => [
    state => state[_TEMPLATE].isLoading,
    (val) => val
  ]
}

