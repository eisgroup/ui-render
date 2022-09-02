import { l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from 'ui-utils-pack/translations'
localiseTranslation({
  INVALID_modelName_ID_id: {
    [l.ENGLISH]: 'Invalid {modelName} ID {id}'
  },
  timeRanges_MUST_BE_A_LIST_OF_CONTINUOUS_TIMESTAMP_RANGES: {
    [l.ENGLISH]: '{timeRanges} must be a list of continuous timestamp ranges'
  }
})
