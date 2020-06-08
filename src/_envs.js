import { LANGUAGE } from './constants'

/* Environment Variables */
export const ENV = typeof process !== 'undefined' ? process.env : {}
export const NODE_ENV = ENV.NODE_ENV
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
export const ACTIVE = {
	// will be overridden at runtime, used for avoiding circular import and env-dependent libraries
	LANG: LANGUAGE.ENGLISH, // currently used language
	storage: typeof localStorage !== 'undefined' ? localStorage : undefined, // LocalStorage for Node
	WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined, // WebSocket for Node
}
