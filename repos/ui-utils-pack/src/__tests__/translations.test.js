import { Active } from '../_envs'
import { l, LANGUAGE } from '../constants'
import { localiseTranslation } from '../definitions'
import { cloneDeep } from '../object'
import { interpolateString } from '../string'
import { _ } from '../translations'

describe(`i18n translation`, () => {
  const variable = 'Hello'
  const type = '!'
  const english = 'Test {variable} Message{type}'
  const englishInterpolated = `Test ${variable} Message${type}`
  const russian = '{type}Тэст {variable} Сообщение'
  const russianInterpolated = `${type}Тэст ${variable} Сообщение`
  const TRANSLATION = {
    TEST_VARIABLE_MESSAGE_TYPE: {
      [l.ENGLISH]: english,
    },
  }
  const activeLang = cloneDeep(Active.LANG)
  const activeDefault = cloneDeep(Active.DEFAULT)
  afterAll(() => {
    Active.LANG = activeLang
    Active.DEFAULT = activeDefault
  })

  /* Tests must run in correct order */
  test(`returns 'Untranslated' for undefined string`, () => {
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual('Untranslated')
  })
  test(`returns correct translation for active language`, () => {
    localiseTranslation(TRANSLATION)
    Active.LANG = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`fallbacks to Active.DEFAULT.LANGUAGE if active language has no translation`, () => {
    Active.LANG = LANGUAGE.RUSSIAN
    Active.DEFAULT.LANGUAGE = LANGUAGE.ENGLISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`returns translation key if fallback does not exist`, () => {
    Active.LANG = LANGUAGE.RUSSIAN
    Active.DEFAULT.LANGUAGE = LANGUAGE.SPANISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual('TEST_VARIABLE_MESSAGE_TYPE')
  })
  test(`can redefine the same translation key repeatedly to add translations`, () => {
    const TRANSLATION = {
      TEST_VARIABLE_MESSAGE_TYPE: {
        [l.RUSSIAN]: russian,
      },
    }
    localiseTranslation(TRANSLATION)
    Active.LANG = LANGUAGE.RUSSIAN
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(russian)
    Active.LANG = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`works with string interpolation`, () => {
    Active.LANG = LANGUAGE.ENGLISH
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(englishInterpolated)
    Active.LANG = LANGUAGE.RUSSIAN
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(russianInterpolated)
  })
})
