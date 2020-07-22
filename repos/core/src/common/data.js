import { CONFIG, DEFAULT, OPTIONS } from 'modules-pack/variables'
import { languageDropdownOptions } from 'react-ui-pack/renders'
import { isInList, l, LANGUAGE } from 'utils-pack'

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

function getSupportedLanguageCode (langCode, options = CONFIG.LANGUAGE_OPTIONS.map(l => l._)) {
  return (isInList(options, langCode)) ? langCode : DEFAULT.LANGUAGE
}
