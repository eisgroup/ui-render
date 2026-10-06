import { LANGUAGE } from '../constants'
import {
  definitionSetup,
  localiseTranslation,
} from '../definitions'
import { Active } from '../_envs'

describe('definition utilities contracts', () => {
  let language
  let defaultLanguage

  beforeEach(() => {
    language = Active.LANG
    defaultLanguage = Active.DEFAULT.LANGUAGE
  })

  afterEach(() => {
    Active.LANG = language
    Active.DEFAULT.LANGUAGE = defaultLanguage
  })

  describe('definitionSetup', () => {
    it('keeps independently configured namespaces isolated', () => {
      const definitions = definitionSetup('TYPE', 'ACTION')

      expect(definitions.TYPE).toBeUndefined()
      expect(definitions.ACTION).toBeUndefined()

      definitions.TYPE = { INPUT: 'Input' }
      definitions.ACTION = { SAVE: 'save' }

      expect(definitions.TYPE).toEqual({ INPUT: 'Input' })
      expect(definitions.ACTION).toEqual({ SAVE: 'save' })
    })

    it('rejects a duplicate key even when its existing value is null', () => {
      const definitions = definitionSetup('TYPE')
      definitions.TYPE = { EMPTY: null }

      expect(() => {
        definitions.TYPE = { EMPTY: 'replacement' }
      }).toThrow(/Duplicate TYPE\[EMPTY\]/)
      expect(definitions.TYPE.EMPTY).toBeNull()
    })

    it('accepts reserved own keys without changing the result prototype', () => {
      const definitions = definitionSetup('TYPE')
      const input = JSON.parse('{"__proto__":"proto-value","constructor":"constructor-value"}')

      definitions.TYPE = input

      expect(Object.getPrototypeOf(definitions.TYPE)).toBe(Object.prototype)
      expect(Object.prototype.hasOwnProperty.call(definitions.TYPE, '__proto__')).toBe(true)
      expect(definitions.TYPE.__proto__).toBe('proto-value')
      expect(definitions.TYPE.constructor).toBe('constructor-value')
    })

    it('does not import inherited definition entries', () => {
      const definitions = definitionSetup('TYPE')
      const input = Object.create({ INHERITED: 'inherited' })
      input.OWN = 'own'

      definitions.TYPE = input

      expect(definitions.TYPE).toEqual({ OWN: 'own' })
      expect(Object.prototype.hasOwnProperty.call(definitions.TYPE, 'INHERITED')).toBe(false)
    })
  })

  describe('localiseTranslation', () => {
    it('uses the active language, default language, and key fallbacks', () => {
      const translations = localiseTranslation({
        __CONTRACT_GREETING__: { en: 'Hello', ru: 'Привет' },
        __CONTRACT_KEY_FALLBACK__: { de: 'Hallo' },
      })

      Active.LANG = { _: 'ru' }
      expect(translations.__CONTRACT_GREETING__).toBe('Привет')

      Active.LANG = { _: 'missing' }
      expect(translations.__CONTRACT_GREETING__).toBe('Hello')
      expect(translations.__CONTRACT_KEY_FALLBACK__).toBe('__CONTRACT_KEY_FALLBACK__')
    })

    it('merges later languages into an existing translation', () => {
      const key = '__CONTRACT_INCREMENTAL__'
      const translations = localiseTranslation({ [key]: { en: 'English' } })
      localiseTranslation({ [key]: { ru: 'Русский' } })

      Active.LANG = { _: 'ru' }
      expect(translations[key]).toBe('Русский')

      Active.LANG = LANGUAGE.ENGLISH
      expect(translations[key]).toBe('English')
    })

    it('supports an empty translation key fallback', () => {
      const translations = localiseTranslation({ '': {} })
      Active.LANG = { _: 'missing' }

      expect(translations['']).toBe('')
    })

    it('treats inherited property names as translations without prototype mutation', () => {
      jest.isolateModules(() => {
        const isolatedDefinitions = require('../definitions')
        const isolatedActive = require('../_envs').Active
        const input = Object.create(null)
        Object.defineProperty(input, '__proto__', {
          enumerable: true,
          value: { en: 'Safe prototype' },
        })
        input.toString = { en: 'Safe toString' }

        const translations = isolatedDefinitions.localiseTranslation(input)

        expect(Object.getPrototypeOf(translations)).toBe(Object.prototype)
        expect(Object.prototype.hasOwnProperty.call(translations, '__proto__')).toBe(true)
        expect(translations.__proto__).toBe('Safe prototype')
        expect(translations.toString).toBe('Safe toString')
        isolatedActive.LANG = LANGUAGE.ENGLISH
      })
    })
  })
})
