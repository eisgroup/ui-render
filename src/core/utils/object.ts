import {
	cloneDeep,
	get,
	isEmpty,
	isEqual,
	isObjectLike,
	isPlainObject,
	matches,
	merge as _merge,
	mergeWith as _mergeWith,
	property,
	setIn as _setIn,
	setWith,
	unset,
} from './lodash-lite'
import { isCollection } from './array'

/**
 * OBJECT FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * @Note on the types (§9.6-E1): these helpers walk arbitrary shapes by computed key — meta/data
 * JSON, GraphQL responses, React state — so the types stay LOOSE on purpose. Values that are only
 * inspected are `unknown`, a container that is handed back unchanged keeps its caller's type through
 * a pass-through generic, and nothing accepts less at compile time than it accepts at runtime.
 * The casts below are all of the same kind: telling the checker that a value already guarded (or
 * simply walked) at runtime may be indexed with a computed key. They narrow nothing the runtime
 * does not already allow.
 */

/** Anything walked with a computed key once the value is treated as object-like. */
type Dict = Record<PropertyKey, unknown>

/** The comparison modes {@link hasObjKeys} understands: 'deep', 'shallow' or 'include'. Kept a
 *  plain `string` because an unrecognised mode is not an error at runtime — it matches everything. */
type MatchType = string

/**
 * `setWith`'s customizer, as forwarded by {@link set}: it returns the container to create for a
 * missing path segment.
 * @Note: the parameters are `any` on purpose — `unknown` there would reject every caller that
 *    annotates its own customizer, e.g. `set(obj, path, value, (v: Row) => …)`.
 */
type SetWithCustomizer = (nsValue: any, key: PropertyKey, nsObject: any) => unknown

/** Options accepted by {@link toFlatObj}, a subset of the `flat` package's API. */
type FlattenOpts = {
	delimiter?: string,
	maxDepth?: number,
	safe?: boolean,
}

/** Options accepted by {@link fromFlatObj}, a subset of the `flat` package's API. */
type UnflattenOpts = {
	delimiter?: string,
	overwrite?: boolean,
	object?: boolean,
}

/**
 * Check if value provided is an Object with at least one attribute
 *
 * @param {*} obj - value to check
 * @returns {boolean} - true if value is an Object with value
 */
export function hasObjectValue (obj: unknown): obj is Dict {
	return isObject(obj) && Object.keys(obj).length > 0
}

/**
 * Compare if two values are the same by converting them to JSON strings
 * @example:
 *    React.memo(func, isEqualJSON)
 *
 * @param {*} oldVal - to compare
 * @param {*} newVal - to compare
 * @returns {Boolean} true - if JSON string of given values are the same
 */
