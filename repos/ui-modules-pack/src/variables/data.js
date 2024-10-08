import { languageDropdownOptions } from 'ui-react-pack'
import { isInList, l, LANGUAGE } from 'ui-utils-pack'
import { CONFIG } from './configs'
import { DEFAULT } from './defaults'
import { OPTIONS } from './definitions'

/**
 * COMMON STATE DATA ===========================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */
OPTIONS.LANGUAGE = languageDropdownOptions(LANGUAGE)

function getSupportedLanguageCode (langCode, options = CONFIG.LANGUAGE_OPTIONS.map(l => l._)) {
  return (isInList(options, langCode)) ? langCode : DEFAULT.LANGUAGE
}
