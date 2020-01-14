import { ONE_HOUR } from '../../common/constants'
import selector from '../../common/selector'
import { NAME } from './constants'
import { USER } from './definitions'

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

  static id = function () {
    return [
      this.self,
      (user) => user.id
    ]
  }

  static location = function () {
    return [
      this.self,
      (user) => user.location
    ]
  }

  static role = function () {
    return [
      this.self,
      (user) => user.role || USER.ROLE.MODEL.code
    ]
  }

  static type = function () {
    return [
      this.self,
      (user) => user.type || USER.TYPE.FREELANCER.code
    ]
  }

  static payInterval = function () {
    return [
      this.self,
      (user) => {
        const {modeling: {pay: {interval} = {}} = {}} = user
        return interval || ONE_HOUR
      }
    ]
  }

  static isClient = function () {
    return [
      this.role,
      (role) => role === USER.ROLE.CLIENT.code
    ]
  }

  static isModel = function () {
    return [
      this.role,
      (role) => role === USER.ROLE.MODEL.code
    ]
  }

  static isCompany = function () {
    return [
      this.type,
      (type) => type === USER.TYPE.COMPANY.code
    ]
  }

  static isFreelancer = function () {
    return [
      this.type,
      (type) => type === USER.TYPE.FREELANCER.code
    ]
  }

  static isPerHourPay = function () {
    return [
      this.payInterval,
      (interval) => interval === ONE_HOUR
    ]
  }

  static ui = () => [
    state => state[NAME].ui,
    (val) => val || {}
  ]
}

