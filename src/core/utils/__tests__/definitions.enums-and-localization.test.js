import { LANGUAGE } from '../constants'
import {
  definitionByValue,
  definitionSetup,
  enumFrom,
  localise,
  localiseTranslation,
  optionsFrom,
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

  describe('definition projections', () => {
    it('maps array definitions by value and preserves the last duplicate', () => {
      const first = { _: 'same', en: 'First' }
      const second = { _: 'same', en: 'Second' }

      expect(definitionByValue([first, second])).toEqual({ same: second })
    })

    it('maps a reserved underscore value as data without mutating the prototype', () => {
      const item = { _: '__proto__', en: 'Prototype' }
      const result = definitionByValue({ ITEM: item })

      expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
      expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true)
      expect(result.__proto__).toBe(item)
    })

    it('returns own enum values in definition order', () => {
      const input = Object.create({ INHERITED: { _: 'inherited' } })
      input.FIRST = { _: 0 }
      input.SECOND = { _: ['a', 'b'] }

      expect(enumFrom(input)).toEqual([0, ['a', 'b']])
    })
  })

  describe('optionsFrom', () => {
    const definitions = {
      FIRST: { _: ['a', 'b'], en: 'First', ru: 'Первый' },
      SECOND: { _: 0, en: 'Second' },
    }

    it('builds language-specific options and serializes array values', () => {
      const options = optionsFrom(definitions)

      expect(options.en).toEqual([
        { text: 'First', value: 'a,b' },
        { text: 'Second', value: 0 },
      ])
      expect(options.ru).toEqual([{ text: 'Первый', value: 'a,b' }])
      expect(definitions.FIRST._).toEqual(['a', 'b'])
    })

    it('exposes the exact active language when it exists', () => {
      const options = optionsFrom(definitions)
      Active.LANG = { _: 'ru' }

      expect(options.items).toBe(options.ru)
    })

    it('falls back to English and then an empty list', () => {
      Active.LANG = { _: 'missing' }
      expect(optionsFrom(definitions).items).toEqual([
        { text: 'First', value: 'a,b' },
        { text: 'Second', value: 0 },
      ])

      expect(optionsFrom({ ONLY: { _: 'only', ru: 'Только' } }).items).toEqual([])
    })

    it('ignores inherited definitions and language labels', () => {
      const input = Object.create({ INHERITED: { _: 'inherited', en: 'Inherited' } })
      input.OWN = Object.assign(Object.create({ ru: 'Inherited language' }), {
        _: 'own',
        en: 'Own',
      })

      const options = optionsFrom(input)

      expect(options.en).toEqual([{ text: 'Own', value: 'own' }])
      expect(options.ru).toBeUndefined()
    })
  })

  describe('localise', () => {
    it('switches active language and falls back to English', () => {
      const definitions = {
        ITEM: { _: 'item', en: 'English', ru: 'Русский' },
      }
      localise(definitions)

      Active.LANG = { _: 'ru' }
      expect(definitions.ITEM.name).toBe('Русский')

      Active.LANG = { _: 'missing' }
      expect(definitions.ITEM.name).toBe('English')
    })

    it('falls back to a string representation of the underscore value', () => {
      const definitions = {
        ZERO: { _: 0 },
        LIST: { _: ['a', 'b'] },
      }
      localise(definitions)

      expect(definitions.ZERO.name).toBe('0')
      expect(definitions.LIST.name).toBe('a,b')
    })

    it('recurses through groups while preserving an explicit name', () => {
      const definitions = {
        GROUP: {
          name: 'Existing group',
          ITEM: { _: 'item', en: 'Nested item' },
        },
      }

      localise(definitions)
      localise(definitions)

      expect(definitions.GROUP.name).toBe('Existing group')
      expect(definitions.GROUP.ITEM.name).toBe('Nested item')
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
