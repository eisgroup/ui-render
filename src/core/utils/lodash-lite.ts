// A tiny subset of lodash we rely on, implemented locally to avoid shipping lodash-es.
// Intentionally limited API surface: only what this repo imports.
//
// @Note on the types (§9.6-E1): these helpers are deliberately polymorphic — they take whatever a
// caller hands them and guard at runtime. The types below stay LOOSE on purpose: `unknown` for the
// values this module inspects, element generics only where the runtime genuinely passes a value
// through, and no tightening of what any function accepts.
//
// Every `any` here is deliberate and confined to the parameters of USER callbacks (the `setWith` and
// `mergeWith` customizers), none of which is a value this module hands back to a caller: a
// contravariant `unknown` there would reject every caller that annotates its own callback, e.g.
// `(nsValue: Row) => …`.

/** Anything this module walks with a computed key once it knows the value is object-like. */
type Dict = Record<PropertyKey, unknown>

/** `setWith`'s customizer: returns the container to create for a missing path segment. */
type SetWithCustomizer = (nsValue: any, key: PropertyKey, nsObject: any) => unknown

/** `mergeWith`'s customizer: a non-`undefined` return wins over the default merge. */
type MergeCustomizer = (dstValue: any, srcValue: any, key: string, dst: any, src: any) => unknown

/** Exported for its unit tests: no other module imports it. */
function isObjectLike(value: unknown): value is object {
	return value != null && typeof value === 'object'
}

function isObject(value: unknown): value is object {
	return value != null && (typeof value === 'object' || typeof value === 'function')
}

function sameValueZero(a: unknown, b: unknown): boolean {
	return a === b || (Number.isNaN(a) && Number.isNaN(b))
}

function enumerableKeys(value: object): Array<string | symbol> {
	return (Object.keys(value) as Array<string | symbol>).concat(
		Object.getOwnPropertySymbols(value)
			.filter((key) => Object.prototype.propertyIsEnumerable.call(value, key))
	)
}

function isPlainObject(value: unknown): value is Dict {
	if (!isObjectLike(value)) return false
	const proto = Object.getPrototypeOf(value)
	return proto === Object.prototype || proto === null
}

function isEmpty(value: unknown): boolean {
	if (value == null) return true
	if (typeof value === 'string') return value.length === 0
	if (Array.isArray(value)) return value.length === 0
	if (value instanceof Map || value instanceof Set) return value.size === 0
	if (isPlainObject(value)) return Object.keys(value).length === 0
	return false
}

function toPath(path: unknown): PropertyKey[] {
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
	const out: PropertyKey[] = []
	if (str.charCodeAt(0) === 46 /* . */) out.push('')
	str.replace(re, (_: string, index: string | undefined, _q: string | undefined, quoted: string | undefined) => {
		out.push(index !== undefined ? Number(index) : (quoted !== undefined ? quoted : _))
		return ''
	})
	return out
}

function get(object: unknown, path: unknown, defaultValue?: unknown): unknown {
	const parts = toPath(path)
	// An empty path resolves to nothing, never to `object` itself.
	// Otherwise `get(data, '')` hands out the whole data object, and a config such as
	// `label: {name: ''}` renders it as a React child instead of an empty label.
	// @Note: lodash returns `object['']` here when the object happens to have an empty-string
	// key. We always return the fallback instead, so an empty path can never yield an object.
	// `setWith` and `unset` treat an empty path as "no path" too.
	if (parts.length === 0) return defaultValue
	let cur: unknown = object
	for (const key of parts) {
		if (cur == null) return defaultValue
		cur = (cur as Dict)[key]
	}
	return cur === undefined ? defaultValue : cur
}

function setWith<T>(object: T, path: unknown, value: unknown, customizer?: SetWithCustomizer): T {
	if (object == null) return object
	const parts = toPath(path)
	if (parts.length === 0) return object

	let cur = object as unknown as Dict
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
		cur = next as Dict
	}
	return object
}

