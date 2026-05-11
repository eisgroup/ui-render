// A tiny subset of lodash we rely on, implemented locally to avoid shipping lodash-es.
// Intentionally limited API surface: only what this repo imports.

function isObjectLike(value) {
	return value != null && typeof value === 'object'
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
	const re = /[^.[\]]+|\[(?:(-?\d+)|(["'])(.*?)\2)\]/g
	const out = []
	str.replace(re, (_, index, _q, quoted) => {
		out.push(index !== undefined ? Number(index) : (quoted !== undefined ? quoted : _))
		return ''
	})
	return out
}

function get(object, path, defaultValue) {
	const parts = toPath(path)
	let cur = object
	for (const key of parts) {
		if (cur == null) return defaultValue
		cur = cur[key]
	}
	return cur === undefined ? defaultValue : cur
}

function setWith(object, path, value, customizer) {
	if (object == null) return object
	const parts = toPath(path)
	if (parts.length === 0) return object

	let cur = object
	for (let i = 0; i < parts.length; i++) {
		const key = parts[i]
		if (i === parts.length - 1) {
			cur[key] = value
			return object
		}

		let next = cur[key]
		if (next == null) {
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
		for (const k of Object.keys(value)) out[k] = cloneDeep(value[k], seen)
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
	if (a instanceof Date) return a.getTime() === b.getTime()
	if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags
	if (a instanceof Map) {
		if (a.size !== b.size) return false
		for (const [k, v] of a.entries()) {
			if (!b.has(k)) return false
			if (!isEqual(v, b.get(k), seen)) return false
		}
		return true
	}
	if (a instanceof Set) {
		if (a.size !== b.size) return false
		for (const v of a.values()) if (!b.has(v)) return false
		return true
	}
	if (isPlainObject(a)) {
		const aKeys = Object.keys(a)
		const bKeys = Object.keys(b)
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
	return (object) => isMatch(object, source)
}

function isMatch(object, source) {
	if (object === source) return true
	if (!isObjectLike(object) || !isObjectLike(source)) return object === source
	for (const key of Object.keys(source)) {
		const sv = source[key]
		const ov = object[key]
		if (isObjectLike(sv)) {
			if (!isMatch(ov, sv)) return false
		} else if (ov !== sv) {
			return false
		}
	}
	return true
}

function some(collection, predicate) {
	if (collection == null) return false
	const pred = typeof predicate === 'function' ? predicate : matches(predicate)
	if (Array.isArray(collection)) return collection.some((v) => pred(v))
	for (const key in collection) {
		if (Object.prototype.hasOwnProperty.call(collection, key) && pred(collection[key])) return true
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
	let m = array[0]
	for (let i = 1; i < array.length; i++) if (array[i] < m) m = array[i]
	return m
}

function max(array) {
	if (!Array.isArray(array) || array.length === 0) return undefined
	let m = array[0]
	for (let i = 1; i < array.length; i++) if (array[i] > m) m = array[i]
	return m
}

function difference(array, values) {
	if (!Array.isArray(array)) return []
	const remove = new Set(Array.isArray(values) ? values : [])
	return array.filter((v) => !remove.has(v))
}

function intersection(...arrays) {
	const [first, ...rest] = arrays.filter(Array.isArray)
	if (!first) return []
	const restSets = rest.map((a) => new Set(a))
	return first.filter((v) => restSets.every((s) => s.has(v)))
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
	const out = []
	for (const v of array) {
		if (!out.some((o) => comparator(o, v))) out.push(v)
	}
	return out
}

function unionWith(...args) {
	const comparator = args[args.length - 1]
	const arrays = args.slice(0, -1)
	const out = []
	for (const arr of arrays) {
		if (!Array.isArray(arr)) continue
		for (const v of arr) {
			if (!out.some((o) => comparator(o, v))) out.push(v)
		}
	}
	return out
}

function unionBy(array, other, iteratee) {
	const it = typeof iteratee === 'function' ? iteratee : (v) => (v == null ? v : v[iteratee])
	const out = []
	const seen = new Set()
	for (const arr of [array, other]) {
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
	// Iterate own indices/keys including sparse arrays via Object.keys (lodash merge skips holes).
	for (const key of Object.keys(src)) {
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

