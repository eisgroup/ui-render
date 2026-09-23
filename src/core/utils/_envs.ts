import { LANGUAGE } from './constants'

/** One of the language definitions declared in `constants.ts` (e.g. `LANGUAGE.ENGLISH`) */
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE]

/** The `_` code of a language definition (e.g. `'en'`, `'zh_CN'`) */
export type LanguageCode = Language['_']

/** Password strength calculator, compatible with the subset of `zxcvbn` that is actually used */
export type PasswordCheck = (password?: string) => {score: number}

/** Global translate function - strings are localised, everything else passes through unchanged */
export type Translate = <T>(value: T) => T

/**
 * Shape of the globally accessible `Active` object.
 * @note: every slot is a mutable runtime injection point, so the env-dependent ones are typed
 *    `unknown` (narrow before use) and the index signature admits the extra props that platform
 *    code attaches at runtime (`Field`, `renderField`, `UIRender`, `SERVICE`, `state`, ...).
 */
export interface ActiveEnv {
  [key: string]: unknown

  DEFAULT: {LANGUAGE: LanguageCode}
  LANG: Language
  Storage: unknown
  WebSocket: unknown
  history: unknown
  iconClass: string
  iconClassPrefix: string
  client: unknown
  log: unknown
  user: Record<string, unknown>
  usersById: Record<string, unknown>
  translate: Translate
  /** Storage slot behind the `passwordCheck` accessor pair */
  zxcvbn?: PasswordCheck
  passwordCheck: PasswordCheck | undefined
}

/**
 * Environment Variables
 * @note: for Next.js, explicitly set variable on initialisation like so:
 *   import config from 'next/config'
 *   import { ENV } from './index'
 *
 *   Object.assign(ENV, config().publicRuntimeConfig)
 */
export let ENV: Record<string, string | undefined> = (typeof process !== 'undefined' && process.env) || {}
export const NODE_ENV: string | undefined = ENV.NODE_ENV // @Note: Next.js does not automatically add NODE_ENV, set inside next.config.js
export const __PROD__: boolean = NODE_ENV === 'production'
export const __STAGE__: boolean = NODE_ENV === 'stage'
export const __TEST__: boolean = NODE_ENV === 'test'
export const __DEV__: boolean = NODE_ENV === 'development'
export const __CLIENT__: boolean = typeof window !== 'undefined'
export const __BACKEND__: boolean = !__CLIENT__
export const __IOS__: boolean = false
export const _INIT_: boolean = __BACKEND__ && (__PROD__ || __STAGE__)
export const _WORK_DIR_: string = typeof process !== 'undefined' ? process.cwd() : '.' // relative to root `index.js`
export const UNDEFINED: undefined = ((Undefined?: undefined) => Undefined)()

/* Globally Accessible Objects */
export const Active: ActiveEnv = {
  // will be overridden at runtime, used for avoiding circular import and env-dependent libraries
  DEFAULT: {LANGUAGE: LANGUAGE.ENGLISH._},
  LANG: LANGUAGE.ENGLISH, // currently used language
  Storage: typeof localStorage !== 'undefined' ? localStorage : undefined, // LocalStorage for Node
  WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined, // WebSocket for Node
  history: {}, // Cross Platform route history object
  iconClass: '', // CSS className for <Icon />
  iconClassPrefix: 'icon-', // CSS className prefix for <Icon />
  client: undefined, // Apollo client
  log: undefined, // backend console logger
  user: {}, // the current user, for quick access to user info, such as auth
  usersById: {}, // for storing temporary info, like user.lastOnline
  translate: (value) => value, // Global translate function

  /**
   * Password Strength Calculator
   * @example: <script async src="/static/zxcvbn.js"/>
   *    - Frontend uses async script in <head/> section to load static zxcvbn.js for faster page load.
   *    - Backend should override this prop with `Active.passwordCheck = require('zxcvbn')`
   * @returns {zxcvbn|(function(): {score: number})|*}
   */
  get passwordCheck (): PasswordCheck | undefined {
    // When not loaded, skip password validation in frontend
    if (typeof window !== 'undefined') return (window as unknown as {zxcvbn?: PasswordCheck}).zxcvbn || (() => ({score: Infinity}))
    return this.zxcvbn
  },
  set passwordCheck (zxcvbn: PasswordCheck | undefined) {
    this.zxcvbn = zxcvbn
  }
}