/**
 * The immutable counterpart of {@link setWith}: returns a copy with `value` at `path` instead of
 * writing into `object`.
 *
 * Only the containers ALONG the path are copied — every untouched branch keeps its identity, so a
 * consumer comparing by reference still sees "unchanged" for everything the write did not reach.
 * Deliberately adjacent to `setWith`: the two share `toPath` and the same rules for an empty path,
 * for the keys they refuse, and for which container a missing segment creates, and a divergence
 * between them would be invisible at the call sites that pick one over the other.
 *
 * No customizer: nothing needs one, and the parameters `setWith` hands it (`value`, `key`,
 * PARENT object) have no honest equivalent while rebuilding a level that does not exist yet.
 */
function setIn<T>(object: T, path: unknown, value: unknown): T {
	if (object == null) return object
	const parts = toPath(path)
	// An empty path is "no path", exactly as in `setWith` — the object comes back untouched, and
	// by identity, so a `setState` built on it stays the no-op it has always been.
	if (parts.length === 0) return object
	for (const key of parts) {
		if (key === '__proto__' || key === 'constructor' || key === 'prototype') return object
	}
	return copyOnPath(object, parts, 0, value) as T
}

function copyOnPath(node: unknown, parts: PropertyKey[], index: number, value: unknown): unknown {
	if (index === parts.length) return value
	const key = parts[index]
	// A number here came from a bracket index, so a missing container becomes an array — the same
	// rule `setWith` applies, read off the key being written rather than the one after it.
	const clone: Dict = Array.isArray(node)
		? (node.slice() as unknown as Dict)
		: isObject(node) ? {...(node as Dict)} : (typeof key === 'number' ? [] : {}) as unknown as Dict
	clone[key] = copyOnPath(isObject(node) || Array.isArray(node) ? (node as Dict)[key] : undefined, parts, index + 1, value)
	return clone
}

function unset(object: unknown, path: unknown): boolean {
	if (object == null) return false
	const parts = toPath(path)
	if (parts.length === 0) return false
	// The keys `set` and `setWith` refuse (above), refused here too. Without this, `unset(o, '__proto__.toString')`
	// read `o.__proto__`, which is `Object.prototype`, and deleted its member for the whole page. Upload passes a
	// field's name here, so a meta's field name was enough (the 2026-10-08 audit).
	if (parts.some(part => part === '__proto__' || part === 'constructor' || part === 'prototype')) return false
	const last = parts[parts.length - 1]
	const parent = parts.length === 1 ? object : get(object, parts.slice(0, -1))
	if (parent == null) return false
	if (Object.prototype.hasOwnProperty.call(parent, last)) {
		delete (parent as Dict)[last]
		return true
	}
	return false
}

function cloneDeep<T>(value: T, seen: Map<unknown, unknown> = new Map()): T {
	if (!isObjectLike(value)) return value
	if (seen.has(value)) return seen.get(value) as T

	if (Array.isArray(value)) {
		const out = new Array(value.length)
		seen.set(value, out)
		for (let i = 0; i < value.length; i++) out[i] = cloneDeep(value[i], seen)
		return out as T
	}
	if (value instanceof Date) return new Date(value.getTime()) as T
	if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T
	if (value instanceof Map) {
		const out = new Map()
		seen.set(value, out)
		for (const [k, v] of value.entries()) out.set(cloneDeep(k, seen), cloneDeep(v, seen))
		return out as T
	}
	if (value instanceof Set) {
		const out = new Set()
		seen.set(value, out)
		for (const v of value.values()) out.add(cloneDeep(v, seen))
		return out as T
	}
	if (isPlainObject(value)) {
		const out: Dict = {}
		seen.set(value, out)
		for (const k of enumerableKeys(value)) out[k] = cloneDeep(value[k], seen)
		return out as T
	}
	// For class instances and other objects, keep reference as-is.
	return value
}

