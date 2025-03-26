import {
  difference,
  flatten,
  get,
  intersection,
  isEqual,
  isPlainObject,
  max,
  min,
  some,
  union,
  unionBy,
  unionWith,
  uniqWith,
} from 'lodash-es'
import { toLowerCaseAny } from './string.js'

/**
 * ARRAY FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Check if the data passed is an array and has values.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function hasListValue (data) {
  return (isList(data) && data.length > 0)
}

/**
 * Check if given lists have at least one intersecting value in each list
 *
 * @param {Array[]} lists - array of arrays to test
 * @return {boolean} - true if a common value is found among given lists
 */
export function hasCommonListValue (...lists) {
  // Find the list with the shortest length
  let listLength = Infinity
  let shortestList = []
  lists.forEach(list => {
    if (list.length < listLength) {
      listLength = list.length
      shortestList = list
    }
  })

  // If at least one value found among all lists, skip the loop and return true
  return shortestList.some(value => {
    // If value does not exist in at least one list, skip to next value
    return !lists.some(list => !isInList(list, value))
  })
}

/**
 * Check if given list contains primitive duplicate values
 * @Note: array.indexOf(NaN) always returns -1, even if the array has `NaN` value
 * @param {*[]} array - to check for duplicates
 * @returns {Boolean} true - if duplicate found
 */
export function hasDuplicateInList (array) {
  return array.some((value, index, self) => self.indexOf(value) !== index)
}

/**
 * Get All Indexes of Value in Array
 * @param {Array<*>} list - to search for index list
 * @param {*} value - to find indexes for
 * @returns {Number[]} index - list of value indexes, or empty array if nothing found
 */
export function indexesOf (list, value) {
  let indices = [], i = -1
  while ((i = list.indexOf(value, i + 1)) !== -1) {
    indices.push(i)
  }
  return indices
}

/**
 * Check if the data passed is an array or plain object.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function isCollection (data) {
  return (!!data && (data.constructor === Array || isPlainObject(data)))
}

/**
 * Check if Given Arrays are Equal in Values by Element References
 *
 * @param {Array|*} a
 * @param {Array|*} b
 * @returns {Boolean} true - if all elements of `a` are equal to all elements of `b` using exact equality match
 */
