import { FIVE_MINUTES, LANGUAGE, THIRTY_SECONDS, THREE_SECONDS, TWO_SECONDS } from '../constants'
import { ENV } from './_envs'

/**
 * APP CONFIGURATIONS ==========================================================
 * =============================================================================
 */

/* Client App */
export const APP_NAME = ENV.REACT_APP_NAME || 'APP_NAME'
export const APP_RELEASE_VERSION = parseFloat(ENV.REACT_APP_RELEASE_VERSION || '1.0')
export const APP_SUPPORT_TEAM_NAME = ENV.REACT_APP_SUPPORT_TEAM_NAME || 'Support'
export const PATH_IMAGES = '/static/images/'
export const PATH_SOUNDS = '/static/sounds/'
export const ANALYTICS_TRACKING_ID = ENV.REACT_APP_ANALYTICS_TRACKING_ID
export const CONTACT_EMAIL = ENV.REACT_APP_CONTACT_HOST + '@' + ENV.REACT_APP_CONTACT_SERVER

/* Network Configs */
export const API_REQUEST_TIMEOUT = Number(ENV.REACT_APP_API_REQUEST_TIMEOUT) || THIRTY_SECONDS
export const SOCKET_CONNECT_TIMEOUT = Number(ENV.REACT_APP_SOCKET_CONNECT_TIMEOUT) || THIRTY_SECONDS
export const STATE_ACTION_TIMEOUT = Number(ENV.REACT_APP_STATE_ACTION_TIMEOUT) || THIRTY_SECONDS
export const REQUEST_TIMEOUT_BACKOFF_DURATION = FIVE_MINUTES

/* Server */
export const QUERY_CACHE_TIME = Number(ENV.QUERY_CACHE_TIME) || TWO_SECONDS

/* UI */
export const SIZE_SCALE = 62.5  // match percentage of font-size defined in <html> root element
export const TIME_DURATION_INSTANT = 200  // Milliseconds - max delay that seems instant to human
export const TYPING_DELAY = 300  // Milliseconds - 300 is deal for debouncing input changes while typing
export const TOOLTIP_DELAY = 777  // Milliseconds
export const FORM_SYNC_THROTTLE = THREE_SECONDS  // Milliseconds - debounce input changes duration
export const ANIMATION_DURATION = 500  // Milliseconds - match with CSS @speed-base in /repos/web/style/_variables.less
export const LANGUAGE_OPTIONS = [LANGUAGE.ENGLISH, LANGUAGE.RUSSIAN] // enabled languages
export const THEME = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
}

/**
 * FOR TESTS -------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const TEST = {
  COUNT: 1
}
export const MOCK = {
  DATA_SEED: 7,
  UNIT_COUNT: 14,
}
