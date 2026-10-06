import {
	cloneDeep,
	get,
	isEmpty,
	isEqual,
	isPlainObject,
	merge as _merge,
	mergeWith as _mergeWith,
	setIn as _setIn,
	setWith,
	unset,
} from './lodash-lite'

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

/**
 * `setWith`'s customizer, as forwarded by {@link set}: it returns the container to create for a
 * missing path segment.
 * @Note: the parameters are `any` on purpose — `unknown` there would reject every caller that
 *    annotates its own customizer, e.g. `set(obj, path, value, (v: Row) => …)`.
 */
type SetWithCustomizer = (nsValue: any, key: PropertyKey, nsObject: any) => unknown

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
