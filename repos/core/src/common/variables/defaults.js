import { __PROD__, LANGUAGE, ONE_DAY, ONE_HOUR, ONE_WEEK } from 'utils-pack'
import { PINK, TEAL, VIOLET } from '../styles'
import { THEME } from './configs'
import { CURRENCY } from './definitions'

/**
 * PROJECT DEFAULTS ============================================================
 * =============================================================================
 */
export const DEFAULT = {
  LANGUAGE: LANGUAGE.ENGLISH._,
  CURRENCY: CURRENCY.USD._,
  LOGIN_DURATION: __PROD__ ? ONE_WEEK : ONE_DAY, // match `TOKEN_LIFESPAN_JWT`
  GRADIENT_COLORS: [PINK, TEAL, VIOLET],
  GRADIENT_HUE_COUNT: 3,
  PAY_INTERVAL: ONE_HOUR,
  THEME: THEME.LIGHT,
  SETTINGS: { // used as global state variable to avoid importing `settings` module when not possible
    HAS_SOUND: false,
  },
  WORK_TIME_PER_DAY: 8 * ONE_HOUR,
}
