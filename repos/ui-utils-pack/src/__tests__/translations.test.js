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
})
