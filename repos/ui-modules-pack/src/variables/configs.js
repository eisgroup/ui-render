import { ENV, FIVE_MINUTES, LANGUAGE, THIRTY_SECONDS, THREE_SECONDS, TWO_SECONDS } from 'ui-utils-pack'

/**
 * APP CONFIGURATIONS ==========================================================
 * =============================================================================
 */

/* Network Configs */
export const API_REQUEST_TIMEOUT = Number(ENV.API_REQUEST_TIMEOUT || ENV.REACT_APP_API_REQUEST_TIMEOUT) || THIRTY_SECONDS
export const SOCKET_CONNECT_TIMEOUT = Number(ENV.SOCKET_CONNECT_TIMEOUT || ENV.REACT_APP_SOCKET_CONNECT_TIMEOUT) || THIRTY_SECONDS
export const STATE_ACTION_TIMEOUT = Number(ENV.STATE_ACTION_TIMEOUT || ENV.REACT_APP_STATE_ACTION_TIMEOUT) || THIRTY_SECONDS
export const REQUEST_TIMEOUT_BACKOFF_DURATION = Number(ENV.REQUEST_TIMEOUT_BACKOFF_DURATION || ENV.REACT_APP_REQUEST_TIMEOUT_BACKOFF_DURATION) || FIVE_MINUTES

/* Client App */
export const APP_NAME = ENV.APP_NAME || ENV.REACT_APP_NAME || 'APP_NAME'
export const APP_RELEASE_VERSION = parseFloat(ENV.APP_RELEASE_VERSION || ENV.REACT_APP_RELEASE_VERSION || '1.0')
export const APP_SUPPORT_TEAM_NAME = ENV.APP_SUPPORT_TEAM_NAME || ENV.REACT_APP_SUPPORT_TEAM_NAME || 'Support'
export const ANALYTICS_TRACKING_ID = ENV.REACT_APP_ANALYTICS_TRACKING_ID
export const CONTACT_EMAIL = ENV.REACT_APP_CONTACT_HOST + '@' + ENV.REACT_APP_CONTACT_SERVER

/* Configuration */
export const CONFIG = {
  LANGUAGE_OPTIONS: [LANGUAGE.ENGLISH, LANGUAGE.FRENCH] // enabled languages
}

/* Client */
export const CLIENT = {
  // add env variables for frontend
}

/* Server */
export const SERVER = {
  QUERY_CACHE_TIME: Number(ENV.QUERY_CACHE_TIME) || TWO_SECONDS
}

/* UI */
export const UI = {
  TYPING_DELAY: 300, // Milliseconds - 300 is ideal for debouncing input changes while typing
  TOOLTIP_DELAY: 777, // Milliseconds
  FORM_SYNC_THROTTLE: THREE_SECONDS, // Milliseconds - debounce input changes duration
  ANIMATION_DURATION: 500, // Milliseconds - match with CSS @speed-base in /repos/web/style/_variables.less
}

/* Theme Options */
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