export function isEqualList (a, b) {
  if (a === b) return true
  if (a && b && a.length !== b.length) return false
  if (!a || !b) return false
  for (const i in a) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Check if the data passed is an array.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export function isList (data) {
  return (!!data && data.constructor === Array)
}

/**
 * Check if the value passed exists within the array passed.
 *
 * @param {Array} array - haystack
 * @param {*} value - needle
 * @return {boolean}
 */
export function isInList (array, value) {
  return array.indexOf(value) >= 0
}

/**
 * Check if any of the values passed in via ...args exists within the array passed.
 *
 * @param {Array} array - the array to search for the values
 * @param {*} args - the values to search for
 */
export function isInListAny (array, ...args) {
  for (const value of args) {
    if (array.indexOf(value) >= 0) {
      return true
    }
  }
  return false
}

/**
 * Check if a given Element exists in the Collection, with shallow include match
 *
 * @uses lodash
 * @see {@link https://lodash.com/docs/4.17.2#some} for further information.
 * @return {Boolean} true - if element found in given collection with shallow include match
 */
export function isInCollection (collection, element) {
  return some(collection, element)
}

/**
 * Check if any given Element exists in the Collection, with shallow include match
 *
 * @example:
 *    isInCollectionAny([{name: 'god', age: 'eternal'}], {name: 'dog'}, {name: 'god'})
 *    >>> true
 *
 * @param {Array|Object} collection - to search from
 * @param {*} elements - to search for
 * @return {boolean} true - if any of the given elements found in the collection
 */
export function isInCollectionAny (collection, ...elements) {
  for (const element of elements) {
    if (isInCollection(collection, element)) return true
  }
  return false
}

/**
 * Compare two Arrays and determine if they have the same values
 * @param array1
 * @param array2
 */
export function isSameList (array1, array2) {
  return isEqual(array1.sort(), array2.sort())
}

/**
 * Creates an array with all falsey values removed
 * (values false, null, 0, "", undefined, and NaN are falsey)
 *
 * @param {Array} array - the array to clean from falsey values
 * @return {Array} - returns the new array of filtered values
 */
export function cleanList (array) {
  return array.filter(v => v)
}

/**
 * Converts Any Value to Array (or keep it as is if already Array)
 *
 * @param {*} value - the value to convert
 * @param {*} [clean] - if truthy, remove falsey values: false, null, 0, "", undefined, and NaN
 * @return {Array}
 */
export function toList (value, clean) { // eslint-disable-line no-shadow
  if (!isList(value)) value = [value]
  return clean ? value.filter(v => v) : value
}

/**
 * Compute the Average Number from Array Elements
 *
 * @param {Array} array - list of numbers to calculate average of
 * @returns {number} - the average value
 */
export function toListAvg (array) {
  let sum = 0
  for (const value of array) {
    sum += value
  }
  return (sum / array.length)
}

/**
 * Compute the Total Number from Array Elements
 * @Note: ~2.5 times faster than array.reduce() in Node.js
 * @example:
 *    toListTotal([1, 2])
 *    >>> 3
 *
 * @param {Array} array - list of numbers to calculate total of
 * @returns {number} total - value of all elements
 */
export function toListTotal (array = []) {
  let sum = 0
  for (const value of array) {
    sum += value
  }
  return sum
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
export function toListValuesTotal (array = [], key = 'value', fallback = 0) {
  let sum = 0
  for (const obj of array) {
    sum += obj[key] || fallback
  }
  return sum
}

/**
 * Ensures the array has unique values, including nested objects.
 *
 * @uses lodash
 * @see https://lodash.com/docs/#uniqWith
 * @example
 before [1, 2, 2, {a: 5, b: {c: 6}}, {a: 5, b: {c: 6}}];
 after [1, 2, {a: 5, b: {c: 6}}];
 * @param {Array} array - the array to enforce unique values for
 * @return {Array}
 */
export function toUniqueList (array) {
  return uniqWith(toList(array), isEqual)
}

/**
 * Ensure array has only unique primitive values.
 *
 * @param {Array} array - the array to enforce unique primitive values for
 * @return {Array} - new array
 */
export function toUniqueListFast (array) {
  return array.filter((value, index, self) => self.indexOf(value) === index)
}

/**
 * Ensure array has only unique values case insensitive keeping the first occurrence of duplicates.
 *
 * @param {Array<*>} array - the array to enforce unique values for (can be mix of value types)
 * @return {Array<*>} list - new array containing only unique values, case insensitive
 */
export function toUniqueListCaseInsensitive (array) {
  const listLower = array.map(toLowerCaseAny)
  return array.filter((v, i) => listLower.indexOf(toLowerCaseAny(v)) === i)
}

/**
 * Merge two arrays into one, with objects containing only unique key, keeping the value from the first array
 * @Note: this method is faster than `array.filter((val, _, self) => self.find(i => i[key] === val[key]) === val)`
 *    by about x5 times
 *
 * @param {Array} newList - list of new objects to keep
 * @param {Array} oldList - list of old objects to be updated
 * @param {string} key - objects's key that needs to be unique
 * @returns {Array} list - of unique objects
 */
export function toUniqueListByKey (newList, oldList, key) {
  return unionBy(newList, oldList, key)
}

/**
 * Add value to the beginning of Array, optionally trimming its length to provided limit
 *
 * @param {Array} array - to prepend to
 * @param {*} value - to prepend to `array`
 * @param {number} [limit] - optionally trim array to this length
 */
export function prependToList (array, value, limit) {
  const result = [value, ...array]
  if (limit && result.length > limit) result.length = limit
  return result
}

/**
 * Merge Arrays into a single List with unique values keeping orders given (using SameValueZero comparison)
 *
 * @param {Array} arrays - lists to combine (if not array given, it will be ignored without error)
 * @returns {Array} - merged list with unique values
 */
export function mergeLists (...arrays) {
  return union(...arrays)
}

/**
 * Remove Value from Array if found, without mutation
 *
 * @param {Array } listToKeep - list of values to search from
 * @param {String|Number|Array} valueToRemove - to remove
 * @return {Array} - new array with value removed
 */
export function removeFromList (listToKeep, valueToRemove) {
  // Value is Array
  if (isList(valueToRemove)) return difference(listToKeep, valueToRemove)

  // Value is of primitive type
  const result = [...listToKeep]
  const index = listToKeep.indexOf(valueToRemove)
  if (index > -1) result.splice(index, 1)
  return result
}

/**
 * Get the first element of an array, or return the value if it's not array
 *
 * @param {Array|*} array - The array to query
 * @returns {*} - The first element of the array
 */
export function firstListValue (array) {
  return isList(array) ? array[0] : array
}

/**
 * Gets the first value of array
 *
 * @param {Array} array - The array to query
 * @return {*} - The last element of the given array
 */
export function first (array) {
  return array[0]
}

/**
 * Gets the last value of array
 *
 * @param {Array} array - The array to query
 * @return {*} - The last element of the given array
 */
export function last (array) {
  return array[array.length - 1]
}

/**
 * Get a random value from provided list
 */
export function randomFromList (array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Get a random value from provided list, removing it from the list
 */
export function randomFromListExtract (array) {
  const index = Math.floor(Math.random() * array.length)
  return array.splice(index, 1)[0]
}

export function listAlphabetically (array) {
  return array.sort(sortAscending)
}

/**
 * Array.reduce callback to convert list of objects with .id attributes to a key-value hashmap object
 * @example:
 *    [{id: "unique", name: "test"}].reduce(listToMap, {})
 *    >>> {"unique": {id: "unique", name: "test"}}
 *
 * @returns {Object} object with element.id being keys, and elements of original array being values
 */
export function listToMap (obj, data) {
  obj[data.id] = data
  return obj
}

/**
 * Sort List in Ascending Order
 * (Fastest)
 *
 * @example:
 *    array.sort(sortAscending)
 *
 * @param {*} a - first value in the iteration
 * @param {*} b - second value in the iteration
 * @return {number} - whether values should be re-arranged
 */
export function sortAscending (a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Sort List in Descending Order
 * (Fastest)
 *
 * @example:
 *    array.sort(sortDescending)
 *
 * @param {*} a - first value in the iteration
 * @param {*} b - second value in the iteration
 * @return {number} - whether values should be re-arranged
 */
export function sortDescending (a, b) {
  if (a < b) return 1
  if (a > b) return -1
  return 0
}

/**
 * Sort List by Object Property
 * (Fastest)
 *
 * @example:
 *  array.sort(sort('name', 'asc'))
 *
 * @param {String} [key] - property value used to compare for sorting
 * @param {String} [order] - enum ['asc', 'desc']
 * @return {Function} - to be used as argument for native Array.sort()
 */
export function sort (key, order = 'asc') {
  const sortFunc = order === 'asc' ? sortAscending : sortDescending
  return (a, b) => sortFunc(a[key], b[key])
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
export function by (...args) {
  return (a, b) => {
    let result = 0

    // Loop through given sort arguments
    for (let key of args) {
      if (key.constructor === String) {
        if (key.indexOf('-') === 0) {
          key = key.substring(1)
          if (key.indexOf('.') > 0) {
            result = sortDescending(get(a, key), get(b, key))
          } else {
            result = sortDescending(a[key], b[key])
          }
        } else {
          if (key.indexOf('.') > 0) {
            result = sortAscending(get(a, key), get(b, key))
          } else {
            result = sortAscending(a[key], b[key])
          }
        }

        // exit function when has sorting to perform,
        // else keep looping to the next sort argument
        if (result) return result
      } else if (key.constructor === Function) {
        result = key(a, b)

        // exit function when has sorting to perform,
        // else keep looping to the next sort argument
        if (result) return result
      }
    }

    return result
  }
}

/**
 * Randomize List Value Orders by mutation
 *
 * @param {Array} list - to shuffle values for
 * @return {Array} list - mutated with shuffled values
 */
export function shuffle (list) {
  for (let i = list.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

// LODASH CLONES
// -----------------------------------------------------------------------------

export {
  min,
  max,

  /**
   * Creates an array of array values not included in the other given arrays
   */
    difference,

  /**
   * Create a new list of values that exist in all given lists using SameValueZero equality check.
   * The order and references of result values are determined by the first array.
   *
   * @param {Array} args - lists to check for intersection
   * @return {Array} list - of common values
   */
    intersection,

  /**
   * Creates an array of unique values from all given arrays using the provided 'comparator' function
   * to determine value equality
   *
   * @uses lodash
   * @see {@link https://lodash.com/docs/4.17.4#unionWith} for further information.
   *
   * @param {...Array} arrays - The arrays to inspect
   * @param {Function} comparator - The comparator invoked per element
   * @return {Array} - The new array of combined values
   */
    unionWith,
}

/**
 * Flatten an Array a single level deep
 *
 * @param {Array} array - The array to flatten
 * @return {Array} - The new flattened array
 */
export const toFlatList = flatten
