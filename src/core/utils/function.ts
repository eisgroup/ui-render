import { throttle as _throttle } from './lodash-lite'
import { __DEV__ } from './_envs'
import { isInListAny } from './array'
import { TIME_DURATION_INSTANT } from './constants'

/**
 * FUNCTION HELPERS ============================================================
 * =============================================================================
 */

/**
 * Any callable, used ONLY as the constraint of the `debounce`/`throttle` generics.
 *
 * `never[]` is what makes it accept every concrete function type a caller already has, without
 * this module dictating what that function may take; `Parameters<F>`/`ReturnType<F>` then recover
 * the caller's real signature for the wrapper it gets back.
 */
type AnyFn = (...args: never[]) => unknown

/** What `debounce` returns: the wrapper, plus the `cancel` added at §9.3 step 4. */
export type Debounced<F extends AnyFn> =
	((this: unknown, ...args: Parameters<F>) => void) & { cancel: () => void }

/** The option bag `debounce` reads — only `leading`, exactly as at runtime. */
type DebounceOptions = { leading?: boolean }

/** The option bag `throttle` forwards verbatim to the lodash-lite implementation. */
type ThrottleOptions = { leading?: boolean, trailing?: boolean }

/**
 * Checks if passed argument is of type function.
 *
 * @param {*} func - the thing we are checking for being a function
 * @return {boolean}
 */
export function isFunction (func: unknown): func is Function {
	// When 'GeneratorFunction' is defined globally, use it instead of isFunction.Generator
	return !!func && (
		(func as { constructor?: unknown }).constructor === Function ||
		(func as { constructor?: unknown }).constructor === isFunction.Async ||
		(func as { constructor?: unknown }).constructor === isFunction.Generator
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
export function isAsync (func: unknown): boolean {
	return (func as { constructor: { name: string } }).constructor.name === 'AsyncFunction'
}

/**
 * Check for a Valid Enumerable Value and Throw Error If It's Not
 *
 * @param {Array} enums - valid enum values
 * @param {*} value - variable to check against enum
 * @param {Function} [self] - optional, the caller function's ${this} context
 */
export function enumCheck (enums: readonly unknown[], value: unknown, self?: unknown): void {
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
export function debounce<F extends AnyFn> (
	func: F, wait: number = TIME_DURATION_INSTANT, { leading }: DebounceOptions = {},
): Debounced<F> {
	let timeout: ReturnType<typeof setTimeout> | null | undefined
	let trailingCall = false
	const debounced = function(this: unknown) {
		const self = this
		const args = arguments

		function later () {
			timeout = null
			if (!leading || trailingCall) (func as unknown as (this: unknown, ...a: unknown[]) => unknown)
				.apply(self, args as unknown as unknown[])
			trailingCall = false
		}

		const callNow = leading && !timeout
		if (timeout) {
			clearTimeout(timeout)
			if (leading) trailingCall = true
		}
		timeout = setTimeout(later, wait)
		if (callNow) (func as unknown as (this: unknown, ...a: unknown[]) => unknown)
			.apply(self, args as unknown as unknown[])
	} as Debounced<F>

	/**
	 * Drop a pending trailing call. Added at §9.3 step 4, because two catalogued hazards — AutoSave's
	 * debounce outliving its component, and the shared-prototype `handleChangeInput` — cannot be fixed
	 * without it: there was no way to stop a scheduled call, only to let it fire into a dead instance.
	 *
	 * It does NOT undo a `leading` call that already ran; that one is history by the time anyone can
	 * cancel. It clears the timer and the trailing flag, and the function stays reusable afterwards.
	 */
	debounced.cancel = function () {
		if (timeout) clearTimeout(timeout)
		timeout = null
		trailingCall = false
	}

	return debounced
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
export function throttle<F extends AnyFn> (
	func: F, wait: number = TIME_DURATION_INSTANT, options: ThrottleOptions = {},
): (this: unknown, ...args: Parameters<F>) => ReturnType<F> | undefined {
	return _throttle(func, wait, options)
}
