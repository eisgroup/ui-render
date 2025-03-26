import { hasStaffOrHigherRole, isAdmin, isCompany, isIndividual, isStaff } from 'ui-modules-pack/user/logic'
import { DEFAULT } from 'ui-modules-pack/variables'
import { Active } from 'ui-utils-pack'
import selector from 'ui-utils-pack/selectors'
import { USER } from './constants'

// noinspection JSPotentiallyInvalidUsageOfClassThis
/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(USER)
export default class select {
  static self = () => [
    (state) => state[USER].self,
    (val) => Active.user = val || {}
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

  // This selector is used to compute whether to show Login or Signup popup, without identifying user
  static lastLogin = () => [
    (state) => state[USER].self.lastLogin,
    (val) => val
  ]

  static loading = () => [
    state => state[USER].loading,
    (val) => val || {}
  ]

  static isLoggedIn = () => [
    (state) => state[USER].self.id,
    (state) => state[USER].self.lastLogin,
    (id, lastLogin) => (Active.user.isLoggedIn = (!!id && (Date.now() - lastLogin) < DEFAULT.LOGIN_DURATION))
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

  static hasStaffOrHigherRole = function () {
    return [
      this.role,
      hasStaffOrHigherRole,
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
