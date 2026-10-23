import { l, localiseTranslation } from '../../utils'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from '../../utils/translations'
localiseTranslation({
  FORMAT: {
    [l.ENGLISH]: 'Format',
  },
  UPDATING: {
    [l.ENGLISH]: 'Updating',
  },
  UPLOADED: {
    [l.ENGLISH]: 'Uploaded',
  },

  width_X_height: {
    [l.ENGLISH]: '{width} x {height}',
  },

  // Popup Messages
  // ---------------------------------------------------------------------------
  ARE_YOU_SURE_YOU_WANT_TO_REMOVE_file: {
    [l.ENGLISH]: 'Are you sure you want to remove {file}?',
  },
  DIMENSION_OF_file_MUST_BE_ONE_OF_aspectRatios: {
    [l.ENGLISH]: 'Dimension of {file} must be one of {aspectRatios}',
  },
  INVALID_ASPECT_RATIO: {
    [l.ENGLISH]: 'Invalid Aspect Ratio!',
  },
})
