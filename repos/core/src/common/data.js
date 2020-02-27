import { languageDropdownOptions } from '../components/renders'
import { l, LANGUAGE } from './constants'
import { isInList } from './utils'
import { DEFAULT, LANGUAGE_OPTIONS } from './variables'
import { OPTIONS } from './variables/definitions'

/**
 * COMMON STATE DATA ===========================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

export const LANGUAGE_BY = { // country code
  AU: getSupportedLanguageCode(l.ENGLISH),
  US: getSupportedLanguageCode(l.ENGLISH),
  UK: getSupportedLanguageCode(l.ENGLISH),
  RU: getSupportedLanguageCode(l.RUSSIAN),
  BY: getSupportedLanguageCode(l.RUSSIAN),
  UA: getSupportedLanguageCode(l.RUSSIAN),
}
OPTIONS.LANGUAGE = languageDropdownOptions(LANGUAGE)

function getSupportedLanguageCode (langCode, options = LANGUAGE_OPTIONS.map(l => l.code)) {
  return (isInList(options, langCode)) ? langCode : DEFAULT.LANGUAGE
}
