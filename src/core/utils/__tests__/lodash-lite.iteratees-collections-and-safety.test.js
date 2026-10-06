import {
  cloneDeep,
  flatten,
  isEqual,
  merge,
  setWith,
} from '../lodash-lite'

describe('lodash-lite sparse array and ordering contracts', () => {
    it('densifies sparse values consistently in flatten and cloneDeep', () => {
        const sparse = new Array(2)
        sparse[1] = 1

        expect(flatten([sparse, new Array(1)])).toEqual([undefined, 1, undefined])
        expect(cloneDeep(sparse)).toEqual([undefined, 1])
        expect(Object.keys(cloneDeep(sparse))).toEqual(['0', '1'])
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
