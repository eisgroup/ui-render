import { languageDropdownOptions } from 'react-ui-pack'
import { isInList, l, LANGUAGE } from 'utils-pack'
import { CONFIG } from './configs'
import { DEFAULT } from './defaults'
import { OPTIONS } from './definitions'

/**
 * COMMON STATE DATA ===========================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

export const LANGUAGE_CODE_BY_COUNTRY = { // Language code by country code
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
