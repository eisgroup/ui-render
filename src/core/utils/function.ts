import { __DEV__ } from './_envs'
import { isInListAny } from './array'
import { TIME_DURATION_INSTANT } from './constants'

/**
 * FUNCTION HELPERS ============================================================
 * =============================================================================
 */

/**
 * Any callable, used ONLY as the constraint of the `debounce` generic.
 *
 * `never[]` is what makes it accept every concrete function type a caller already has, without
 * this module dictating what that function may take; `Parameters<F>`/`ReturnType<F>` then recover
 * the caller's real signature for the wrapper it gets back.
 */
type AnyFn = (...args: never[]) => unknown

/** What `debounce` returns: the wrapper, plus the `cancel` added at §9.3 step 4 and the `flush` of 2026-10-09. */
export type Debounced<F extends AnyFn> =
	((this: unknown, ...args: Parameters<F>) => void) & { cancel: () => void, flush: () => void }

/** The option bag `debounce` reads — only `leading`, exactly as at runtime. */
type DebounceOptions = { leading?: boolean }

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
	// The latest call's `this` and arguments, which are what the trailing call runs with. Each call used to
	// close over its own in a `later` of its own, and only the latest call's timer survived, so this is
	// the same call; kept outside so that `flush` can make it.
	let lastThis: unknown
	let lastArgs: unknown[] = []
	const invoke = () => (func as unknown as (this: unknown, ...a: unknown[]) => unknown).apply(lastThis, lastArgs)

	function later () {
		timeout = null
		if (!leading || trailingCall) invoke()
		trailingCall = false
	}

	const debounced = function(this: unknown) {
		lastThis = this
		lastArgs = Array.prototype.slice.call(arguments)

		const callNow = leading && !timeout
		if (timeout) {
			clearTimeout(timeout)
			if (leading) trailingCall = true
		}
		timeout = setTimeout(later, wait)
		if (callNow) invoke()
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

	/**
	 * Make a pending trailing call now, rather than when its timer runs out, and leave nothing pending.
	 * What `cancel` would drop, `flush` delivers: a component going away saves the change it was
	 * waiting to save, instead of losing it (AutoSave, and `autoSubmit` in the engine).
	 */
	debounced.flush = function () {
		if (!timeout) return
		clearTimeout(timeout)
		later()
	}

	return debounced
}
