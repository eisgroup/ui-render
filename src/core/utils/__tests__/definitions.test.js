import {
    definitionSetup,
    definitionByValue,
} from '../definitions'

describe('definitionSetup', () => {
    it('allows initial assignment and exposes via getter', () => {
        const FIELD = definitionSetup('TYPE')
        FIELD.TYPE = { A: 'a', B: 'b' }
        expect(FIELD.TYPE).toEqual({ A: 'a', B: 'b' })
    })

    it('allows extending the definition via further assignment', () => {
        const FIELD = definitionSetup('TYPE')
        FIELD.TYPE = { A: 'a' }
        FIELD.TYPE = { B: 'b' }
        expect(FIELD.TYPE).toEqual({ A: 'a', B: 'b' })
    })

    it('throws on duplicate key', () => {
        const FIELD = definitionSetup('TYPE')
        FIELD.TYPE = { A: 'a' }
        expect(() => {
            FIELD.TYPE = { A: 'b' }
        }).toThrow(/Duplicate TYPE\[A\]/)
    })

    it('throws on duplicate value', () => {
        const FIELD = definitionSetup('TYPE')
        FIELD.TYPE = { A: 'a' }
        expect(() => {
            FIELD.TYPE = { B: 'a' }
        }).toThrow(/Duplicate TYPE\[B\] definition value "a"/)
    })
})

describe('definitionByValue', () => {
    it('keys the object by underscore value', () => {
        expect(definitionByValue({ ENGLISH: { _: 'en', en: 'English' } })).toEqual({
            en: { _: 'en', en: 'English' },
        })
    })
})
