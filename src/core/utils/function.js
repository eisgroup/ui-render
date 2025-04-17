import { throttle as _throttle } from 'lodash-es'
import { __DEV__ } from './_envs.js'
import { isInListAny } from './array.js'
import { TIME_DURATION_INSTANT } from './constants.js'

/**
 * FUNCTION HELPERS ============================================================
 * =============================================================================
 */

/**
 * Checks if passed argument is of type function.
 *
 * @param {*} func - the thing we are checking for being a function
 * @return {boolean}
 */
export function isFunction (func) {
	// When 'GeneratorFunction' is defined globally, use it instead of isFunction.Generator
	return !!func && (
		func.constructor === Function ||
		func.constructor === isFunction.Async ||
		func.constructor === isFunction.Generator
	)
}

isFunction.Generator = (function * () {}).constructor
isFunction.Async = (async () => {}).constructor

/**
 * Check if given function is Asynchronous
 *
 * @param {Function} func - to check
 * @returns {Boolean} true - if it is
 */
export function isAsync (func) {
	return func.constructor.name === 'AsyncFunction'
}

/**
 * Check for a Valid Enumerable Value and Throw Error If It's Not
 *
 * @param {Array} enums - valid enum values
 * @param {*} value - variable to check against enum
 * @param {Function} [self] - optional, the caller function's ${this} context
 */
export function enumCheck (enums, value, self) {
	if (!__DEV__) return

	if (!isInListAny(enums, value)) {
		const callerFunctionName = isFunction(self) ? self.name : 'function'
		throw new TypeError(`${callerFunctionName} expected @value to be one of ${enums}, but got '${value}'`,)
	}
}

/**
 * Delay given Function execution
 *
 * @param {Function} func - to call
 * @param {Number} [wait] - milliseconds to delay
 * @param {Boolean} [leading] - whether to execute the Function immediately first
 * @returns {function(...[*]=)} - debounced
 */
export function debounce (func, wait = TIME_DURATION_INSTANT, { leading } = {}) {
	let timeout
	return function() {
		const self = this
		const args = arguments

		function later () {
			timeout = null
			func.apply(self, args)
		}

		const callNow = leading && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) {
			clearTimeout(timeout)
			func.apply(self, args)
		}
	}
}

/**
 * LODASH CLONES ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * A wrapper around the lodash's throttle function.
 * @see {@link https://lodash.com/docs/4.17.2#throttle) for further information.
 * @param {Function} func - to call
 * @param {Number} [wait] - milliseconds to delay
 * @param {Object} [options]
 * @returns {function(...[*]=)} - throttled
 */
export function throttle (func, wait = TIME_DURATION_INSTANT, options = {}) {
	return _throttle(func, wait, options)
}
