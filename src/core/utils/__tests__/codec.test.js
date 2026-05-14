import { toJSON, fromJSON } from '../codec'

describe('toJSON', () => {
    it('returns non-object values as-is', () => {
        expect(toJSON('hello')).toBe('hello')
        expect(toJSON(42)).toBe(42)
        expect(toJSON(true)).toBe(true)
        expect(toJSON(undefined)).toBe(undefined)
    })

    it('serializes plain objects', () => {
        expect(toJSON({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}')
    })

    it('serializes arrays', () => {
        expect(toJSON([1, 2, 3])).toBe('[1,2,3]')
    })

    it('serializes null as "null"', () => {
        expect(toJSON(null)).toBe('null')
    })

    it('respects the space argument for pretty-printing', () => {
        expect(toJSON({ a: 1 }, null, 2)).toBe('{\n  "a": 1\n}')
    })

    it('applies a custom replacer', () => {
        const replacer = (key, value) => (key === 'secret' ? undefined : value)
        expect(toJSON({ a: 1, secret: 'x' }, replacer)).toBe('{"a":1}')
    })

    it('replaces circular references with "[Circular]"', () => {
        const obj = { name: 'root' }
        obj.self = obj
        const json = toJSON(obj)
        expect(json).toContain('"[Circular]"')
        expect(() => JSON.parse(json)).not.toThrow()
    })

    it('handles circular references inside arrays', () => {
        const arr = [1, 2]
        arr.push(arr)
        expect(() => toJSON(arr)).not.toThrow()
        expect(toJSON(arr)).toContain('[Circular]')
    })
})

describe('fromJSON', () => {
    it('parses a valid JSON string', () => {
        expect(fromJSON('{"a":1}')).toEqual({ a: 1 })
    })

    it('parses JSON arrays', () => {
        expect(fromJSON('[1,2,3]')).toEqual([1, 2, 3])
    })

    it('parses JSON primitives', () => {
        expect(fromJSON('true')).toBe(true)
        expect(fromJSON('null')).toBe(null)
        expect(fromJSON('42')).toBe(42)
    })

    it('returns the original input on parse failure', () => {
        expect(fromJSON('not json')).toBe('not json')
        expect(fromJSON('{a:1}')).toBe('{a:1}')
    })

    it('returns the original input for undefined', () => {
        expect(fromJSON(undefined)).toBe(undefined)
    })
})
