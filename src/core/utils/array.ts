import { flatten, get, isPlainObject } from './lodash-lite'

/**
 * ARRAY FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * @Note on the types (§9.6-E1): these helpers are deliberately polymorphic, exactly like the
 * lodash-lite subset they build on. The types stay LOOSE on purpose — `unknown` for values that are
 * only inspected, element generics where the runtime passes a value through, and no tightening of
 * what any function accepts at runtime.
 */

/** Anything walked with a computed string key once the value is known to be object-like. */
type Obj = Record<string, unknown>

/**
 * Anything `isEqualList` compares: it reads `.length` and enumerable index keys off both arguments,
 * which is what an array, an array-like or a string gives it at runtime.
 */
type MaybeIndexed = { length?: unknown, [key: string]: unknown }

/**
 * A user supplied compare function, as taken by {@link by}.
 * @Note: the parameters are `any` on purpose — `unknown` there would reject every caller that
 *    annotates its own comparator, e.g. `by((a: Row, b: Row) => …)`.
 */
type CompareFn = (a: any, b: any) => number

/**
 * Check if the data passed is an array and has values.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function hasListValue (data: unknown): boolean {
  return (isList(data) && data.length > 0)
}

/**
 * Check if the data passed is an array or plain object.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function isCollection (data: unknown): boolean {
  return (!!data && ((data as { constructor?: unknown }).constructor === Array || isPlainObject(data)))
}

/**
 * Check if Given Arrays are Equal in Values by Element References
 *
 * @param {Array|*} a
 * @param {Array|*} b
 * @returns {Boolean} true - if all elements of `a` are equal to all elements of `b` using exact equality match
 */
export function isEqualList (a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a && b && (a as MaybeIndexed).length !== (b as MaybeIndexed).length) return false
  if (!a || !b) return false
  for (const i in (a as MaybeIndexed)) {
    if ((a as MaybeIndexed)[i] !== (b as MaybeIndexed)[i]) return false
  }
  return true
}

/**
 * Check if the data passed is an array.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function isList (data: unknown): data is unknown[] {
  return (!!data && (data as { constructor?: unknown }).constructor === Array)
}

/**
 * Check if any of the values passed in via ...args exists within the array passed.
 *
 * @param {Array} array - the array to search for the values
 * @param {*} args - the values to search for
 */
export function isInListAny (array: readonly unknown[], ...args: unknown[]): boolean {
  for (const value of args) {
    if (array.indexOf(value) >= 0) {
      return true
    }
  }
  return false
}

/**
 * Converts Any Value to Array (or keep it as is if already Array)
 *
 * @param {*} value - the value to convert
 * @param {*} [clean] - if truthy, remove falsey values: false, null, 0, "", undefined, and NaN
 * @return {Array}
 */
export function toList<T> (value: T | T[], clean?: unknown): T[]
export function toList (value: unknown, clean?: unknown): unknown[] {
  if (!isList(value)) value = [value]
  return clean ? (value as unknown[]).filter(v => v) : (value as unknown[])
}

/**
 * Compute the Total Number from Array Element Values
 * @Note: ~2.5 times faster than array.reduce() in Node.js
 * @example:
 *    toListValuesTotal([{count: 1}, {count: 2}], 'count')
 *    >>> 3
 *
 * @param {Array} array - list of objects to calculate total values for
 * @param {String} [key] - object key to extract values from
 * @param {Number} [fallback] - default value to use when not a number encountered
 * @returns {Number} total - of all element values
 */
export function toListValuesTotal (array: ReadonlyArray<Obj> = [], key: string = 'value', fallback: number = 0): number {
  let sum = 0
  for (const obj of array) {
    // the cast mirrors the runtime: non-numeric and missing values fall back to `fallback`
    sum += (obj[key] as number) || fallback
  }
  return sum
}

/**
 * Gets the last value of array
 *
 * @param {Array} array - The array to query
 * @return {*} - The last element of the given array
 */
export function last<T> (array: readonly T[]): T {
  return array[array.length - 1]
}

/**
 * Sort List in Ascending Order
 * (Fastest)
 *
 * Exported for its unit tests: no other module imports it.
 *
 * @example:
 *    array.sort(sortAscending)
 *
 * @param {*} a - first value in the iteration
 * @param {*} b - second value in the iteration
 * @return {number} - whether values should be re-arranged
 * @Note: the casts below stand for JS's own relational ordering, which applies to any pair of
 *    values (numbers, strings, dates, mixed) and which the type system cannot express.
 */
export function sortAscending (a: unknown, b: unknown): number {
  if ((a as number) < (b as number)) return -1
  if ((a as number) > (b as number)) return 1
  return 0
}

/**
 * Sort List in Descending Order
 * (Fastest)
 *
 * Exported for its unit tests: no other module imports it.
 *
 * @example:
 *    array.sort(sortDescending)
 *
 * @param {*} a - first value in the iteration
 * @param {*} b - second value in the iteration
 * @return {number} - whether values should be re-arranged
 */
export function sortDescending (a: unknown, b: unknown): number {
  if ((a as number) < (b as number)) return 1
  if ((a as number) > (b as number)) return -1
  return 0
}

/**
 * Sort List By Object Properties or custom sort Function (with optional chaining)
 * (Moderately Fast)
 *
 * @example:
 *    // sort objects by descending 'name' length property, then by descending 'name', then by given function,
 *    // useful in situations when 'name' is a string containing numbers
 *    array.sort(by('-name.length', '-name', (a, b) => a.localCompare(b)))
 *
 * @param {String|Function} args - compare function, object Key, or Path (prepend string with '-' for descending)
 */
export function by (...args: Array<string | CompareFn>): (a: unknown, b: unknown) => number {
  return (a, b) => {
    let result = 0

    // Loop through given sort arguments
    for (let key of args) {
      if (key.constructor === String) {
        if ((key as string).indexOf('-') === 0) {
          key = (key as string).substring(1)
          if (key.indexOf('.') > 0) {
            result = sortDescending(get(a, key), get(b, key))
          } else {
            result = sortDescending((a as Obj)[key], (b as Obj)[key])
          }
        } else {
          if ((key as string).indexOf('.') > 0) {
            result = sortAscending(get(a, key), get(b, key))
          } else {
            result = sortAscending((a as Obj)[key as string], (b as Obj)[key as string])
          }
        }

        // exit function when has sorting to perform,
        // else keep looping to the next sort argument
        if (result) return result
      } else if (key.constructor === Function) {
        result = (key as CompareFn)(a, b)

        // exit function when has sorting to perform,
        // else keep looping to the next sort argument
        if (result) return result
      }
    }

    return result
  }
}

// LODASH CLONES
// -----------------------------------------------------------------------------

/**
 * Flatten an Array a single level deep
 *
 * @param {Array} array - The array to flatten
 * @return {Array} - The new flattened array
 */
export const toFlatList = flatten
