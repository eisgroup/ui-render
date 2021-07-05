import { l } from './constants'
import { localiseTranslation } from './definitions'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */

/**
 * Localised String Object (can be extended by adding new terms or languages)
 * @note: follow the example to ensure only one instance of translation exists.
 * @example:
 *    import { l, localiseTranslation } from 'utils-pack'
 *    export { _ } from 'utils-pack/translations'
 *    localiseTranslation({
 *      NEW_PHRASE: {
 *        [l.ENGLISH]: 'New Phrase',
 *        [l.RUSSIAN]: 'Новая Фраза',
 *      },
 *    })
 * @usage:
 *    console.log(_.NEW_PHRASE)
 *    >>> 'New Phrase'
 *    console.log(_.THANK_YOU)
 *    >>> 'Thank You!'
 * @returns {Object} localised string - that returns localised 'Untranslated' string if no translation found
 */
export const _ = new Proxy(localiseTranslation.instance, {
  get (target, prop) {
    return target[prop] || target.UNTRANSLATED
  }
})
localiseTranslation({
  // Default messaged for undefined strings
  UNTRANSLATED: {
    [l.ENGLISH]: 'Untranslated',
    // @Note: only english is provided in the bundle definition
    // All other languages are to be loaded on the fly as static assets,
    // so that they can be cached by the the browser.
  },

  // Actions
  // ---------------------------------------------------------------------------
  ADD: {
    [l.ENGLISH]: 'Add',
    // [l.RUSSIAN]: 'Добавить',
  },
  CLICK_HERE: {
    [l.ENGLISH]: 'Click here',
    // [l.RUSSIAN]: 'Кликните сюда',
  },
  CONTACT_US: {
    [l.ENGLISH]: 'Contact Us',
    // [l.RUSSIAN]: 'Связаться с Нами',
  },
  CONFIRM_ACTION: {
    [l.ENGLISH]: 'Confirm Action',
    // [l.RUSSIAN]: 'Подтвердите Действие',
  },
  COPY: {
    // as verb
    [l.ENGLISH]: 'Copy',
    // [l.RUSSIAN]: 'Копировать',
  },
  COPIED: {
    [l.ENGLISH]: 'Copied',
    // [l.RUSSIAN]: 'Скопированно',
  },
  NO: {
    [l.ENGLISH]: 'No',
    // [l.RUSSIAN]: 'Нет',
  },
  YES: {
    [l.ENGLISH]: 'Yes',
    // [l.RUSSIAN]: 'Да',
  },
  OK: {
    [l.ENGLISH]: 'Ok',
    // [l.RUSSIAN]: 'Ок',
  },
  ERROR: {
    [l.ENGLISH]: 'Error',
    // [l.RUSSIAN]: 'Ошибка',
  },
  ERROR_MESSAGE: {
    [l.ENGLISH]: 'Error Message',
    // [l.RUSSIAN]: 'Сообщение Ошибки',
  },
  ERROR_INFO: {
    [l.ENGLISH]: 'Error Info',
    // [l.RUSSIAN]: 'Информация об Ошибке',
  },
  ERROR_STACK: {
    [l.ENGLISH]: 'Error Stack',
    // [l.RUSSIAN]: 'Стек Ошибок',
  },
  DATA_CAUSING_ERROR: {
    [l.ENGLISH]: 'Data Causing Error',
    // [l.RUSSIAN]: 'Данные Вызывающие Ошибку',
  },
  CLOSE: {
    [l.ENGLISH]: 'Close',
    // [l.RUSSIAN]: 'Закрыть',
  },
  OPEN: {
    [l.ENGLISH]: 'Open',
    // [l.RUSSIAN]: 'Открыть',
  },
  DELETE: {
    [l.ENGLISH]: 'Delete',
    // [l.RUSSIAN]: 'Удалить',
  },
  REMOVE: {
    [l.ENGLISH]: 'Remove',
    // [l.RUSSIAN]: 'Убрать',
  },
  BACK: {
    [l.ENGLISH]: 'Back',
    // [l.RUSSIAN]: 'Обратно',
  },
  NEXT: {
    [l.ENGLISH]: 'Next',
    // [l.RUSSIAN]: 'Следующий',
  },
  NEW: {
    [l.ENGLISH]: 'New',
    // [l.RUSSIAN]: 'Новое',
  },
  LOGIN: {
    [l.ENGLISH]: 'Login',
    // [l.RUSSIAN]: 'Войти',
  },
  LOGIN_noun: {
    [l.ENGLISH]: 'Login',
    // [l.RUSSIAN]: 'Вход',
  },
  LOGOUT: {
    [l.ENGLISH]: 'Logout',
    // [l.RUSSIAN]: 'Выйти',
  },
  REGISTER: {
    [l.ENGLISH]: 'Register',
    // [l.RUSSIAN]: 'Зарегистрировать',
  },
  RESET: {
    [l.ENGLISH]: 'Reset',
    // [l.RUSSIAN]: 'Сбросить',
  },
  RETRY: {
    [l.ENGLISH]: 'Retry',
    // [l.RUSSIAN]: 'Повторить',
  },
  SELECT: {
    [l.ENGLISH]: 'Select',
    // [l.RUSSIAN]: 'Выбрать',
  },
  SEARCH: {
    [l.ENGLISH]: 'Search',
    // [l.RUSSIAN]: 'Поиск',
  },
  SEARCHING___: {
    [l.ENGLISH]: 'Searching...',
    // [l.RUSSIAN]: 'В поиске...',
  },
  SIGN_IN: {
    [l.ENGLISH]: 'Sign in',
    // [l.RUSSIAN]: 'Войти',
  },
  SIGN_IN_noun: {
    [l.ENGLISH]: 'Sign in',
    // [l.RUSSIAN]: 'Вход',
  },
  SIGNUP: {
    [l.ENGLISH]: 'Signup',
    // [l.RUSSIAN]: 'Зарегистрироваться',
  },
  SIGNUP_noun: {
    [l.ENGLISH]: 'Signup',
    // [l.RUSSIAN]: 'Регистрация',
  },
  SEND: {
    [l.ENGLISH]: 'Send',
    // [l.RUSSIAN]: 'Послать',
  },
  SUBMIT: {
    [l.ENGLISH]: 'Submit',
    // [l.RUSSIAN]: 'Послать',
  },
  SAVE: {
    [l.ENGLISH]: 'Save',
    // [l.RUSSIAN]: 'Сохранить',
  },
  SAVED: {
    [l.ENGLISH]: 'Saved',
    // [l.RUSSIAN]: 'Сохранено',
  },
  SAVE_TO_FAVORITES: {
    [l.ENGLISH]: 'Save to Favorites',
    // [l.RUSSIAN]: 'Сохранить в Избранное',
  },
  TYPE_A_MESSAGE: {
    [l.ENGLISH]: 'Type a message',
    // [l.RUSSIAN]: 'Введите сообщение',
  },
  ARE_YOU_SURE_YOU_WANT_TO: {
    [l.ENGLISH]: 'Are you sure you want to',
    // [l.RUSSIAN]: 'Вы уверены, что хотите',
  },
  ARE_YOU_SURE_YOU_WANT_TO_REMOVE: {
    [l.ENGLISH]: 'Are you sure you want to remove',
    // [l.RUSSIAN]: 'Вы уверены, что хотите удалить',
  },
  HIDE: {
    [l.ENGLISH]: 'Hide',
    // [l.RUSSIAN]: 'Скрыть',
  },
  SHOW: {
    [l.ENGLISH]: 'Show',
    // [l.RUSSIAN]: 'Показать',
  },
  SHOW_LESS: {
    [l.ENGLISH]: 'Show less',
    // [l.RUSSIAN]: 'Показать меньше',
  },
  READ_MORE: {
    [l.ENGLISH]: 'Read more',
    // [l.RUSSIAN]: 'Читать далее',
  },

  // Common
  // ---------------------------------------------------------------------------
  BY: {
    [l.ENGLISH]: 'by',
    // [l.RUSSIAN]: '',
  },
  BETWEEN: {
    [l.ENGLISH]: 'between',
    // [l.RUSSIAN]: 'между',
  },
  OR: {
    [l.ENGLISH]: 'or',
    // [l.RUSSIAN]: 'или',
  },
  PRIVACY_POLICY: {
    [l.ENGLISH]: 'Privacy Policy',
    // [l.RUSSIAN]: 'Политика Конфиденциальности',
  },
  YOUR_INFO_IS_SAFE_WITH_US_SEE_OUR: {
    [l.ENGLISH]: 'Your info is safe with us, see our',
    // [l.RUSSIAN]: 'Ваша информация в безопасности с нами, смотрите',
  },
  TERMS_OF_SERVICE: {
    [l.ENGLISH]: 'Terms of Service',
    // [l.RUSSIAN]: 'Условия Обслуживания',
  },
  TESTER: {
    [l.ENGLISH]: 'Tester',
    // [l.RUSSIAN]: 'Тестер',
  },
  THANK_YOU: {
    [l.ENGLISH]: 'Thank You!',
    // [l.RUSSIAN]: 'Спасибо!',
  },
  WE_HAVE_RECEIVED_YOUR_MESSAGE_AND_WILL_GET_IN_TOUCH_SHORTLY: {
    [l.ENGLISH]: 'We have received your message and will get in touch shortly',
    // [l.RUSSIAN]: 'Мы получили ваше сообщение и вскоре свяжемся с вами',
  },
  OUR_SITE_USES_COOKIES_BY_CONTINUING_TO_USE_OUR_SITE_YOU_ARE_AGREEING_TO_OUR: {
    [l.ENGLISH]: 'Our site uses cookies. By continuing to use our site you are agreeing to our',
    // [l.RUSSIAN]: 'Этот сайт использует cookies. Мы используем файлы cookie для запоминания и анализа ваших предпочтений. Продолжая пользоваться сайтом, вы соглашаетесь на использование файлов cookie',
  },
  OK_I_UNDERSTAND: {
    [l.ENGLISH]: 'OK, I understand',
    // [l.RUSSIAN]: 'Понятно',
  },
  PLEASE: {
    [l.ENGLISH]: 'Please',
    // [l.RUSSIAN]: '',
  },
  USE_ANOTHER_BROWSER_TO: {
    [l.ENGLISH]: 'Use another browser to',
    // [l.RUSSIAN]: 'Используйте другой браузер, чтобы',
  },
  DONT_SHOW_AGAIN: {
    [l.ENGLISH]: `Don't Show Again`,
    // [l.RUSSIAN]: `Больше Не Показывать`,
  },
  ERROR_ID: {
    [l.ENGLISH]: 'Error ID',
    // [l.RUSSIAN]: 'Ошибка ID',
  },
  REASON: {
    [l.ENGLISH]: 'Reason',
    // [l.RUSSIAN]: 'Причина',
  },
  STATUS: {
    [l.ENGLISH]: 'Status',
    // [l.RUSSIAN]: 'Статус',
  },
  REQUEST_FAILED: {
    [l.ENGLISH]: 'Request Failed',
    // [l.RUSSIAN]: 'Запрос Не Выполнен',
  },
  SERVER_DISCONNECTED: {
    [l.ENGLISH]: 'Server Disconnected',
    // [l.RUSSIAN]: 'Сервер Отключен',
  },

  // Project Specific
  // ---------------------------------------------------------------------------
  // CHECK_BACK_IN_LATER: {
  //   [l.ENGLISH]: 'Check back in later',
  //   // [l.RUSSIAN]: 'Зайдите позже',
  // },
  // ENABLE_LOCATION: {
  //   [l.ENGLISH]: 'Enable Location',
  //   // [l.RUSSIAN]: 'Включить Местоположение',
  // },
  // ENABLE_NOTIFICATION: {
  //   [l.ENGLISH]: 'Enable Notification',
  //   // [l.RUSSIAN]: 'Включить Уведомление',
  // },
  // FOR_NEW_MESSAGES_AND_UPDATES: {
  //   [l.ENGLISH]: 'for new messages and updates',
  //   // [l.RUSSIAN]: 'для новых сообщений и обновлений',
  // },
  // LOCATION_REQUEST_DENIED: {
  //   [l.ENGLISH]: 'Location Request Denied!',
  //   // [l.RUSSIAN]: 'Запрос Местоположения Отклонен!',
  // },
  // NOTIFICATION_PERMISSION_DENIED: {
  //   [l.ENGLISH]: 'Notification Permission Denied!',
  //   // [l.RUSSIAN]: 'Запрос Уведомления Отклонен!',
  // },
  // TURN_ON_LOCATION_SERVICES_IN_BROWSER_SETTINGS_IF_YOU_DID_NOT_GET_THE_PROMPT: {
  //   [l.ENGLISH]: 'Turn on Location Services in browser settings if you did not get the prompt.',
  //   // [l.RUSSIAN]: 'Включите службы определения местоположения в настройках браузера, если вы не получили подсказку.',
  // },
  // TURN_ON_NOTIFICATIONS_IN_BROWSER_SETTINGS_IF_YOU_DID_NOT_GET_THE_PROMPT: {
  //   [l.ENGLISH]: 'Turn on Notifications in browser settings if you did not get the prompt.',
  //   // [l.RUSSIAN]: 'Включите уведомления в настройках браузера, если вы не получили подсказку.',
  // },
  // SEARCH_USERS: {
  //   [l.ENGLISH]: 'Search users',
  //   // [l.RUSSIAN]: 'Поиск пользователей',
  // },
  // SHOW_ADDRESS: {
  //   [l.ENGLISH]: 'Show address',
  //   // [l.RUSSIAN]: 'Показать адрес',
  // },
  // SHOW_DISTANCE: {
  //   [l.ENGLISH]: 'Show distance',
  //   // [l.RUSSIAN]: 'Показать расстояние',
  // },
  // SHOW_HOURS: {
  //   [l.ENGLISH]: 'Show hours',
  //   // [l.RUSSIAN]: 'Показать часы',
  // },
})
