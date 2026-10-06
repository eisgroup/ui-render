import {
  removeNilValues,
  sanitizeResponse,
} from '../object'

describe('object utility data-integrity contracts', () => {
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

    it('respects the recursive switch when removing nil values', () => {
        const nilInput = { nested: { nil: null, keep: false } }

        expect(removeNilValues(nilInput, { recursive: false })).toEqual(nilInput)
        expect(removeNilValues(nilInput)).toEqual({ nested: { keep: false } })
    })
})
