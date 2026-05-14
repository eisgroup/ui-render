import {
    definitionSetup,
    definitionByValue,
    enumFrom,
    optionsFrom,
    localise,
} from '../definitions'
import { LANGUAGE } from '../constants'

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

describe('enumFrom', () => {
    it('returns the list of underscore values', () => {
        expect(enumFrom(LANGUAGE)).toContain('en')
        expect(enumFrom(LANGUAGE)).toContain('ru')
    })
})

describe('optionsFrom', () => {
    it('groups options by language code', () => {
        const options = optionsFrom(LANGUAGE)
        expect(Array.isArray(options.en)).toBe(true)
        expect(options.en.find(o => o.value === 'en')).toBeTruthy()
    })

    it('items getter returns active language options or English fallback', () => {
        const options = optionsFrom(LANGUAGE)
        expect(Array.isArray(options.items)).toBe(true)
        expect(options.items.length).toBeGreaterThan(0)
    })
})

describe('localise', () => {
    it('adds a .name getter that returns the active language value', () => {
        const DEF = {
            FOO: { _: 'foo', en: 'Foo English' },
        }
        localise(DEF)
        expect(DEF.FOO.name).toBe('Foo English')
    })
})
