import selector from 'utils-pack/selectors'
import { POPUP, POPUP_ALERT, POPUP_CONFIRM, POPUP_ERROR } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(POPUP)
export default class select {

  static activePopups = () => [
    state => state[POPUP].data.activePopups,
    (val) => val
  ]

  static alert = () => [
    state => state[POPUP].data[POPUP_ALERT],
    (val) => val
  ]

  static confirm = () => [
    state => state[POPUP].data[POPUP_CONFIRM],
    (val) => val
  ]

  static error = () => [
    state => state[POPUP].data[POPUP_ERROR],
    (val) => val
  ]

  static ui = () => [
    state => state[POPUP].ui,
    val => val || {}
  ]
}

