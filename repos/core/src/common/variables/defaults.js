import { LANGUAGE, ONE_HOUR } from '../constants'
import { THEME } from './configs'
import { CURRENCY } from './definitions'

/**
 * PROJECT DEFAULTS ============================================================
 * =============================================================================
 */
export const DEFAULT = {
  LANGUAGE: LANGUAGE.ENGLISH.code,
  CURRENCY: CURRENCY.USD.code,
  PAY_INTERVAL: ONE_HOUR,
  THEME: THEME.LIGHT,
  SETTINGS: { // used as global state variable to avoid importing `settings` module when not possible
    HAS_SOUND: false,
  },
  WORK_TIME_PER_DAY: 8 * ONE_HOUR,
}
