import {
    cloneDeep,
    difference,
    flatten,
    intersection,
    isEqual,
    matches,
    max,
    merge,
    min,
    property,
    setWith,
    some,
    unionBy,
    unionWith,
    uniqWith,
} from '../lodash-lite'

describe('lodash-lite iteratee shorthand contracts', () => {
    it('supports property-path shorthand in some', () => {
        const rows = [
            { meta: { active: false } },
            { meta: { active: true } },
        ]

        expect(some(rows, 'meta.active')).toBe(true)
    })

    it('supports matches-property shorthand and distinguishes a missing path', () => {
        const rows = [
            { meta: { role: 'user' } },
            { meta: { role: 'admin' } },
        ]

        expect(some(rows, ['meta.role', 'admin'])).toBe(true)
        expect(some([{}], ['value', undefined])).toBe(false)
        expect(some([{ value: undefined }], ['value', undefined])).toBe(true)
    })

    it('uses identity for a null predicate', () => {
        expect(some([0, null, 2], null)).toBe(true)
        expect(some([0, null, false], undefined)).toBe(false)
    })

    it('visits sparse indexes and forwards index plus collection to a function iteratee', () => {
        const sparse = new Array(3)
        sparse[2] = 'value'
        const calls = []

        expect(some(sparse, (value, index, collection) => {
            calls.push([value, index, collection])
            return false
        })).toBe(false)

        expect(calls.map(([, index]) => index)).toEqual([0, 1, 2])
        expect(calls.every(([, , collection]) => collection === sparse)).toBe(true)
    })

    it('snapshots matches input and compares NaN with SameValueZero semantics', () => {
        const source = { meta: { score: 1 } }
        const predicate = matches(source)
        source.meta.score = 2

        expect(predicate({ meta: { score: 1 }, extra: true })).toBe(true)
        expect(matches({ score: NaN })({ score: NaN })).toBe(true)
    })

    it('matches nested arrays as unordered partial collections', () => {
        const predicate = matches({ tags: [{ id: 1 }, { id: 2 }] })

        expect(predicate({ tags: [{ id: 2 }, { id: 3 }, { id: 1 }] })).toBe(true)
        expect(predicate({ tags: [{ id: 1 }] })).toBe(false)
    })

    it('supports array paths in property accessors', () => {
        const read = property(['rows', 0, 'value'])

        expect(read({ rows: [{ value: 7 }] })).toBe(7)
    })
})

describe('lodash-lite sparse array and ordering contracts', () => {
    it('densifies sparse values consistently in flatten, cloneDeep, and difference', () => {
        const sparse = new Array(2)
        sparse[1] = 1

        expect(flatten([sparse, new Array(1)])).toEqual([undefined, 1, undefined])
        expect(cloneDeep(sparse)).toEqual([undefined, 1])
        expect(Object.keys(cloneDeep(sparse))).toEqual(['0', '1'])
        expect(difference(sparse, [])).toEqual([undefined, 1])
    })

    it('returns a unique intersection in first-array order using SameValueZero', () => {
        expect(intersection([2, 1, 2, NaN], [1, 2, NaN])).toEqual([2, 1, NaN])
    })

    it('returns an empty intersection when any supplied collection is invalid', () => {
        expect(intersection([1, 2], null, [2])).toEqual([])
    })

    it('ignores sparse holes, null, and NaN when finding extrema', () => {
        const values = new Array(5)
        values[1] = null
        values[2] = NaN
        values[4] = 3

        expect(min(values)).toBe(3)
        expect(max(values)).toBe(3)
        expect(min([undefined, null, NaN])).toBeUndefined()
    })

    it('keeps first occurrence order for nested property and default unionBy iteratees', () => {
        const first = { meta: { id: 2 }, label: 'first' }
        const duplicate = { meta: { id: 2 }, label: 'duplicate' }
        const other = { meta: { id: 1 }, label: 'other' }

        expect(unionBy([first], [other, duplicate], 'meta.id')).toEqual([first, other])
        expect(unionBy([2, 1], [2, 3])).toEqual([2, 1, 3])
    })

    it('falls back to SameValueZero uniqueness when comparators are omitted', () => {
        expect(uniqWith([1, 1, NaN, NaN, 2])).toEqual([1, NaN, 2])
        expect(unionWith([1, 1], [2, 2])).toEqual([1, 2])
    })
})

describe('lodash-lite equality contracts', () => {
    it('deeply compares Map keys and values independent of insertion order', () => {
        const first = new Map([
            [{ id: 1 }, { value: ['a'] }],
            [{ id: 2 }, { value: ['b'] }],
        ])
        const second = new Map([
            [{ id: 2 }, { value: ['b'] }],
            [{ id: 1 }, { value: ['a'] }],
        ])

        expect(isEqual(first, second)).toBe(true)
    })

    it('deeply compares Set values independent of insertion order', () => {
        const first = new Set([{ id: 1 }, { id: 2 }])
        const second = new Set([{ id: 2 }, { id: 1 }])

        expect(isEqual(first, second)).toBe(true)
    })

    it('treats invalid dates and equivalent boxed primitives as equal', () => {
        expect(isEqual(new Date('invalid'), new Date('invalid'))).toBe(true)
        // eslint-disable-next-line no-new-wrappers
        expect(isEqual(new Number(2), new Number(2))).toBe(true)
    })

    it('includes enumerable symbol keys in object equality', () => {
        const key = Symbol('key')

        expect(isEqual({ [key]: 1 }, { [key]: 2 })).toBe(false)
        expect(isEqual({ [key]: { value: 1 } }, { [key]: { value: 1 } })).toBe(true)
    })
})

describe('lodash-lite merge and invalid-input contracts', () => {
    it('creates an object when merge receives a nullish target', () => {
        expect(merge(null, { a: { b: 1 } })).toEqual({ a: { b: 1 } })
        expect(merge(undefined, { a: 1 })).toEqual({ a: 1 })
    })

    it('overlays sparse source arrays by index without deleting target entries', () => {
        const target = { rows: [{ keep: 0 }, { keep: 1 }, { keep: 2 }] }
        const sparse = new Array(3)
        sparse[2] = { added: 2 }

        expect(merge(target, { rows: sparse })).toEqual({
            rows: [{ keep: 0 }, { keep: 1 }, { keep: 2, added: 2 }],
        })
    })

    it('merges inherited enumerable source properties', () => {
        const source = Object.create({ inherited: { value: 1 } })
        source.own = 2

        expect(merge({}, source)).toEqual({ own: 2, inherited: { value: 1 } })
    })

    it('does not allow __proto__ source keys to pollute Object.prototype', () => {
        const source = JSON.parse('{"__proto__":{"polluted":"yes"}}')
        let pollution
        let inherited

        try {
            const target = merge({}, source)
            pollution = {}.polluted
            inherited = target.polluted
        } finally {
            delete Object.prototype.polluted
        }

        expect(pollution).toBeUndefined()
        expect(inherited).toBeUndefined()
    })

    it('replaces a primitive encountered in the middle of a setWith path', () => {
        const target = { a: 1 }

        expect(setWith(target, 'a.b', 2)).toEqual({ a: { b: 2 } })
    })

    it.each([
        '__proto__.polluted',
        'constructor.prototype.polluted',
        'prototype.polluted',
    ])('does not traverse unsafe setWith path %s', path => {
        const target = {}
        let pollution

        try {
            setWith(target, path, 'yes')
            pollution = {}.polluted
        } finally {
            delete Object.prototype.polluted
        }

        expect(pollution).toBeUndefined()
        expect(target).toEqual({})
    })
})
