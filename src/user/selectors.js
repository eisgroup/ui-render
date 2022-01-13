import { isAdmin, isCompany, isIndividual, isStaff } from 'modules-pack/user/logic'
import { DEFAULT } from 'modules-pack/variables'
import { Active } from 'utils-pack'
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

  static kind = () => [
    (state) => state[USER].self.kind,
    (val) => val
  ]

  static loading = () => [
    state => state[USER].loading,
    (val) => val || {}
  ]

  static isLoggedIn = () => [
    (state) => state[USER].self.updated,
    (updated) => (Active.user.isLoggedIn = ((Date.now() - updated) < DEFAULT.LOGIN_DURATION))
  ]

  static isAdmin = function () {
    return [
      this.role,
      isAdmin,
    ]
  }

  static isStaff = function () {
    return [
      this.role,
      isStaff,
    ]
  }

  static isCompany = function () {
    return [
      this.kind,
      isCompany,
    ]
  }

  static isIndividual = function () {
    return [
      this.kind,
      isIndividual,
    ]
  }
}

