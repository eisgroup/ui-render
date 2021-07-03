import { l, localiseTranslation } from 'utils-pack'
import { _ } from 'utils-pack/translations'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from 'utils-pack/translations'
localiseTranslation({
  INVALID_MODEL_NAME_ID: {
    [l.ENGLISH]: 'Invalid {modelName} ID {id}'
  },
  TIME_RANGES_MUST_BE_A_LIST_OF_CONTINUOUS_TIMESTAMP_RANGES: {
    [l.ENGLISH]: '{timeRanges} must be a list of continuous timestamp ranges'
  }
})
