// A tiny subset of lodash we rely on, implemented locally to avoid shipping lodash-es.
// Intentionally limited API surface: only what this repo imports.
//
// @Note on the types (§9.6-E1): these helpers are deliberately polymorphic — they take whatever a
// caller hands them and guard at runtime. The types below stay LOOSE on purpose: `unknown` for the
// values this module inspects, element generics only where the runtime genuinely passes a value
// through, and no tightening of what any function accepts.
//
// Every `any` here is deliberate and confined to three places, none of which is a value this module
// hands back to a caller:
//   1. parameters of USER callbacks (iteratee, comparator, customizer) — a contravariant `unknown`
//      there would reject every caller that annotates its own callback, e.g. `(a: Row, b: Row) => …`;
//   2. the two relational comparisons in `min`/`max`, which are JS's own ordering over values the
//      type system cannot order;
//   3. `throttle`'s saved `arguments`, which is replayed verbatim through `Function.apply`.

/** Anything this module walks with a computed key once it knows the value is object-like. */
type Dict = Record<PropertyKey, unknown>

/** The resolved form of an iteratee shorthand. Callback parameters are `any` — see the note above. */
type IterateeFn = (value: any, index?: any, collection?: any) => unknown

/**
 * The shorthands `toIteratee` understands: a function, a `[path, value]` pair, a source object to
 * match, or any other value — which is treated as a property path, exactly as at runtime. The
 * constituents are spelled out rather than collapsed to `unknown` so that a callback argument still
 * gets its parameters contextually typed.
 */
type Iteratee = IterateeFn | PropertyKey | boolean | bigint | readonly unknown[] | object | null | undefined

/** Custom equality callback, as taken by `uniqWith`/`unionWith`. Truthy means "same value". */
type Comparator = (a: any, b: any) => unknown

/** `setWith`'s customizer: returns the container to create for a missing path segment. */
type SetWithCustomizer = (nsValue: any, key: PropertyKey, nsObject: any) => unknown

/** `mergeWith`'s customizer: a non-`undefined` return wins over the default merge. */
type MergeCustomizer = (dstValue: any, srcValue: any, key: string, dst: any, src: any) => unknown

/** A function whose signature this module does not constrain (`throttle`'s subject). */
type AnyFunction = (...args: any) => any

type ThrottleOptions = { leading?: boolean, trailing?: boolean }

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