function isEqual(a: unknown, b: unknown, seen: Map<unknown, unknown> = new Map()): boolean {
	if (a === b) return true
	if (Number.isNaN(a) && Number.isNaN(b)) return true
	if (!isObjectLike(a) || !isObjectLike(b)) return false
	if (a.constructor !== b.constructor) return false
	// From here on `a` and `b` share a constructor, which is what lets every `b as ...` below
	// stand: whatever narrowed `a` describes `b` just as well.

	const seenKey = seen.get(a)
	if (seenKey && seenKey === b) return true
	seen.set(a, b)

	if (Array.isArray(a)) {
		const bArray = b as unknown[]
		if (a.length !== bArray.length) return false
		for (let i = 0; i < a.length; i++) if (!isEqual(a[i], bArray[i], seen)) return false
		return true
	}
	if (a instanceof Date) return sameValueZero(a.getTime(), (b as Date).getTime())
	if (a instanceof RegExp) return a.source === (b as RegExp).source && a.flags === (b as RegExp).flags
	if (a instanceof Number || a instanceof String || a instanceof Boolean) {
		return sameValueZero(a.valueOf(), (b as Number | String | Boolean).valueOf())
	}
	if (a instanceof Error) return a.name === (b as Error).name && a.message === (b as Error).message
	if (a instanceof Map) {
		const bMap = b as Map<unknown, unknown>
		if (a.size !== bMap.size) return false
		const remaining = [...bMap.entries()]
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
		const bSet = b as Set<unknown>
		if (a.size !== bSet.size) return false
		const remaining = [...bSet.values()]
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
		const bDict = b as Dict
		const aKeys = enumerableKeys(a)
		const bKeys = enumerableKeys(b)
		if (aKeys.length !== bKeys.length) return false
		for (const k of aKeys) {
			if (!Object.prototype.hasOwnProperty.call(b, k)) return false
			if (!isEqual(a[k], bDict[k], seen)) return false
		}
		return true
	}
	return false
}

function flatten<T>(array: ReadonlyArray<T | readonly T[]> | null | undefined): T[] {
	if (!Array.isArray(array)) return []
	const out: T[] = []
	for (const item of array) {
		if (Array.isArray(item)) out.push(...item)
		else out.push(item)
	}
	return out
}

function mergeWith(target: unknown, ...rest: unknown[]): Dict {
	target = target == null ? {} : Object(target)
	const customizer = rest[rest.length - 1]
	const sources = typeof customizer === 'function' ? rest.slice(0, -1) : rest
	const cz = typeof customizer === 'function' ? customizer as MergeCustomizer : null
	for (const src of sources) {
		_mergeInto(target as Dict, src, cz)
	}
	return target as Dict
}

function merge(target: unknown, ...sources: unknown[]): Dict {
	return mergeWith(target, ...sources)
}

function _mergeInto(dst: Dict, src: unknown, customizer: MergeCustomizer | null): void {
	if (!isObjectLike(src)) return
	const source = src as Dict
	// Lodash merge includes inherited enumerable string keys and skips sparse-array holes.
	for (const key in source) {
		if (key === '__proto__') continue
		const srcVal = source[key]
		// lodash merge/mergeWith skips `undefined` source values
		if (srcVal === undefined) continue
		const dstVal = dst[key]
		if (customizer) {
			const customized = customizer(dstVal, srcVal, key, dst, source)
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
			_mergeInto(dst[key] as Dict, srcVal, customizer)
		} else if (isPlainObject(srcVal)) {
			if (!isPlainObject(dstVal)) dst[key] = {}
			_mergeInto(dst[key] as Dict, srcVal, customizer)
		} else {
			dst[key] = srcVal
		}
	}
}

function capitalize(string: unknown): string {
	const str = String(string == null ? '' : string)
	if (!str) return ''
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export {
	// core
	get,
	setWith,
	setIn,
	unset,
	cloneDeep,
	isEqual,
	isEmpty,
	isObjectLike,
	isPlainObject,
	merge,
	mergeWith,
	// collections
	flatten,
	// string
	capitalize,
}

