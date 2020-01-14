import selector from '../../common/selector'
import { NAME, POPUP_ALERT, POPUP_CONFIRM, POPUP_ERROR } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {

  static activePopups = () => [
    state => state[NAME].data.activePopups,
    (val) => val
  ]

  static alert = () => [
    state => state[NAME].data[POPUP_ALERT],
    (val) => val
  ]

  static confirm = () => [
    state => state[NAME].data[POPUP_CONFIRM],
    (val) => val
  ]

  static error = () => [
    state => state[NAME].data[POPUP_ERROR],
    (val) => val
  ]

  static ui = () => [
    state => state[NAME].ui,
    val => val || {}
  ]
}