function hasPath(object: unknown, path: unknown): boolean {
	const parts = toPath(path)
	if (parts.length === 0) return false
	let cur: unknown = object
	for (const key of parts) {
		if (cur == null || !(key in Object(cur))) return false
		cur = (cur as Dict)[key]
	}
	return true
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

function unset(object: unknown, path: unknown): boolean {
	if (object == null) return false
	const parts = toPath(path)
	if (parts.length === 0) return false
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

function property(path: unknown): (obj: unknown) => unknown {
	return (obj) => get(obj, path)
}

function matches(source: unknown): (object: unknown) => boolean {
	const snapshot = cloneDeep(source)
	return (object) => isMatch(object, snapshot)
}

function matchesProperty(path: unknown, sourceValue: unknown): (object: unknown) => boolean {
	const snapshot = cloneDeep(sourceValue)
	return (object) => {
		const value = get(object, path)
		if (value === undefined && snapshot === undefined && !hasPath(object, path)) return false
		return isObjectLike(snapshot) ? isMatch(value, snapshot) : isEqual(value, snapshot)
	}
}

function toIteratee(value: unknown): IterateeFn {
	if (typeof value === 'function') return value as IterateeFn
	if (value == null) return (item: unknown) => item
	if (Array.isArray(value)) return matchesProperty(value[0], value[1])
	if (isObjectLike(value)) return matches(value)
	return property(value)
}

function isMatch(object: unknown, source: unknown): boolean {
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
		const ov = (object as Dict)[key]
		if (isObjectLike(sv)) {
			if (!isMatch(ov, sv)) return false
		} else if (!sameValueZero(ov, sv)) {
			return false
		}
	}
	return true
}

function some(collection: unknown, predicate?: Iteratee): boolean {
	if (collection == null) return false
	const pred = toIteratee(predicate)
	if (Array.isArray(collection)) {
		for (let i = 0; i < collection.length; i++) {
			if (pred(collection[i], i, collection)) return true
		}
		return false
	}
	const dict = collection as Dict
	for (const key in dict) {
		if (Object.prototype.hasOwnProperty.call(dict, key) && pred(dict[key], key, dict)) return true
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

function min<T>(array: readonly T[] | null | undefined): T | undefined {
	if (!Array.isArray(array) || array.length === 0) return undefined
	let m: T | undefined
	for (const value of array) {
		if (value == null || Number.isNaN(value) || typeof value === 'symbol') continue
		// `<` is JS's own relational comparison over values the type system cannot order
		// (numbers, strings and dates all reach this line); the casts express that, and change
		// nothing at runtime.
		if (m === undefined || (value as any) < (m as any)) m = value
	}
	return m
}

function max<T>(array: readonly T[] | null | undefined): T | undefined {
	if (!Array.isArray(array) || array.length === 0) return undefined
	let m: T | undefined
	for (const value of array) {
		if (value == null || Number.isNaN(value) || typeof value === 'symbol') continue
		// See the note in `min` about the relational-operator casts.
		if (m === undefined || (value as any) > (m as any)) m = value
	}
	return m
}

function difference<T>(array: readonly T[] | null | undefined, values?: unknown): T[] {
	if (!Array.isArray(array)) return []
	const remove = new Set(Array.isArray(values) ? values : [])
	const out: T[] = []
	for (const value of array) if (!remove.has(value)) out.push(value)
	return out
}

function intersection<T>(...arrays: Array<readonly T[] | null | undefined>): T[] {
	if (arrays.length === 0 || arrays.some((array) => !Array.isArray(array))) return []
	const [first, ...rest] = arrays as Array<readonly T[]>
	const restSets = rest.map((a) => new Set(a))
	const out: T[] = []
	const seen = new Set()
	for (const value of first) {
		if (!seen.has(value) && restSets.every((set) => set.has(value))) {
			seen.add(value)
			out.push(value)
		}
	}
	return out
}

function union<T>(...arrays: Array<readonly T[] | null | undefined>): T[] {
	const out: T[] = []
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

function uniqWith<T>(array: readonly T[] | null | undefined, comparator?: Comparator): T[] {
	if (!Array.isArray(array)) return []
	if (typeof comparator !== 'function') return union(array)
	const out: T[] = []
	for (const v of array) {
		if (!out.some((o) => comparator(o, v))) out.push(v)
	}
	return out
}

function unionWith(...args: unknown[]): unknown[] {
	const lastArg = args[args.length - 1]
	const comparator = typeof lastArg === 'function' ? lastArg as Comparator : null
	const arrays = comparator ? args.slice(0, -1) : args
	if (!comparator) return union(...arrays as Array<unknown[]>)
	const out: unknown[] = []
	for (const arr of arrays) {
		if (!Array.isArray(arr)) continue
		for (const v of arr) {
			if (!out.some((o) => comparator(o, v))) out.push(v)
		}
	}
	return out
}

function unionBy(...args: unknown[]): unknown[] {
	const lastArg = args[args.length - 1]
	const iteratee = Array.isArray(lastArg) ? undefined : args.pop()
	const it = toIteratee(iteratee)
	const out: unknown[] = []
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

function throttle(func: AnyFunction, wait: number, options: ThrottleOptions = {}): AnyFunction {
	let lastCallTime = 0
	let timeoutId: ReturnType<typeof setTimeout> | null = null
	// `arguments` of the last throttled call, kept verbatim for `func.apply`.
	let lastArgs: any
	let lastThis: unknown
	const leading = options.leading !== false
	const trailing = options.trailing !== false

	function invoke(time: number) {
		lastCallTime = time
		const args = lastArgs
		const self = lastThis
		lastArgs = lastThis = null
		return func.apply(self, args)
	}

	function startTimer(remaining: number) {
		timeoutId = setTimeout(() => {
			timeoutId = null
			if (trailing && lastArgs) invoke(Date.now())
		}, remaining)
	}

	return function throttled(this: unknown) {
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

function isNumber(value: unknown): boolean {
	return typeof value === 'number' || value instanceof Number
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

