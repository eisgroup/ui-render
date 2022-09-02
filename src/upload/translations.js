import { l, localiseTranslation } from 'ui-utils-pack'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */
export { _ } from 'ui-utils-pack/translations'
localiseTranslation({
  FILE: {
    [l.ENGLISH]: 'File',
    // [l.RUSSIAN]: 'Файл',
  },
  FILES_ONLY: {
    [l.ENGLISH]: 'files only',
    // [l.RUSSIAN]: 'файлы только',
  },
  FILE_UPLOAD_FAILED: {
    [l.ENGLISH]: 'File Upload Failed!',
    // [l.RUSSIAN]: 'Ошибка Загрузки Файла!',
  },
  FORMAT: {
    [l.ENGLISH]: 'Format',
    // [l.RUSSIAN]: 'Формат',
  },
  MAXIMUM_FILE_SIZE_EXCEEDED: {
    [l.ENGLISH]: 'Maximum File Size Exceeded!',
    // [l.RUSSIAN]: 'Превышен Максимальный Размер Файла!',
  },
  MUST_BE_UNDER: {
    [l.ENGLISH]: 'must be under',
    // [l.RUSSIAN]: 'должен быть до',
  },
  SELECT_OR_DROP: {
    [l.ENGLISH]: 'Select or Drop',
    // [l.RUSSIAN]: 'Выберите или Перетащите',
  },
  UPDATING: {
    [l.ENGLISH]: 'Updating',
    // [l.RUSSIAN]: 'Обновление',
  },
  UPLOAD: {
    // as verb
    [l.ENGLISH]: 'Upload',
    // [l.RUSSIAN]: 'Загрузите',
  },
  UPLOAD_file: {
    // as verb
    [l.ENGLISH]: 'Upload {file}',
    // [l.RUSSIAN]: 'Загрузите {file}',
  },
  UPLOAD_file_FILE: {
    [l.ENGLISH]: 'Upload {file} File',
  },
  UPLOADED: {
    // as verb
    [l.ENGLISH]: 'Uploaded',
    // [l.RUSSIAN]: 'Загружен',
  },

  width_X_height: {
    // as verb
    [l.ENGLISH]: '{width} x {height}',
    // [l.RUSSIAN]: 'Загружен',
  },

  // Popup Messages
  // ---------------------------------------------------------------------------
  ARE_YOU_SURE_YOU_WANT_TO_REMOVE_file: {
    [l.ENGLISH]: 'Are you sure you want to remove {file}?',
    // [l.RUSSIAN]: 'Вы уверены, что хотите удалить {file}?',
  },
  DIMENSION_OF_file_MUST_BE_ONE_OF_aspectRatios: {
    [l.ENGLISH]: 'Dimension of {file} must be one of {aspectRatios}',
    // [l.RUSSIAN]: 'Измерение {file} должно быть одним из {aspectRatios}',
  },
  INVALID_ASPECT_RATIO: {
    [l.ENGLISH]: 'Invalid Aspect Ratio!',
    // [l.RUSSIAN]: 'Неверное Соотношение Сторон!',
  },
})
