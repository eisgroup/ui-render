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
 * Decorates a class method so that it is debounced by the specified duration
 * @Note:
 *   - the method will have to bind manually, and cannot be defined as class property arrow function
 *   - see `debounce()` method for docs
 *
 * @example:
 *   class Search extends Component {
 *     @debounceBy(200)
 *     handleSearch () {...}
 *   }
 *
 * @param {Number} [duration] - milliseconds to delay
 * @param {Object} [options] - for debounce
 * @returns {Function} decorator - for class method
 */
export function debounceBy (duration, options) {
	return function innerDecorator (target, key, descriptor) {
		return {
			configurable: true,
			enumerable: descriptor.enumerable,
			get: function getter () {
				// Attach this function to the instance (not the class)
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: descriptor.enumerable,
					value: debounce(descriptor.value, duration, options),
				})
				return this[key]
			},
		}
	}
}

/**
 * Decorates a class method so that it is throttled by the specified duration
 * @Note:
 *   - the method will have to bind manually, and cannot be defined as class property arrow function
 *   - see `throttle()` method for docs
 *
 * @example:
 *   class Search extends Component {
 *     @throttleBy(200)
 *     handleSearch () {...}
 *   }
 *
 * @param {Number} [duration] - milliseconds to delay
 * @param {Object} [options] - for throttle
 * @returns {Function} decorator - for class method
 */
export function throttleBy (duration = TIME_DURATION_INSTANT, options) {
	return function innerDecorator (target, key, descriptor) {
		return {
			configurable: true,
			enumerable: descriptor.enumerable,
			get: function getter () {
				// Attach this function to the instance (not the class)
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: descriptor.enumerable,
					value: throttle(descriptor.value, duration, options),
				})
				return this[key]
			},
		}
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
