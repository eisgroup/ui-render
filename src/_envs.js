import { LANGUAGE } from './constants'

/* Environment Variables */
export let ENV = typeof process !== 'undefined' ? process.env : {}
if (!Object.keys(ENV).length) {
  // Must create dynamic require using process.env as condition to avoid error in CRA
  ENV = require(process.env.REACT_APP_NAME ? './constants' : './_envsNext') || {}
}
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
  iconClass: '', // CSS className for <Icon />
  iconClassPrefix: 'icon-', // CSS className prefix for <Icon />
  client: undefined, // Apollo client
  log: undefined, // backend console logger
  passwordCheck: () => {}, // password strength calculator
  user: {}, // the current user, for quick access to user info, such as auth
  usersById: {} // for storing temporary info, like user.lastOnline
}
