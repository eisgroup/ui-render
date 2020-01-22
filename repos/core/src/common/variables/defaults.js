import { LANGUAGE, ONE_HOUR } from '../constants'
import { GREEN, TEAL, VIOLET } from '../styles'
import { THEME } from './configs'
import { CURRENCY } from './definitions'

/**
 * PROJECT DEFAULTS ============================================================
 * =============================================================================
 */
export const DEFAULT = {
  LANGUAGE: LANGUAGE.ENGLISH.code,
  CURRENCY: CURRENCY.USD.code,
  GRADIENT_COLORS: [GREEN, TEAL, VIOLET],
  GRADIENT_HUE_COUNT: 3,
  PAY_INTERVAL: ONE_HOUR,
  THEME: THEME.LIGHT,
  SETTINGS: { // used as global state variable to avoid importing `settings` module when not possible
    HAS_SOUND: false,
  },
  WORK_TIME_PER_DAY: 8 * ONE_HOUR,
}
