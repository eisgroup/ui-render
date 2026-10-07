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

/*
 * NODE_ENV and REACT_APP_HOMEPAGE are read through the LITERAL expressions `process.env.NODE_ENV` and
 * `process.env.REACT_APP_HOMEPAGE` — never off `ENV`, and with no `typeof process` test in front of them.
 * A bundler define (webpack's `mode`/DefinePlugin, dotenv-webpack, esbuild/Vite `define`) substitutes only
 * that exact expression. `ENV.NODE_ENV` is invisible to it, so until this was changed whatever `process.env`
 * itself became decided the flags instead: dotenv-webpack's `{}` stub made every flag false in the demo's
 * browser bundles, dev and production alike. The try/catch is the fallback for a runtime where nothing
 * substituted the expression and `process` does not exist.
 *
 * The published library is unaffected by design: its build defines `process.env` as a whole, so both reads
 * compile to that literal (NODE_ENV "production", no homepage), exactly as before — see
 * webpack.library.config.mjs and scripts/test-env-flags.js.
 */
let nodeEnv: string | undefined
try {
  nodeEnv = process.env.NODE_ENV
} catch {
  nodeEnv = undefined
}
let homepage: string | undefined
try {
  homepage = process.env.REACT_APP_HOMEPAGE
} catch {
  homepage = undefined
}
export const NODE_ENV: string | undefined = nodeEnv // @Note: Next.js does not automatically add NODE_ENV, set inside next.config.js
/** Base path the app is served under, without a trailing slash (`''` at the root, undefined when unset) */
export const HOMEPAGE: string | undefined = homepage
export const __PROD__: boolean = NODE_ENV === 'production'
export const __DEV__: boolean = NODE_ENV === 'development'

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
