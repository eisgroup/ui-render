import { LANGUAGE } from '../../common/constants'
import selector from '../../common/selector'
import { findObjByKeys, isInList } from '../../common/utils'
import { ACTIVE, CURRENCY, DEFAULT, ROUTES_FOR_NAV } from '../../common/variables'
import userSelect from '../user/selectors'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */


@selector(NAME)
export default class select {
  static country = () => [
    (state) => state[NAME].data.country,
    (val) => val
  ]

  static currency = () => [
    (state) => state[NAME].data.currency,
    (val) => {
      ACTIVE.CURRENCY = findObjByKeys(CURRENCY, {code: val}) || findObjByKeys(CURRENCY, {code: DEFAULT.CURRENCY})
      return val
    }
  ]

  static language = () => [
    (state) => state[NAME].data.language,
    (val = DEFAULT.LANGUAGE) => {
      ACTIVE.LANG = findObjByKeys(LANGUAGE, {code: val})
      return val
    }
  ]

  static isOpenSidebar = () => [
    (state) => state[NAME].ui.isOpenSidebar,
    (val) => val
  ]

  static theme = () => [
    (state) => state[NAME].data.theme,
    (val) => val
  ]

  static ui = () => [
    (state) => state[NAME].ui,
    (val) => val
  ]

  static routesForNav = function () {
    return [
      userSelect.role,
      (userRole) => ROUTES_FOR_NAV.filter(r => !r.userRoles || isInList(r.userRoles, userRole))
    ]
  }
}
