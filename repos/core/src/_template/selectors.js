import selector from '../common/selector'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {

  static ui = () => [
    state => state[NAME].ui,
    (val) => val || {}
  ]
}

