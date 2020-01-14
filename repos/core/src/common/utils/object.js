import dotProp from 'dot-prop-immutable'
import flatten from 'flat'
import _ from 'lodash'
import qs from 'querystring'

/**
 * OBJECT FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * Clone Object/Collection/Class
 */
export function clone (obj) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
}

/**
 * Check if value provided is an Object with at least one attribute
 *
 * @param {*} obj - value to check
 * @returns {boolean} - true if value is an Object with value
 */
export function hasObjectValue (obj) {
  return isObject(obj) && Object.keys(obj).length > 0
}

/**
 * List the keys and values of an object for iteration.
 * @Note: use for convenience only because it takes 0.5 microseconds per loop, which is:
 *    - x2-3 times longer than looping with `for (const key in obj) {...}` (0.2 microseconds),
 *    - x4-5 times longer than `forEach` or `for i++` loop using array (0.1 microseconds).
 *    => For performance, best to store list as array.
 *
 * @uses generator
 * @uses lodash
 * @see https://lodash.com/docs/#isObjectLike
 *
 * @example:
 for (const [key, value] of listProps(obj)) {
   console.log(key, value);
 }
 *
 * @param {Object} obj - the object to list
 * @return {Object} generator's yielded value
 */
export function * listProps (obj) {
  if (!_.isObjectLike(obj)) {
    return []
  }

  for (const key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

/**
 * Compare Original Object vs. Changed Object and keep only changed values
 *
 * @param {Object|Undefined|Null} original - to compare against
 * @param {Object|Undefined|Null} changed - object to keep changes
 * @returns {Object|Undefined|Null} changedOnly - new object with only changes values kept, or undefined if no changes
 */
export function objChanges (original, changed) {
  if (!original) original = {}
  const result = changed ? {...changed} : changed
  for (const field in result) {
    if (isEqual(original[field], result[field])) {
      delete result[field]
    } else {
      // Recursively check for nested field changes
      if (hasObjectValue(original[field]) && hasObjectValue(result[field]))
        result[field] = objChanges(original[field], result[field])
    }
  }
  if (isEmpty(result)) return
  return result
}

/**
 * Safely sets the provided value at the given path of an object, creating portions of the path if they don't exist.
 * Unless an optional customizer function is provided, arrays are created for missing index properties while objects
 * are created for all other missing properties.
 *
 * NOTE - This function mutates the provided 'object'
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#set
 *
 * @param {Object} object - The object to modify
 * @param {string} path - The path in the given object to set the provided values
 * @param {*} value - The value to set
 * @param {Function} [customizer] - An optional function that specifies how to fill in a missing path
 * @returns {Object}
 */
export function set (object, path, value, customizer) {
  return _.setWith(object, path, value, customizer)
}

/**
 * Removes the Property at Path of Object by Mutation
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#unset
 *
 * @param {Object} object - to remove property from
 * @param {String|Array} path - of the property to unset.
 * @return {boolean} - whether the value was removed from object
 */
export function unset (object, path) {
  return _.unset(object, path)
}

/**
 * Similar to set() but returns copy of the object instead of mutating it
 * Note: may not work if the path contains space character, e.g. `path = 'items[key with space].isNotWorking'`
 *
 * @uses dot-prop-immutable
 * @see {@link https://github.com/debitoor/dot-prop-immutable} for further information
 *
 * @param {Object} object - The object to modify
 * @param {string} path - The path in the given object to set the provided values
 * @param {*} value - The value to set
 * @return {Object} - A new object
 */
export function setImmutably (object, path, value) {
  // Change into suitable format for dotProp eg. myArray[0].myProperty -> myArray.0.myProperty
  const parsedPath = path

  // Remove brackets around strings (add a dot before it, except when bracket is the first character) ie. object[string] -> object.string
    .replace(/(\[)(.*?)(\])/g, (match, match1, match2, match3, offset) => (offset > 0 ? '.' : '') + String(match2))

  return dotProp.set(object, parsedPath, value)
}

/**
 * Set Object to be given Payload recursively, by Mutation
 *
 * @example:
 reset({user: {name: 'Chris'}}, {user: {sign: 'scorpion'}})
 >>> {user: {sign: 'scorpion'}}
 *
 * @param {Object|Array} collection - collection to be reset
 * @param {Object} payload - the nested Object to update with
 * @return {Object|Array} - mutated collection that has properties of payload
 */
export function reset (collection, payload) {

  for (const key in payload) {
    const value = payload[key]
    if (isObject(value)) {
      collection[key] = collection[key] ? reset(collection[key], value) : value
    } else {
      collection[key] = value
    }
  }

  for (const key in collection) {
    if (!payload[key]) delete collection[key]
  }

  return collection
}

/**
 * Update Object with nested payload, keeping other attributes in the Object intact
 *
 * @example:
 update({user: {name: 'Chris'}}, {user: {sign: 'scorpion'}})
 >>> {user: {name: 'Chris'}, {sign: 'scorpion'}}
 *
 * @param {Object|Array} state - collection to be updated
 * @param {Object} payload - the nested Object to update with
 * @param {boolean} shouldCloneDeep - whether to return new Object instead of mutating it
 * @return {Object|Array} - mutated/cloned Object with nested update
 */
export function update (state, payload, shouldCloneDeep = false) {
  if (shouldCloneDeep) state = cloneDeep(state)

  for (const key in payload) {
    const value = payload[key]
    if (isObject(value)) {
      state[key] = state[key] ? update(state[key], value) : value
    } else {
      state[key] = value
    }
  }
  return state
}

/**
 * Gets all values of an object
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#values
 *
 * @param {Object} object - the object to get the values from
 * @return {Array}
 */
export function getValues (object) {
  return _.values(object)
}

/**
 * Check Recursively for Matching Object within Nested Object or Collection.
 *
 * @example:
 *   hasObjMatch([[[1, -1], [2, -2]]], [1, -1]);
 *   >>> true
 *
 * @param {*} obj - the collection to search for matching object
 * @param {*} searchObj - the matching object to find
 * @returns {boolean} - true if a match found.
 */
export function hasObjMatch (obj, searchObj) {
  for (const key in obj) {
    if (!{}.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (_.matches(searchObj)(value)) {
      return true
    } else if (_.isObjectLike(value)) {
      const nestedMatch = hasObjMatch(value, searchObj)
      if (nestedMatch) return true
    }
  }

  return false
}

/**
 * Check if an Object has Provided Key Paths and Values.
 *
 * @example:
 *  const obj = {
 *    properties: {
 *      id: 7
 *    },
 *    type: 'DRAFT',
 *    coords: [[[1, -1], [2, -2]]]
 *  }
 *  hasObjKeys(obj, { 'properties.id': 7, 'coords': [1, -1] }, 'include');
 *  >>> true
 *
 * @param {*} obj - the object to check
 * @param {object} keys - key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {enum} match - one of comparison types ['deep', 'shallow', 'include'], default is `shallow`
 * @returns {boolean} - true if a match found.
 */
export function hasObjKeys (obj, keys = {}, match = 'deep') {
  for (const key in keys) {
    const value = keys[key]
    const searchValue = _.get(obj, key)

    // Deep comparison
    if (match === 'deep') {
      if (searchValue !== value) return false
    }  // eslint-disable-line

    // Shallow comparison
    else if (match === 'shallow') {
      if ((_.isObjectLike(searchValue) && !_.matches(value)(searchValue)) || (searchValue != value)) {  // eslint-disable-line eqeqeq
        return false
      }
    }  // eslint-disable-line

    // Include comparison
    else if (match === 'include') {
      if (searchValue !== value && !_.isObjectLike(searchValue)) {
        return false
      }

      if (!_.matches(value)(searchValue)) {
        if (_.isObjectLike(searchValue)) return hasObjMatch(searchValue, value)

        return false
      }
    }
  }

  return true
}

/**
 * Get Reference to Object with Provided Key Paths and Values within Nested Object or Collection.
 *
 * @example:
 *  const obj = {
 *    id: 7,
 *    items: [
 *      {
 *        type: 'polygon',
 *        geoJSON: {
 *          properties: {
 *            id: 7
 *          },
 *          type: 'DRAFT',
 *          coords: [[[1, -1], [2, -2]]]
 *        }
 *      }
 *    ]
 *  }
 *  findObjByKeys(obj, { 'properties.id': 7, 'coords': [1, -1] }, 'include');
 *  >>> Object: {
 *    properties: {
 *      id: 7
 *    },
 *    type: 'DRAFT',
 *    coords: [[[1, -1], [2, -2]]]
 *  }
 *
 * @param {*} obj - the collection to search for matching object
 * @param {Object} keys - object with key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {enum} match - one of comparison types ['deep', 'shallow', 'include']
 * @returns {Object} - the matching object.
 */
export function findObjByKeys (obj, keys = {}, match = 'deep') {
  for (const key in obj) {
    if (!{}.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (!_.isObjectLike(value)) continue

    if (hasObjKeys(value, keys, match)) return value

    const foundObj = findObjByKeys(value, keys, match)
    if (foundObj) return foundObj
  }
}

/**
 * Find all the objects which matches the the keys in the object.
 * @see findObjByKeys on usage details.
 * @param obj
 * @param keys
 * @param match
 * @returns {Array}
 */
export function findAllObjsByKeys (obj, keys = {}, match = 'deep') {
  const result = []
  _findAllObjsByKeys(result, obj, keys, match)
  return result
}

/**
 * Find all the objects with matching keys-values pairs in the Object or Collection.
 * @see findObjByKeys (which only returns a single matched object) on usage details.
 * The only usage difference from findObjByKeys is that the found objects are not in the return value.
 * This method populates the argument array 'foundObjs' with the found objects. This method has no return value.
 *
 * @param {Array} result - this is the return array. Pass in an empty array and it will be populated with the found objects
 * @param {Object} obj - Object or Collection to search from
 * @param {object} keys - object with key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {enum} match - one of comparison types ['deep', 'shallow', 'include']
 */
function _findAllObjsByKeys (result, obj, keys = {}, match = 'deep') {
  for (const key in obj) {
    if (!{}.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (!_.isObjectLike(value)) continue

    if (hasObjKeys(value, keys, match)) result.push(value)

    _findAllObjsByKeys(result, value, keys, match)
  }
}

/**
 * Flatten/Unflatten Nested Object Keys into Single Object with Dot Separated Keys
 */
export const toFlatObj = flatten
export const fromFlatObj = flatten.unflatten

/**
 * Extract the value safely from an object via the keyPath and returns the value.
 * Removes that value's key from the passed object.
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.1#get
 * @param {Object} obj - the object to get from and mutate
 * @param {string|Array} keyPath - the path to the desired value
 * @param {*} [fallback] - optional fallback value to return
 * @return {*}
 */
export function pop (obj, keyPath, fallback) {
  const value = _.get(obj, keyPath) || null
  if (value) _.unset(obj, keyPath)
  return value || fallback
}

/**
 * Delete Object property without mutating it, returning new Object without the deleted property
 *
 * @param {Object} obj - the Object to remove property from
 * @param {string} key - Object property to delete
 * @return {Object} - without the deleted key property
 */
export function removeKey (obj, key) {
  const {[key]: _, ...rest} = obj  // eslint-disable-line
  return rest
}

/**
 * Remove Empty String value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove empty values
 * @param {Boolean} [recursive] - whether to remove empty values recursively
 * @return {Object|Array} - without empty strings
 */
export function removeEmptyValues (collection, {recursive = true} = {}) {
  for (const key in collection) {
    if (collection[key] === '') {
      delete collection[key]
    } else if (recursive && typeof (collection[key] || '') === 'object') {
      collection[key] = removeEmptyValues(collection[key], {recursive})
    }
  }

  return (collection.constructor === Array) ? collection.filter(v => v) : collection
}

/**
 * Remove Null/Undefined value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove nil values
 * @param {Boolean} [recursive] - whether to remove nil values recursively
 * @return {Object|Array} - without null or undefined keys
 */
export function removeNilValues (collection, {recursive = true} = {}) {
  for (const key in collection) {
    if (collection[key] == null) {
      delete collection[key]
    } else if (recursive && typeof collection[key] === 'object') {
      collection[key] = removeNilValues(collection[key], {recursive})
    }
  }

  return (collection.constructor === Array) ? collection.filter(v => v) : collection
}

/**
 * Remove items with truthy 'delete' properties from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove deleted items from
 * @return {Object|Array} - without items with .delete keys
 */
export function removeDeletedItems (collection) {
  for (const key in collection) {
    // Null is of type 'object' according to stupid JS specs
    if (typeof (collection[key] || '') !== 'object') continue

    if (collection[key].delete) {
      delete collection[key]
    } else {
      collection[key] = removeDeletedItems(collection[key])
    }
  }

  return (collection.constructor === Array) ? collection.filter(v => v) : collection
}

/**
 * Remove GraphQL Tags and Null values from given Collection
 * (Falsey values will be removed from Array)
 *
 * @param {Object|Array} collection - to remove graphql tags from
 * @param {Array} [tags] - list of tags to remove
 * @param {Boolean} [clone] - whether to clone the object before mutating
 * @return {Object|Array} - without graphql tags
 */
export function sanitizeGqlResponse (collection, {tags = ['__typename'], clone = false} = {}) {
  const result = clone ? _.cloneDeep(collection) : collection

  for (const key in result) {
    if (tags.includes(key)) {
      delete result[key]
    } else if (result[key] == null) {
      delete result[key]
    } else if (typeof result[key] === 'object') {
      result[key] = sanitizeGqlResponse(result[key])
    }
  }

  return (result.constructor === Array) ? result.filter(v => v) : result
}

/**
 * Sort Object Keys by given order, returning new Object with Keys sorted
 *
 * @param {Object} obj - to sort key attributes for
 * @param {String} order - enum, one of ['asc', 'desc']
 * @return {Object} - sorted by key attributes
 */
export function sortObjKeys (obj, order = 'asc') {
  const result = {}
  Object.keys(obj).sort(order === 'desc' ? sortObjKeys.descending : undefined).forEach(key => {result[key] = obj[key]})
  return result
}

sortObjKeys.descending = (a, b) => {
  if (a < b) return 1
  if (a > b) return -1
  return 0
}

/**
 * Swap Object's Keys with its Values
 *
 * @example:
 *    swapKeyWithValue({id: 1, name: Tom})
 *    >>> {1: 'id', 'Tom': name}
 *
 * @param {Object} obj - to swap keys with values
 * @returns {Object} - with key and values swapped
 */
export function swapKeyWithValue (obj) {
  const result = {}
  for (const key in obj) {
    result[obj[key]] = key
  }
  return result
}

/**
 * Compute the Total Number from Object Values
 * @example:
 *    toObjValuesTotal({'a': 1, 'b': 2})
 *    >>> 3
 *
 * @param {Object} obj - with nested values to calculate total for
 * @returns {number} total - value of object values
 */
export function toObjValuesTotal (obj) {
  let sum = 0
  for (const key in obj) {
    sum += obj[key]
  }
  return sum
}

/**
 * Compute the Total Number from Object Values given Key Property
 * @example:
 *    toObjValuesKeyTotal({'a': {'count': 1}, 'b': {'count': 2}}, 'count')
 *    >>> 3
 *
 * @param {Object} obj - with nested values to calculate total for
 * @param {String} [key] - nested obj value key to extract amount for calculation
 * @returns {number} total - value of object values for given key property
 */
export function toObjValuesKeyTotal (obj, key = 'value') {
  let sum = 0
  for (const val in obj) {
    sum += obj[val][key]
  }
  return sum
}

/**
 * Converts object properties to a query string
 *
 * @example
 toParams({ids: [1, 2]});
 >>> 'ids=1&ids=2'
 *
 * @param {Object} obj - the object to turn into a query string
 * @return {string}
 */
export function queryString (obj) {
  return qs.stringify(obj)
}

// -----------------------------------------------------------------------------
// LODASH CLONES
// -----------------------------------------------------------------------------

/**
 * Search an object safely for a value via the keyPath and returns the value.
 *
 * @NOTE: this method is x10 times slower than Object property direct access
 *    - try and catch block is even slower
 *    - Object destructuring is much faster (more noticeable on big objects)
 *    => best to use Object destructuring with default fallback
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.1#get
 * @param {Object} obj - the object to get the value from
 * @param {string|Array} keyPath - the path to the desired value
 * @param {*} [defaultValue] - The value returned for `undefined` resolved values
 * @return {*} the value at the keyPath
 */
export function get (obj, keyPath, defaultValue) {
  return _.get(obj, keyPath, defaultValue)
}

/**
 * Check if two Objects are Equal
 * @example:
 *    const a = [{ code: 'en' }, { code: 'ru' }]
 *    const b = [{ code: 'en' }, { code: 'ru' }]
 *    >>> isEqual(a, b)
 *    >>> true
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#isEqual
 *
 * @param {Object} object - the object to compare against
 * @param {Object} object2 - the object to compare with
 * @return {boolean} - true or false
 */
export function isEqual (object, object2) {
  return _.isEqual(object, object2)
}

/**
 * Checks if value is an empty object, collection, map or set
 *
 * @param {*} value - The value to check
 * @return {boolean} - Returns true if value is empty, else false
 */
export function isEmpty (value) {
  return _.isEmpty(value)
}

/**
 * A wrapper around the lodash's cloneDeep function
 *
 * @uses lodash
 * @see {@link https://lodash.com/docs/4.17.4#cloneDeep} for further information.
 *
 * @param value
 * @returns {*} - cloned version of the value
 */
export function cloneDeep (value) {
  return _.cloneDeep(value)
}

/**
 * Checks if value is the language type of Object
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#isPlainObject
 *
 * @param {*} value - any value to check
 * @return {boolean}
 */
export function isObject (value) {
  return _.isPlainObject(value)
}

/**
 * Creates a function that returns the value at path of a given object
 *
 * @example
 *  [{ name: 'Neo', ... }, { name: 'Morpheus', ... }].map(property('name'))
 *  >>> ['Neo', 'Morpheus']
 *
 * @uses lodash
 * @see {@link https://lodash.com/docs/4.17.4#property} for further information
 *
 * @param {Array|string} path - The path of the property to get
 * @returns {Function} - Returns the new accessor function
 */
export function property (path) {
  return _.property(path)
}

/**
 * Creates a new object that merges properties from all given objects. Properties from the right take precedence
 * over properties on the left
 * @Note: use update() for faster performance of x5 times (without cloneDeep) and x3 times (with cloneDeep)
 *
 * @param {Array|Object} objects - Objects to merge
 * @return {Object} - A new object
 */
export function merge (...objects) {
  return _.merge({}, ...objects)
}
