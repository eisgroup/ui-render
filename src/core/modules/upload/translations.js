import { l, localiseTranslation } from 'ui-utils-pack'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from 'ui-utils-pack/translations'
localiseTranslation({
  FILE: {
    [l.ENGLISH]: 'File',
  },
  FILES_ONLY: {
    [l.ENGLISH]: 'files only',
  },
  FILE_UPLOAD_FAILED: {
    [l.ENGLISH]: 'File Upload Failed!',
  },
  FORMAT: {
    [l.ENGLISH]: 'Format',
  },
  MAXIMUM_FILE_SIZE_EXCEEDED: {
    [l.ENGLISH]: 'Maximum File Size Exceeded!',
  },
  MUST_BE_UNDER: {
    [l.ENGLISH]: 'must be under',
  },
  SELECT_OR_DROP: {
    [l.ENGLISH]: 'Select or Drop',
  },
  UPDATING: {
    [l.ENGLISH]: 'Updating',
  },
  UPLOAD: {
    // as verb
    [l.ENGLISH]: 'Upload',
  },
  UPLOAD_file: {
    // as verb
    [l.ENGLISH]: 'Upload {file}',
  },
  UPLOAD_file_FILE: {
    [l.ENGLISH]: 'Upload {file} File',
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
