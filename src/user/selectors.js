import { DEFAULT } from 'modules-pack/variables'
import selector from 'utils-pack/selectors'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {
  static self = () => [
    (state) => state[NAME].self,
    (val) => val || {}
  ]

  static id = () => [
    (state) => state[NAME].self.id,
    (val) => val
  ]

  static role = () => [
    (state) => state[NAME].self.role,
    (val) => val
  ]

  static isLoggedIn = () => [
    (state) => state[NAME].self.updated,
    (updated) => Date.now() - updated < DEFAULT.LOGIN_DURATION
  ]

  static ui = () => [
    state => state[NAME].ui,
    (val) => val || {}
  ]
}

