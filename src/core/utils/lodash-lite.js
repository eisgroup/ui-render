// A tiny subset of lodash we rely on, implemented locally to avoid shipping lodash-es.
// Intentionally limited API surface: only what this repo imports.

function isObjectLike(value) {
	return value != null && typeof value === 'object'
}

function isObject(value) {
	return value != null && (typeof value === 'object' || typeof value === 'function')
}

function sameValueZero(a, b) {
	return a === b || (Number.isNaN(a) && Number.isNaN(b))
}

function enumerableKeys(value) {
	return Object.keys(value).concat(
		Object.getOwnPropertySymbols(value)
			.filter((key) => Object.prototype.propertyIsEnumerable.call(value, key))
	)
}

function isPlainObject(value) {
	if (!isObjectLike(value)) return false
	const proto = Object.getPrototypeOf(value)
	return proto === Object.prototype || proto === null
}

function isEmpty(value) {
	if (value == null) return true
	if (typeof value === 'string') return value.length === 0
	if (Array.isArray(value)) return value.length === 0
	if (value instanceof Map || value instanceof Set) return value.size === 0
	if (isPlainObject(value)) return Object.keys(value).length === 0
	return false
}

function toPath(path) {
	if (Array.isArray(path)) return path.slice()
	if (path == null) return []
	const str = String(path)
	// Supports:
	// - dots: a.b.c
	// - brackets: a[0].b, [1]
	// - quoted brackets: a["b.c"], a['x']
	// Empty segments are kept, as lodash does: `a.` -> ['a', ''], `a..b` -> ['a', '', 'b'].
	// Dropping them would silently resolve a malformed path to an ancestor value — e.g.
	// `get(data, 'a..b')` handing out `data.a.b` when the caller built a path from an empty
	// segment. The last alternative is the zero-width match lodash uses for that, and a
	// leading dot is handled separately (also as in lodash).
	// @Note: bracket indices become numbers here, unlike lodash which keeps every segment a
	// string. `toPath` is internal, and `setWith` relies on the number to create arrays.
	const re = /[^.[\]]+|\[(?:(-?\d+)|(["'])(.*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g
	const out = []
	if (str.charCodeAt(0) === 46 /* . */) out.push('')
	str.replace(re, (_, index, _q, quoted) => {
		out.push(index !== undefined ? Number(index) : (quoted !== undefined ? quoted : _))
		return ''
	})
	return out
}

function get(object, path, defaultValue) {
	const parts = toPath(path)
	// An empty path resolves to nothing, never to `object` itself.
	// Otherwise `get(data, '')` hands out the whole data object, and a config such as
	// `label: {name: ''}` renders it as a React child instead of an empty label.
	// @Note: lodash returns `object['']` here when the object happens to have an empty-string
	// key. We always return the fallback instead, so an empty path can never yield an object.
	// `setWith` and `unset` treat an empty path as "no path" too.
	if (parts.length === 0) return defaultValue
	let cur = object
	for (const key of parts) {
		if (cur == null) return defaultValue
		cur = cur[key]
	}
	return cur === undefined ? defaultValue : cur
}

function hasPath(object, path) {
	const parts = toPath(path)
	if (parts.length === 0) return false
	let cur = object
	for (const key of parts) {
		if (cur == null || !(key in Object(cur))) return false
		cur = cur[key]
	}
	return true
}

function setWith(object, path, value, customizer) {
	if (object == null) return object
	const parts = toPath(path)
	if (parts.length === 0) return object

	let cur = object
	for (let i = 0; i < parts.length; i++) {
		const key = parts[i]
		if (key === '__proto__' || key === 'constructor' || key === 'prototype') return object
		if (i === parts.length - 1) {
			cur[key] = value
			return object
		}

		let next = cur[key]
		if (!isObject(next)) {
			const nextKey = parts[i + 1]
			const created = typeof customizer === 'function'
				? customizer(next, key, cur)
				: (typeof nextKey === 'number' ? [] : {})
			next = created == null ? (typeof nextKey === 'number' ? [] : {}) : created
			cur[key] = next
		}
		cur = next
	}
	return object
}

function unset(object, path) {
	if (object == null) return false
	const parts = toPath(path)
	if (parts.length === 0) return false
	const last = parts[parts.length - 1]
	const parent = parts.length === 1 ? object : get(object, parts.slice(0, -1))
	if (parent == null) return false
	if (Object.prototype.hasOwnProperty.call(parent, last)) {
		delete parent[last]
		return true
	}
	return false
}

function cloneDeep(value, seen = new Map()) {
	if (!isObjectLike(value)) return value
	if (seen.has(value)) return seen.get(value)

	if (Array.isArray(value)) {
		const out = new Array(value.length)
		seen.set(value, out)
		for (let i = 0; i < value.length; i++) out[i] = cloneDeep(value[i], seen)
		return out
	}
	if (value instanceof Date) return new Date(value.getTime())
	if (value instanceof RegExp) return new RegExp(value.source, value.flags)
	if (value instanceof Map) {
		const out = new Map()
		seen.set(value, out)
		for (const [k, v] of value.entries()) out.set(cloneDeep(k, seen), cloneDeep(v, seen))
		return out
	}
	if (value instanceof Set) {
		const out = new Set()
		seen.set(value, out)
		for (const v of value.values()) out.add(cloneDeep(v, seen))
		return out
	}
	if (isPlainObject(value)) {
		const out = {}
		seen.set(value, out)
		for (const k of enumerableKeys(value)) out[k] = cloneDeep(value[k], seen)
		return out
	}
	// For class instances and other objects, keep reference as-is.
	return value
}

function isEqual(a, b, seen = new Map()) {
	if (a === b) return true
	if (Number.isNaN(a) && Number.isNaN(b)) return true
	if (!isObjectLike(a) || !isObjectLike(b)) return false
	if (a.constructor !== b.constructor) return false

	const seenKey = seen.get(a)
	if (seenKey && seenKey === b) return true
	seen.set(a, b)

	if (Array.isArray(a)) {
		if (a.length !== b.length) return false
		for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i], seen)) return false
		return true
	}
	if (a instanceof Date) return sameValueZero(a.getTime(), b.getTime())
	if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags
	if (a instanceof Number || a instanceof String || a instanceof Boolean) {
		return sameValueZero(a.valueOf(), b.valueOf())
	}
	if (a instanceof Error) return a.name === b.name && a.message === b.message
	if (a instanceof Map) {
		if (a.size !== b.size) return false
		const remaining = [...b.entries()]
		for (const [aKey, aValue] of a.entries()) {
			let match = -1
			for (let i = 0; i < remaining.length; i++) {
				const trial = new Map(seen)
				const [bKey, bValue] = remaining[i]
				if (isEqual(aKey, bKey, trial) && isEqual(aValue, bValue, trial)) {
					for (const [key, value] of trial) seen.set(key, value)
					match = i
					break
				}
			}
			if (match === -1) return false
			remaining.splice(match, 1)
		}
		return true
	}
	if (a instanceof Set) {
		if (a.size !== b.size) return false
		const remaining = [...b.values()]
		for (const aValue of a.values()) {
			let match = -1
			for (let i = 0; i < remaining.length; i++) {
				const trial = new Map(seen)
				if (isEqual(aValue, remaining[i], trial)) {
					for (const [key, value] of trial) seen.set(key, value)
					match = i
					break
				}
			}
			if (match === -1) return false
			remaining.splice(match, 1)
		}
		return true
	}
	if (isPlainObject(a)) {
		const aKeys = enumerableKeys(a)
		const bKeys = enumerableKeys(b)
		if (aKeys.length !== bKeys.length) return false
		for (const k of aKeys) {
			if (!Object.prototype.hasOwnProperty.call(b, k)) return false
			if (!isEqual(a[k], b[k], seen)) return false
		}
		return true
	}
	return false
}

function property(path) {
	return (obj) => get(obj, path)
}

function matches(source) {
	const snapshot = cloneDeep(source)
	return (object) => isMatch(object, snapshot)
}

function matchesProperty(path, sourceValue) {
	const snapshot = cloneDeep(sourceValue)
	return (object) => {
		const value = get(object, path)
		if (value === undefined && snapshot === undefined && !hasPath(object, path)) return false
		return isObjectLike(snapshot) ? isMatch(value, snapshot) : isEqual(value, snapshot)
	}
}

function toIteratee(value) {
	if (typeof value === 'function') return value
	if (value == null) return (item) => item
	if (Array.isArray(value)) return matchesProperty(value[0], value[1])
	if (isObjectLike(value)) return matches(value)
	return property(value)
}

function isMatch(object, source) {
	if (sameValueZero(object, source)) return true
	if (Array.isArray(source)) {
		if (!Array.isArray(object) || source.length > object.length) return false
		const used = new Set()
		for (const sourceValue of source) {
			let match = -1
			for (let i = 0; i < object.length; i++) {
				if (!used.has(i) && isMatch(object[i], sourceValue)) {
					match = i
					break
				}
			}
			if (match === -1) return false
			used.add(match)
		}
		return true
	}
	if (!isObject(source) || !isObject(object)) return false
	if (!isPlainObject(source)) return isEqual(object, source)
	for (const key of enumerableKeys(source)) {
		if (!(key in Object(object))) return false
		const sv = source[key]
		const ov = object[key]
		if (isObjectLike(sv)) {
			if (!isMatch(ov, sv)) return false
		} else if (!sameValueZero(ov, sv)) {
			return false
		}
	}
	return true
}

function some(collection, predicate) {
	if (collection == null) return false
	const pred = toIteratee(predicate)
	if (Array.isArray(collection)) {
		for (let i = 0; i < collection.length; i++) {
			if (pred(collection[i], i, collection)) return true
		}
		return false
	}
	for (const key in collection) {
		if (Object.prototype.hasOwnProperty.call(collection, key) && pred(collection[key], key, collection)) return true
	}
	return false
}

function flatten(array) {
	if (!Array.isArray(array)) return []
	const out = []
	for (const item of array) {
		if (Array.isArray(item)) out.push(...item)
		else out.push(item)
	}
	return out
}

function min(array) {
	if (!Array.isArray(array) || array.length === 0) return undefined
	let m
	for (const value of array) {
		if (value == null || Number.isNaN(value) || typeof value === 'symbol') continue
		if (m === undefined || value < m) m = value
	}
	return m
}

function max(array) {
	if (!Array.isArray(array) || array.length === 0) return undefined
	let m
	for (const value of array) {
		if (value == null || Number.isNaN(value) || typeof value === 'symbol') continue
		if (m === undefined || value > m) m = value
	}
	return m
}

function difference(array, values) {
	if (!Array.isArray(array)) return []
	const remove = new Set(Array.isArray(values) ? values : [])
	const out = []
	for (const value of array) if (!remove.has(value)) out.push(value)
	return out
}

function intersection(...arrays) {
	if (arrays.length === 0 || arrays.some((array) => !Array.isArray(array))) return []
	const [first, ...rest] = arrays
	const restSets = rest.map((a) => new Set(a))
	const out = []
	const seen = new Set()
	for (const value of first) {
		if (!seen.has(value) && restSets.every((set) => set.has(value))) {
			seen.add(value)
			out.push(value)
		}
	}
	return out
}

function union(...arrays) {
	const out = []
	const seen = new Set()
	for (const arr of arrays) {
		if (!Array.isArray(arr)) continue
		for (const v of arr) {
			if (!seen.has(v)) {
				seen.add(v)
				out.push(v)
			}
		}
	}
	return out
}

function uniqWith(array, comparator) {
	if (!Array.isArray(array)) return []
	if (typeof comparator !== 'function') return union(array)
	const out = []
	for (const v of array) {
		if (!out.some((o) => comparator(o, v))) out.push(v)
	}
	return out
}

function unionWith(...args) {
	const lastArg = args[args.length - 1]
	const comparator = typeof lastArg === 'function' ? lastArg : null
	const arrays = comparator ? args.slice(0, -1) : args
	if (!comparator) return union(...arrays)
	const out = []
	for (const arr of arrays) {
		if (!Array.isArray(arr)) continue
		for (const v of arr) {
			if (!out.some((o) => comparator(o, v))) out.push(v)
		}
	}
	return out
}

function unionBy(...args) {
	const lastArg = args[args.length - 1]
	const iteratee = Array.isArray(lastArg) ? undefined : args.pop()
	const it = toIteratee(iteratee)
	const out = []
	const seen = new Set()
	for (const arr of args) {
		if (!Array.isArray(arr)) continue
		for (const v of arr) {
			const key = it(v)
			if (!seen.has(key)) {
				seen.add(key)
				out.push(v)
			}
		}
	}
	return out
}

function mergeWith(target, ...rest) {
	target = target == null ? {} : Object(target)
	const customizer = rest[rest.length - 1]
	const sources = typeof customizer === 'function' ? rest.slice(0, -1) : rest
	const cz = typeof customizer === 'function' ? customizer : null
	for (const src of sources) {
		_mergeInto(target, src, cz)
	}
	return target
}

function merge(target, ...sources) {
	return mergeWith(target, ...sources)
}

function _mergeInto(dst, src, customizer) {
	if (!isObjectLike(src)) return
	// Lodash merge includes inherited enumerable string keys and skips sparse-array holes.
	for (const key in src) {
		if (key === '__proto__') continue
		const srcVal = src[key]
		// lodash merge/mergeWith skips `undefined` source values
		if (srcVal === undefined) continue
		const dstVal = dst[key]
		if (customizer) {
			const customized = customizer(dstVal, srcVal, key, dst, src)
			if (customized !== undefined) {
				dst[key] = customized
				continue
			}
		}
		if (Array.isArray(srcVal)) {
			// Element-wise merge by index (lodash behavior): keeps max length, recurses into objects, skips holes.
			// Previous concat() broke form-data merge: a sparse [, , , {}] from a child form was appended after
			// the master array instead of overlaying index 3, producing phantom rows.
			if (!Array.isArray(dstVal)) dst[key] = []
			_mergeInto(dst[key], srcVal, customizer)
		} else if (isPlainObject(srcVal)) {
			if (!isPlainObject(dstVal)) dst[key] = {}
			_mergeInto(dst[key], srcVal, customizer)
		} else {
			dst[key] = srcVal
		}
	}
}

function throttle(func, wait, options = {}) {
	let lastCallTime = 0
	let timeoutId = null
	let lastArgs
	let lastThis
	const leading = options.leading !== false
	const trailing = options.trailing !== false

	function invoke(time) {
		lastCallTime = time
		const args = lastArgs
		const self = lastThis
		lastArgs = lastThis = null
		return func.apply(self, args)
	}

	function startTimer(remaining) {
		timeoutId = setTimeout(() => {
			timeoutId = null
			if (trailing && lastArgs) invoke(Date.now())
		}, remaining)
	}

	return function throttled() {
		const now = Date.now()
		if (!lastCallTime && leading === false) lastCallTime = now
		const remaining = wait - (now - lastCallTime)
		lastArgs = arguments
		lastThis = this

		if (remaining <= 0 || remaining > wait) {
			if (timeoutId) {
				clearTimeout(timeoutId)
				timeoutId = null
			}
			return invoke(now)
		}
		if (!timeoutId && trailing) startTimer(remaining)
	}
}

function isNumber(value) {
	return typeof value === 'number' || value instanceof Number
}

export {
	// core
	get,
	setWith,
	unset,
	cloneDeep,
	isEqual,
	isEmpty,
	isObjectLike,
	isPlainObject,
	matches,
	property,
	merge,
	mergeWith,
	// collections
	some,
	flatten,
	min,
	max,
	difference,
	intersection,
	union,
	unionBy,
	unionWith,
	uniqWith,
	// functions
	throttle,
	// number
	isNumber,
	// string
	capitalize,
}

function capitalize(string) {
	string = String(string == null ? '' : string)
	if (!string) return ''
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
