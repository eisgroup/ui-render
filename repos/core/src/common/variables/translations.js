import { l, LANGUAGE } from '../constants'
import { ACTIVE } from './_envs'

/**
 * PROJECT TRANSLATIONS ========================================================
 * =============================================================================
 */

let _ = {
  // Common
  // ---------------------------------------------------------------------------
  BY: {
    [l.ENGLISH]: 'by',
    [l.RUSSIAN]: '',
  },
  BETWEEN: {
    [l.ENGLISH]: 'between',
    [l.RUSSIAN]: 'между',
  },
  OR: {
    [l.ENGLISH]: 'or',
    [l.RUSSIAN]: 'или',
  },
  PRIVACY_POLICY: {
    [l.ENGLISH]: 'Privacy Policy',
    [l.RUSSIAN]: 'Политика Конфиденциальности',
  },
  YOUR_INFO_IS_SAFE_WITH_US_SEE_OUR: {
    [l.ENGLISH]: 'Your info is safe with us, see our',
    [l.RUSSIAN]: 'Ваша информация в безопасности с нами, смотрите',
  },
  TERMS_OF_SERVICE: {
    [l.ENGLISH]: 'Terms of Service',
    [l.RUSSIAN]: 'Условия Обслуживания',
  },
  TESTER: {
    [l.ENGLISH]: 'Tester',
    [l.RUSSIAN]: 'Тестер',
  },
  THANK_YOU: {
    [l.ENGLISH]: 'Thank You!',
    [l.RUSSIAN]: 'Спасибо!',
  },
  WE_HAVE_RECEIVED_YOUR_MESSAGE_AND_WILL_GET_IN_TOUCH_SHORTLY: {
    [l.ENGLISH]: 'We have received your message and will get in touch shortly',
    [l.RUSSIAN]: 'Мы получили ваше сообщение и вскоре свяжемся с вами',
  },
  OUR_SITE_USES_COOKIES_BY_CONTINUING_TO_USE_OUR_SITE_YOU_ARE_AGREEING_TO_OUR: {
    [l.ENGLISH]: 'Our site uses cookies. By continuing to use our site you are agreeing to our',
    [l.RUSSIAN]: 'Этот сайт использует cookies. Мы используем файлы cookie для запоминания и анализа ваших предпочтений. Продолжая пользоваться сайтом, вы соглашаетесь на использование файлов cookie',
  },
  OK_I_UNDERSTAND: {
    [l.ENGLISH]: 'OK, I understand',
    [l.RUSSIAN]: 'Понятно',
  },
  PLEASE: {
    [l.ENGLISH]: 'Please',
    [l.RUSSIAN]: '',
  },
  USE_ANOTHER_BROWSER_TO: {
    [l.ENGLISH]: 'Use another browser to',
    [l.RUSSIAN]: 'Используйте другой браузер, чтобы',
  },
  ENABLE_LOCATION: {
    [l.ENGLISH]: 'Enable Location',
    [l.RUSSIAN]: 'Включить Местоположение',
  },
  ENABLE_NOTIFICATION: {
    [l.ENGLISH]: 'Enable Notification',
    [l.RUSSIAN]: 'Включить Уведомление',
  },
  FOR_NEW_MESSAGES_AND_UPDATES: {
    [l.ENGLISH]: 'for new messages and updates',
    [l.RUSSIAN]: 'для новых сообщений и обновлений',
  },
  LOCATION_REQUEST_DENIED: {
    [l.ENGLISH]: 'Location Request Denied!',
    [l.RUSSIAN]: 'Запрос Местоположения Отклонен!',
  },
  NOTIFICATION_PERMISSION_DENIED: {
    [l.ENGLISH]: 'Notification Permission Denied!',
    [l.RUSSIAN]: 'Запрос Уведомления Отклонен!',
  },
  TURN_ON_LOCATION_SERVICES_IN_BROWSER_SETTINGS_IF_YOU_DID_NOT_GET_THE_PROMPT: {
    [l.ENGLISH]: 'Turn on Location Services in browser settings if you did not get the prompt.',
    [l.RUSSIAN]: 'Включите службы определения местоположения в настройках браузера, если вы не получили подсказку.',
  },
  TURN_ON_NOTIFICATIONS_IN_BROWSER_SETTINGS_IF_YOU_DID_NOT_GET_THE_PROMPT: {
    [l.ENGLISH]: 'Turn on Notifications in browser settings if you did not get the prompt.',
    [l.RUSSIAN]: 'Включите уведомления в настройках браузера, если вы не получили подсказку.',
  },
  DONT_SHOW_AGAIN: {
    [l.ENGLISH]: `Don't Show Again`,
    [l.RUSSIAN]: `Больше Не Показывать`,
  },
  SEARCH_USERS: {
    [l.ENGLISH]: 'Search users',
    [l.RUSSIAN]: 'Поиск пользователей',
  },
  NOTHING_FOUND: {
    [l.ENGLISH]: 'Nothing found',
    [l.RUSSIAN]: 'Ничего не найдено',
  },
  CHECK_BACK_IN_LATER: {
    [l.ENGLISH]: 'Check back in later',
    [l.RUSSIAN]: 'Зайдите позже',
  },
  ERROR_ID: {
    [l.ENGLISH]: 'Error ID',
    [l.RUSSIAN]: 'Ошибка ID',
  },
  REASON: {
    [l.ENGLISH]: 'Reason',
    [l.RUSSIAN]: 'Причина',
  },
  STATUS: {
    [l.ENGLISH]: 'Status',
    [l.RUSSIAN]: 'Статус',
  },
  REQUEST_FAILED: {
    [l.ENGLISH]: 'Request Failed',
    [l.RUSSIAN]: 'Запрос Не Выполнен',
  },
  SERVER_DISCONNECTED: {
    [l.ENGLISH]: 'Server Disconnected',
    [l.RUSSIAN]: 'Сервер Отключен',
  },
}

_ = localiseTranslation(_)
export { _ }

/**
 * Prepare translations for localisation, so they can be accessed directly via .TEXT property
 *
 * @example:
 *    const _ = localiseTranslation(TRANSLATIONS)
 *    log(_.SEARCH)
 *    # if active language is English
 *    >>> 'Search'
 *    # if active language is Russian
 *    >>> 'Поиск'
 *
 * @param {Object|Object<NAME<code...>>} TRANSLATION - key/value pairs of variable name with its localised values
 * @returns {Object} translations - with all definitions as javascript getters returning currently active language,
 *  (falls back to default language if definition not found for active language, or empty string).
 */
function localiseTranslation (TRANSLATION) {
  const result = {}
  for (const NAME in TRANSLATION) {
    Object.defineProperty(result, NAME, {
      get () {
        return TRANSLATION[NAME][ACTIVE.LANG.code] || TRANSLATION[NAME][LANGUAGE.ENGLISH.code] || NAME || ''
      }
    })
  }
  return result
}
