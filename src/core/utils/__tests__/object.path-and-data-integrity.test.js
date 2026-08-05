import {
    fromFlatObj,
    pop,
    removeEmptyValues,
    removeKeys,
    removeNilValues,
    sanitizeResponse,
} from '../object'

describe('object utility data-integrity contracts', () => {
    it.each([
        ['zero', 0],
        ['false', false],
        ['empty string', ''],
        ['null', null],
    ])('pops a present %s value instead of replacing it with the fallback', (_, value) => {
        const input = { nested: { value } }

        expect(pop(input, 'nested.value', 'fallback')).toBe(value)
        expect(input).toEqual({ nested: {} })
    })

    it('returns the fallback without mutating the object when a path is missing', () => {
        const input = { nested: { value: 1 } }

        expect(pop(input, 'nested.missing', 'fallback')).toBe('fallback')
        expect(input).toEqual({ nested: { value: 1 } })
    })

    it('applies custom response tags recursively while keeping the source isolated', () => {
        const input = {
            secret: 'root',
            nested: { secret: 'child', keep: false },
            rows: [{ secret: 'row', keep: 0 }, null],
        }

        expect(sanitizeResponse(input, { tags: ['secret'], clone: true })).toEqual({
            nested: { keep: false },
            rows: [{ keep: 0 }],
        })
        expect(input).toEqual({
            secret: 'root',
            nested: { secret: 'child', keep: false },
            rows: [{ secret: 'row', keep: 0 }, null],
        })
    })

    it('does not allow prototype paths to escape the unflattened result', () => {
        const result = fromFlatObj({
            '__proto__.polluted': 'yes',
            'safe.__proto__.polluted': 'also yes',
            'safe.value': 1,
        })

        expect(Object.prototype.polluted).toBeUndefined()
        expect(result).toEqual({ safe: { value: 1 } })
    })

    it('creates arrays for numeric paths and can force numeric keys to remain objects', () => {
        const flat = {
            'rows.0.name': 'first',
            'rows.1.name': 'second',
        }

        expect(fromFlatObj(flat)).toEqual({
            rows: [{ name: 'first' }, { name: 'second' }],
        })
        expect(fromFlatObj(flat, { object: true })).toEqual({
            rows: {
                0: { name: 'first' },
                1: { name: 'second' },
            },
        })
    })

    it('honors overwrite when a scalar path conflicts with a nested path', () => {
        const flat = { root: 'scalar', 'root.child': 'nested' }

        expect(fromFlatObj(flat)).toEqual({ root: 'scalar' })
        expect(fromFlatObj(flat, { overwrite: true })).toEqual({
            root: { child: 'nested' },
        })
    })

    it('recursively removes keys from a clone without mutating nested source data', () => {
        const input = {
            secret: 'root',
            rows: [{ secret: 'row', value: 1 }],
        }

        expect(removeKeys(input, ['secret'], { clone: true, recursive: true })).toEqual({
            rows: [{ value: 1 }],
        })
        expect(input).toEqual({
            secret: 'root',
            rows: [{ secret: 'row', value: 1 }],
        })
    })

    it('respects the recursive switch when removing empty and nil values', () => {
        const emptyInput = { nested: { empty: '', keep: 'value' } }
        const nilInput = { nested: { nil: null, keep: false } }

        expect(removeEmptyValues(emptyInput, { recursive: false })).toEqual(emptyInput)
        expect(removeNilValues(nilInput, { recursive: false })).toEqual(nilInput)
        expect(removeEmptyValues(emptyInput)).toEqual({ nested: { keep: 'value' } })
        expect(removeNilValues(nilInput)).toEqual({ nested: { keep: false } })
    })
})
