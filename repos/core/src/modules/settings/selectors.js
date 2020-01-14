import { LANGUAGE } from '../../common/constants'
import selector from '../../common/selector'
import { findObjByKeys } from '../../common/utils'
import { ACTIVE, CURRENCY, DEFAULT, ROUTES_FOR_NAV } from '../../common/variables'
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
    (val) => {
      ACTIVE.LANG = findObjByKeys(LANGUAGE, {code: val}) || findObjByKeys(LANGUAGE, {code: DEFAULT.LANGUAGE})
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
      () => ROUTES_FOR_NAV
    ]
  }
}
