import { LANGUAGE } from './constants.js'

/**
 * Environment Variables
 * @note: for Next.js, explicitly set variable on initialisation like so:
 *   import config from 'next/config'
 *   import { ENV } from 'utils-pack'
 *
 *   Object.assign(ENV, config().publicRuntimeConfig)
 */
export let ENV = (typeof process !== 'undefined' && process.env) || {}
export const NODE_ENV = ENV.NODE_ENV // @Note: Next.js does not automatically add NODE_ENV, set inside next.config.js
export const __PROD__ = NODE_ENV === 'production'
export const __STAGE__ = NODE_ENV === 'stage'
export const __TEST__ = NODE_ENV === 'test'
export const __DEV__ = NODE_ENV === 'development'
export const __CLIENT__ = typeof window !== 'undefined'
export const __BACKEND__ = !__CLIENT__
export const __IOS__ = false
export const _INIT_ = __BACKEND__ && (__PROD__ || __STAGE__)
export const _SHOULD_SHOW_TEST_ = __DEV__
export const _WORK_DIR_ = typeof process !== 'undefined' ? process.cwd() : '.' // relative to root `index.js`
export const UNDEFINED = (Undefined => Undefined)()

/* Globally Accessible Objects */
export const Active = {
  // will be overridden at runtime, used for avoiding circular import and env-dependent libraries
  DEFAULT: {LANGUAGE: LANGUAGE.ENGLISH._},
  LANG: LANGUAGE.ENGLISH, // currently used language
  SETTINGS: {}, // User settings
  Storage: typeof localStorage !== 'undefined' ? localStorage : undefined, // LocalStorage for Node
  WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined, // WebSocket for Node
  history: {}, // Cross Platform route history object
  iconClass: '', // CSS className for <Icon />
  iconClassPrefix: 'icon-', // CSS className prefix for <Icon />
  client: undefined, // Apollo client
  log: undefined, // backend console logger
  user: {}, // the current user, for quick access to user info, such as auth
  usersById: {}, // for storing temporary info, like user.lastOnline

  /**
   * Password Strength Calculator
   * @example: <script async src="/static/zxcvbn.js"/>
   *    - Frontend uses async script in <head/> section to load static zxcvbn.js for faster page load.
   *    - Backend should override this prop with `Active.passwordCheck = require('zxcvbn')`
   * @returns {zxcvbn|(function(): {score: number})|*}
   */
  get passwordCheck () {
    // When not loaded, skip password validation in frontend
    if (typeof window !== 'undefined') return window.zxcvbn || (() => ({score: Infinity}))
    return this.zxcvbn
  },
  set passwordCheck (zxcvbn) {
    this.zxcvbn = zxcvbn
  }
}
