import selector from '../../common/selector'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {
  static self = () => [
    (state) => state[NAME].data.self,
    (val) => val || {}
  ]

  static id = () => [
    (state) => state[NAME].data.self.id,
    (val) => val
  ]

  static role = () => [
    (state) => state[NAME].data.self.role,
    (val) => val
  ]

  static ui = () => [
    state => state[NAME].ui,
    (val) => val || {}
  ]
}

