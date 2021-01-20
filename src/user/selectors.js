import { DEFAULT } from 'modules-pack/variables'
import selector from 'utils-pack/selectors'
import { USER } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(USER)
export default class select {
  static self = () => [
    (state) => state[USER].self,
    (val) => val || {}
  ]

  static id = () => [
    (state) => state[USER].self.id,
    (val) => val
  ]

  static role = () => [
    (state) => state[USER].self.role,
    (val) => val
  ]

  static isLoggedIn = () => [
    (state) => state[USER].self.updated,
    (updated) => Date.now() - updated < DEFAULT.LOGIN_DURATION
  ]

  static loading = () => [
    state => state[USER].loading,
    (val) => val || {}
  ]
}