export function isEqualJSON (oldVal: unknown, newVal: unknown): boolean {
	return JSON.stringify(oldVal) === JSON.stringify(newVal)
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
export function isObject (value: unknown): value is Dict {
	return isPlainObject(value)
}

/**
 * Creates a new object that merges properties from all given objects. Properties from the right take precedence
 * over properties on the left
 * @Note: use update() for faster performance of x5 times (without cloneDeep) and x3 times (with cloneDeep)
 *
 * @param {Array|Object} objects - Objects to merge
 * @return {Object} - A new object
 */
export function merge (...objects: unknown[]): Dict {
	return _merge({}, ...objects)
}

/**
 * Like merge(), but replaces arrays wholesale instead of merging them element-by-element.
 * Prevents deleted array items from being resurrected by the base object.
 */
export function mergeReplaceArrays (...objects: unknown[]): Dict {
	return _mergeWith({}, ...objects, (objValue: unknown, srcValue: unknown) => {
		if (Array.isArray(srcValue)) return srcValue
	})
}

/**
 * Compare Original Object vs. Changed Object and keep only changed values
 * @note: deleted props will output as `null` value
 *
 * @param {Object|Undefined|Null} original - to compare against
 * @param {Object|Undefined|Null} changed - object to keep changes
 * @returns {Object|Undefined|Null} changedOnly - new object with only changed values kept, or undefined if no changes
 */
export function objChanges (original?: Dict | null, changed?: Dict | null): Dict | undefined {
	// clone so we can delete keys while iterating
	original = {...original}
	changed = {...changed}
	for (const field in changed) {
		if (isEqual(original[field], changed[field])) {
			delete changed[field]
		} else {
			// Recursively check for nested field changes
			if (hasObjectValue(original[field]) && hasObjectValue(changed[field]))
				changed[field] = objChanges(original[field] as Dict, changed[field] as Dict)
		}
		delete original[field]
	}
	for (const deleted in original) {
		changed[deleted] = null
	}
	return isEmpty(changed) ? undefined : changed
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
 * @param {String|String[]|Number|Number[]} path - The path in the given object to set the provided values
 * @param {*} value - The value to set
 * @param {Function} [customizer] - An optional function that specifies how to fill in a missing path
 * @returns {Object}
 */
export function set<T>(object: T, path: unknown, value: unknown, customizer?: SetWithCustomizer): T {
	return setWith(object, path, value, customizer)
}

/**
 * Returns a COPY of the given object with the provided value at the given path, leaving the
 * original untouched — the immutable counterpart of {@link set}.
 *
 * Only the containers along the path are copied, so every branch the write did not reach keeps its
 * identity and a reference comparison on it still reports "unchanged".
 *
 * Use this wherever the object may already have been handed to someone else — React state above
 * all, where mutating in place rewrites the `prevState` that lifecycle hooks and
 * `shouldComponentUpdate` were given.
 *
 * An empty or absent path returns the SAME object, as {@link set} does; unlike {@link set} it
 * takes no customizer.
 *
 * @param {Object} object - The object to copy
 * @param {String|String[]|Number|Number[]} path - The path to set the provided value at
 * @param {*} value - The value to set
 * @returns {Object} a new object, or the original when the path is empty
 */
export function setIn<T>(object: T, path: unknown, value: unknown): T {
	return _setIn(object, path, value)
}

/**
 * Update Object with nested payload, keeping other attributes in the Object intact
 *
 * @example:
 update({user: {name: 'Chris'}}, {user: {sign: 'scorpion'}})
 >>> {user: {name: 'Chris', sign: 'scorpion'}}
 *
 * @param {Object|Array} state - collection to be updated
 * @param {Object|Array} payload - the nested Object to update with
 * @param {Boolean} [shouldCloneDeep] - whether to return new Object instead of mutating it
 * @param {Boolean} [deleteNull] - whether to remove `null` props instead of updating them
 * @return {Object|Array} - mutated/cloned Object with nested update
 */
export function update<T> (state: T, payload?: unknown, shouldCloneDeep = false, deleteNull = false): T {
	if (shouldCloneDeep) state = cloneDeep(state)

	// `state` and `payload` are walked by computed key; a nullish `payload` yields no iterations,
	// exactly as before.
	const target = state as Dict
	const source = payload as Dict
	for (const key in source) {
		const value = source[key]
		if (value === null && deleteNull) {
			delete target[key]
		} else if (isObject(value)) {
			target[key] = target[key] ? update(target[key], value) : value
		} else {
			target[key] = value
		}
	}
	return state
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
 * @Note: the bare `return` on a non-own property yields `undefined`, not `false` — hence the
 *    `| undefined` in the return type. Callers only ever test it for truthiness.
 */
export function hasObjMatch(obj: unknown, searchObj: unknown): boolean | undefined {
	for (const key in obj as Dict) {
		if (!{}.hasOwnProperty.call(obj, key)) return
		const value = (obj as Dict)[key]

		if (matches(searchObj)(value)) {
			return true
		} else if (isObjectLike(value)) {
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
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include'], default is `deep`.
 *  `deep` requires strict equality, so an equal-by-value object does not match; `shallow` matches
 *  object-like values partially by value and everything else loosely; `include` recurses to find a match.
 * @returns {boolean} - true if a match found.
 */
export function hasObjKeys(obj: unknown, keys: Dict = {}, match: MatchType = 'deep'): boolean | undefined {
	for (const key in keys) {
		const value = keys[key]
		const searchValue = get(obj, key)

		// Deep comparison
		if (match === 'deep') {
			if (searchValue !== value) return false
		} // eslint-disable-line

		// Shallow comparison
		else if (match === 'shallow') {
			// Object-like values match by value (partially — extra keys on the target are ignored), everything
			// else compares loosely. The two must not be OR-ed: doing so let the reference comparison veto an
			// object match the first clause had already accepted, so no shallow object match ever succeeded.
			if (isObjectLike(searchValue)) {
				if (!matches(value)(searchValue)) return false
			} else {
				// eslint-disable-next-line eqeqeq -- primitives compare loosely on purpose (1 matches '1')
				if (searchValue != value) return false
			}
		} // eslint-disable-line

		// Include comparison
		else if (match === 'include') {
			if (searchValue !== value && !isObjectLike(searchValue)) {
				return false
			}

			if (!matches(value)(searchValue)) {
				if (isObjectLike(searchValue)) return hasObjMatch(searchValue, value)

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
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include']
 * @returns {Object} - the matching object.
 */
export function findObjByKeys(obj: unknown, keys: Dict = {}, match: MatchType = 'deep'): object | undefined {
	for (const key in obj as Dict) {
		if (!{}.hasOwnProperty.call(obj, key)) return
		const value = (obj as Dict)[key]

		if (!isObjectLike(value)) continue

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
export function findAllObjsByKeys(obj: unknown, keys: Dict = {}, match: MatchType = 'deep'): object[] {
	const result: object[] = []
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
 * @param {Object} keys - object with key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include']
 */
function _findAllObjsByKeys(result: object[], obj: unknown, keys: Dict = {}, match: MatchType = 'deep'): void {
	for (const key in obj as Dict) {
		if (!{}.hasOwnProperty.call(obj, key)) return
		const value = (obj as Dict)[key]

		if (!isObjectLike(value)) continue

		if (hasObjKeys(value, keys, match)) result.push(value)

		_findAllObjsByKeys(result, value, keys, match)
	}
}

/**
 * Flatten/Unflatten nested object keys (dot-separated). Subset of the `flat` package API.
 */
function flattenObject (target: unknown, opts?: FlattenOpts): Dict {
	opts = opts || {}
	const delimiter = opts.delimiter || '.'
	const maxDepth = opts.maxDepth
	const output: Dict = {}
	function step (object: Dict, prev?: string, currentDepth?: number) {
		currentDepth = currentDepth || 1
		Object.keys(object).forEach(function (key) {
			const value = object[key]
			const isarray = opts!.safe && Array.isArray(value)
			const type = Object.prototype.toString.call(value)
			const isbuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(value)
			const isobject = (
				type === '[object Object]' ||
				type === '[object Array]'
			)
			const newKey = prev
				? prev + delimiter + key
				: key
			if (!isarray && !isbuffer && isobject && Object.keys(value as Dict).length &&
				(!opts!.maxDepth || currentDepth! < maxDepth!)) {
				return step(value as Dict, newKey, currentDepth! + 1)
			}
			output[newKey] = value
		})
	}
	step(target as Dict)
	return output
}

function unflattenObject (target: unknown, opts?: UnflattenOpts): unknown {
	opts = opts || {}
	const delimiter = opts.delimiter || '.'
	const overwrite = opts.overwrite || false
	const result: Dict = {}
	const isbuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(target)
	if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
		return target
	}
	// `key` is `undefined` once the path is exhausted; `Number(undefined)` is NaN, so the first
	// clause short-circuits before `.indexOf` is reached — as it always has.
	function getkey (key: string | undefined): string | number | undefined {
		const parsedKey = Number(key)
		return (
			isNaN(parsedKey) ||
			key!.indexOf('.') !== -1 ||
			opts!.object
		) ? key
			: parsedKey
	}
	const sortedKeys = Object.keys(target as Dict).sort(function (keyA, keyB) {
		return keyA.length - keyB.length
	})
	sortedKeys.forEach(function (key) {
		const split = key.split(delimiter)
		let key1 = getkey(split.shift())
		let key2 = getkey(split[0])
		let recipient = result
		while (key2 !== undefined) {
			if (key1 === '__proto__') {
				return
			}
			const type = Object.prototype.toString.call(recipient[key1!])
			const isobject = (
				type === '[object Object]' ||
				type === '[object Array]'
			)
			if (!overwrite && !isobject && typeof recipient[key1!] !== 'undefined') {
				return
			}
			if ((overwrite && !isobject) || (!overwrite && recipient[key1!] == null)) {
				recipient[key1!] = (
					typeof key2 === 'number' &&
					!opts!.object ? [] : {}
				)
			}
			recipient = recipient[key1!] as Dict
			if (split.length > 0) {
				key1 = getkey(split.shift())
				key2 = getkey(split[0])
			}
		}
		recipient[key1!] = unflattenObject((target as Dict)[key], opts)
	})
	return result
}

export const toFlatObj = flattenObject
export const fromFlatObj = unflattenObject

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
export function pop(obj: unknown, keyPath: unknown, fallback?: unknown): unknown {
	const missing = {}
	const value = get(obj, keyPath, missing)
	if (value === missing) return fallback
	unset(obj, keyPath)
	return value
}

/**
 * Delete Object property without mutating it, returning new Object without the deleted property
 *
 * @param {Object} obj - the Object to remove property from
 * @param {string} key - Object property to delete
 * @return {Object} - without the deleted key property
 */
export function removeKey (obj: Dict, key: string): Dict {
	const {[key]: _, ...rest} = obj // eslint-disable-line
	return rest
}

/**
 * Recursively remove given list of keys from object or collection
 * @param {Object|Array} obj - or collection to remove keys from
 * @param {String[]} keys - list of keys to remove
 * @param {Boolean} [clone] - whether to return new object, defaults to mutating existing
 * @param {Boolean} [recursive] - whether to parse given obj recursively
 */
export function removeKeys<T> (obj: T, keys: readonly string[], {clone = false, recursive = false}: {clone?: boolean, recursive?: boolean} = {}): T {
	const data = (clone ? cloneDeep(obj) : obj) as Dict
	for (const key in data) {
		if (keys.indexOf(key) >= 0) {
			delete data[key]
		} else if (recursive && isCollection(data[key])) {
			data[key] = removeKeys(data[key], keys, {recursive})
		}
	}
	return data as T
}

/**
 * Remove Empty String value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove empty values
 * @param {Boolean} [recursive] - whether to remove empty values recursively
 * @return {Object|Array} - without empty strings
 */
export function removeEmptyValues<T> (collection: T, {recursive = true}: {recursive?: boolean} = {}): T {
	const data = collection as Dict
	for (const key in data) {
		if (data[key] === '') {
			delete data[key]
		} else if (recursive && typeof (data[key] || '') === 'object') {
			data[key] = removeEmptyValues(data[key], { recursive })
		}
	}

	return (data.constructor === Array ? (data as unknown as unknown[]).filter(v => v) : data) as T
}

/**
 * Remove Null/Undefined value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove nil values
 * @param {Boolean} [recursive] - whether to remove nil values recursively
 * @return {Object|Array} - without null or undefined keys
 */
export function removeNilValues<T> (collection: T, {recursive = true}: {recursive?: boolean} = {}): T {
	const data = collection as Dict
	for (const key in data) {
		if (data[key] == null) {
			delete data[key]
		} else if (recursive && typeof data[key] === 'object') {
			data[key] = removeNilValues(data[key], {recursive})
		}
	}

	return (data.constructor === Array ? (data as unknown as unknown[]).filter(v => v) : data) as T
}

/**
 * Remove items with truthy 'delete' properties from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove deleted items from
 * @return {Object|Array} - without items with .delete keys
 */
export function removeDeletedItems<T>(collection: T): T {
	const data = collection as Dict
	for (const key in data) {
		// Null is of type 'object' according to stupid JS specs
		if (typeof (data[key] || '') !== 'object') continue

		if ((data[key] as Dict).delete) {
			delete data[key]
		} else {
			data[key] = removeDeletedItems(data[key])
		}
	}

	return (data.constructor === Array ? (data as unknown as unknown[]).filter(v => v) : data) as T
}

/**
 * Remove GraphQL Tags and Null values from given Collection
 *  - Nullable values will be removed from Array
 *  - Commonly uneditable attributes listed in `tags` are deleted, see `GQL_HIDDEN_FIELDS` for example
 *
 * @param {Object|Array} collection - to remove graphql tags from
 * @param {Array} [tags] - list of tags to remove
 * @param {Boolean} [clone] - whether to clone the object before mutating
 * @return {Object|Array} - without graphql tags
 */
export function sanitizeResponse<T> (collection: T, {tags = ['__typename'], clone = false}: {tags?: readonly string[], clone?: boolean} = {}): T {
	const result = (clone ? cloneDeep(collection) : collection) as Dict

	for (const key in result) {
		if (tags.includes(key)) {
			delete result[key]
		} else if (result[key] == null) {
			delete result[key]
		} else if (typeof result[key] === 'object') {
			result[key] = sanitizeResponse(result[key], {tags})
		}
	}

	return (result.constructor === Array ? (result as unknown as unknown[]).filter(v => v != null) : result) as T
}

/**
 * Sort Object Keys by given order, returning new Object with Keys sorted
 *
 * @param {Object} obj - to sort key attributes for
 * @param {String} order - enum, one of ['asc', 'desc']
 * @return {Object} - sorted by key attributes
 */
export function sortObjKeys(obj: Dict, order: string = 'asc'): Dict {
	const result: Dict = {}
	Object.keys(obj)
		.sort(order === 'desc' ? sortObjKeys.descending : undefined)
		.forEach(key => {
			result[key] = obj[key]
		})
	return result
}

sortObjKeys.descending = (a: string, b: string): number => {
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
export function swapKeyWithValue(obj: Dict): Dict {
	const result: Dict = {}
	for (const key in obj) {
		// the value becomes a key: at runtime JS coerces whatever it is to a property key
		result[obj[key] as PropertyKey] = key
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
export function toObjValuesTotal(obj: Dict): number {
	let sum = 0
	for (const key in obj) {
		sum += obj[key] as number
	}
	return sum
}


export {
	cloneDeep,
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
	get,

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
		isEqual,

	/**
	 * Checks if value is an empty object, collection, map or set
	 *
	 * @param {*} value - The value to check
	 * @return {boolean} - Returns true if value is empty, else false
	 */
		isEmpty,

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
		property,

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
		unset,
}
