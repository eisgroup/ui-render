import _ from 'lodash'
import { NOW, ONE_DAY, ONE_HOUR } from '../constants'
import { __DEV__ } from '../variables/_envs'
import { TIME_DURATION_INSTANT } from '../variables/configs'
import { isInListAny } from './array'
import { randomNumberInRange } from './number'
import { randomString } from './string'

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
    throw new TypeError(`${callerFunctionName} expected @value to be one of ${enums}, but got`, value)
  }
}

/**
 * Check if values provided do match, using given comparison operator
 *
 * @param {string} type - comparison operator (i.e. enum(['AND', 'OR']))
 * @return {function<Array>} that takes boolean arguments and return true or false based on match type
 */
export function matchByType (type) {
  enumCheck(['AND', 'OR'], type, this)
  return {
    'AND': (...args) => !args.some(v => !v),
    'OR': (...args) => args.some(v => v)
  }[type]
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
          value: debounce(descriptor.value, duration, options)
        })
        return this[key]
      }
    }
  }
}

/**
 * Delay given Function execution
 *
 * @param {Function} func - to call
 * @param {Number} [wait] - milliseconds to delay
 * @param {Boolean} [leading] - whether to execute the Function immediately first
 */
export function debounce (func, wait = TIME_DURATION_INSTANT, {leading} = {}) {
  let timeout
  return function () {
    const self = this
    const args = arguments

    function later () {
      timeout = null
      if (!leading) func.apply(self, args)
    }

    const callNow = leading && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(self, args)
  }
}

/**
 * Mock Data for Testing
 */
export const testMock = {
  i: 0,
  dayCount: 0,
  hourCount: 0,

  /* Get Decrementing Day From Now */
  get dayDecrementing () {
    return NOW - ONE_DAY * this.dayCount++
  },

  /* Get Decrementing Hour From Now */
  get hourDecrementing () {
    return NOW - ONE_HOUR * this.hourCount++
  },

  get id () {
    return randomString(7, 7)
  },

  get index () {
    return this.i++
  },

  get number () {
    return randomNumberInRange(1, 1000000)
  }
}

/**
 * LODASH CLONES ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * A wrapper around the lodash's throttle function.
 * @see {@link https://lodash.com/docs/4.17.2#throttle) for further information.
 * @param func
 * @param wait
 * @param options
 */
export function throttle (func, wait = TIME_DURATION_INSTANT, options = {}) {
  return _.throttle(func, wait, options)
}
