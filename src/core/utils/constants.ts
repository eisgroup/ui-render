/* CRUD Actions */
export const GET = 'GET'             		// Retrieving data
export const DELETE = 'DELETE'          // Destroying data from backend

/* State Only Actions */
export const SET = 'SET'             		// For saving non-API data in state
export const ADD = 'ADD'             		// For adding a resource

/* Size */
export const SIZE_KB = 1024
export const SIZE_MB = SIZE_KB * 1024
export const SIZE_MB_16 = SIZE_MB * 16

/* Time */
export const TIME_DURATION_INSTANT = 200
export const ONE_SECOND = 1000
export const THREE_SECONDS = ONE_SECOND * 3

/**
 * Language Definition
 * @see: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @note: sync with Google standard https://developers.google.com/maps/faq#languagesupport
 *    - Correct syntax for <html lang="zh-CN"> uses hyphen, including Google API,
 *		however, database tables and many backends only accept undersacore.
 *		=> Use _ for better compatibility between systems.
 */
export const LANGUAGE = {
	ENGLISH:    {_: 'en', lang: 'English',       'en': 'English'},
	RUSSIAN:    {_: 'ru', lang: 'Русский',       'en': 'Russian'},
	CHINESE:    {_: 'zh_CN', lang: '中文 (中国)', 'en': 'Chinese (Simplified)'},
	CHINESE_HK: {_: 'zh_HK', lang: '中文 (香港)', 'en': 'Chinese (Hong Kong)'},
	CHINESE_TW: {_: 'zh_TW', lang: '中文 (台灣)', 'en': 'Chinese (Traditional)'},
	GERMAN:     {_: 'de', lang: 'Deutsch',       'en': 'German'},
	SPANISH:    {_: 'es', lang: 'Español',       'en': 'Spanish'},
	ITALIAN:    {_: 'it', lang: 'Italiano',      'en': 'Italian'},
	PORTUGUESE: {_: 'pt', lang: 'Português',     'en': 'Portuguese'},
	DUTCH:      {_: 'nl', lang: 'Nederlands',    'en': 'Dutch'},
	FRENCH:     {_: 'fr', lang: 'Français',      'en': 'French'},
	SWEDISH:    {_: 'sv', lang: 'Svenska',       'en': 'Swedish'},
	FINNISH:    {_: 'fi', lang: 'Suomi',         'en': 'Finnish'},
	GREEK:      {_: 'el', lang: 'Ελληνικά',      'en': 'Greek'},
	KOREAN:     {_: 'ko', lang: '한국어',          'en': 'Korean'},
	JAPANESE:   {_: 'ja', lang: '日本語',         'en': 'Japanese'},
	HEBREW:     {_: 'he', lang: 'עִבְרִית',         'en': 'Hebrew'},
	PERSIAN:    {_: 'fa', lang: 'فارسی',         'en': 'Persian'},
	YIDDISH:    {_: 'yi', lang: 'ייִדיש',         'en': 'Yiddish'},
	ARABIC:     {_: 'ar', lang: 'العَرَبِيَّة‎',    'en': 'Arabic'},
	AFRIKAANS:  {_: 'af', lang: 'Afrikaans',     'en': 'Afrikaans'},
} as const

/**
 * Object mapping of language to their code
 * @note: every value is replaced with its `_` code by the loop below; the spread of `LANGUAGE`
 *    exists only so IDEs suggest the keys, and is never observable with its object values.
 */
type LanguageCode = {[K in keyof typeof LANGUAGE]: (typeof LANGUAGE)[K]['_']}
export const l = {
	...LANGUAGE // enable IDE suggestion
} as unknown as LanguageCode
for (const key in LANGUAGE) {
	(l as unknown as Record<string, string>)[key] = LANGUAGE[key as keyof typeof LANGUAGE]._
}

/* Mappings */
export const SORT_ORDER = {
	0: 'sort',
	1: 'asc',
	[-1]: 'desc',
} as const
