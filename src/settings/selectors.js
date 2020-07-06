import { Active, findObjByKeys, isInList, LANGUAGE } from 'utils-pack'
import selector from 'utils-pack/selectors'
import routerSelect from '../../todo/router/selectors'
import userSelect from '../../todo/user/selectors'
import { CURRENCY, DEFAULT, ROUTES } from '../variables'
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
      Active.CURRENCY = findObjByKeys(CURRENCY, {code: val}) || findObjByKeys(CURRENCY, {code: DEFAULT.CURRENCY})
      return val
    }
  ]

  static language = () => [
    (state) => state[NAME].data.language,
    (val) => { // @note: do not add default language here to trigger setLanguageFlow saga
      Active.LANG = findObjByKeys(LANGUAGE, {code: val}) || LANGUAGE.ENGLISH
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
      routerSelect.activeRoute,
      userSelect.role,
      userSelect.isLoggedIn,
      (activeRoute, userRole, isLoggedIn) => {
        if (isInList(ROUTES.WITHOUT_NAV, activeRoute)) return []
        return ROUTES.FOR_NAV.filter(r => {
          if (r.userRoles != null && !isInList(r.userRoles, userRole)) return false
          if (r.isLoggedIn != null && r.isLoggedIn !== isLoggedIn) return false
          return true
        })
      }
    ]
  }
}
