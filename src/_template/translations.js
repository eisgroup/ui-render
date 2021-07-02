import { l, localiseTranslation } from 'utils-pack'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from 'utils-pack/translations'
const TRANSLATION = {
  TEMPLATE: {
    [l.ENGLISH]: 'Template',
    // [l.RUSSIAN]: 'Шаблон',
  },
}
localiseTranslation(TRANSLATION)
