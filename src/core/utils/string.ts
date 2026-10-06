import { capitalize, get } from './lodash-lite'

export const alphaNumIdPattern = /[^a-zA-Z0-9_-]/g
export const fileNameWithoutExtPattern = /\.[^.$]+$/

/**
 * Options accepted by {@link interpolateString}.
 */
export type InterpolateStringOptions = {
	/** key format to match in given 'variables' (e.g. format = '$key') */
	formatKey?: string,
	/** function name to use in case error is thrown */
	name?: string,
	/** whether to ignore error when replacement string not found, and leave as is */
	suppressError?: boolean,
}

/**
 * STRING FUNCTIONS ===========================================================
 * =============================================================================
 */

/**
 * Checks to see if the search param exists within the string param.
 *
 * @param {string} string - haystack
 * @param {string} search - needle
 * @return {boolean}
 */
export function isInString(string: string, search: string): boolean {
	return string.indexOf(search) > -1
}

/**
 * Check if given value is a String
 * @param {*} value - to check
 * @returns {Boolean} true - if it's a string
 */
export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

/**
 * Interpolate a Template String with given Variables
 * @example:
 *    interpolateString('key.{id}.name', {id: 'user'})
 *    >>> 'key.user.name'
 *
 *    interpolateString('key.{state.id}.name', {state: {id: 'user'}})
 *    >>> 'key.user.name'
 *
 *    interpolateString('key.{state.id,0}.name', {})
 *    >>> 'key.0.name'
 *
 *    interpolateString('key.{id}.name', {$id: 'user'}, {formatKey: '$key'})
 *    >>> 'key.user.name'
 *
 * @param {String} string - template with '{placeholders}' to interpolate
 * @param {Object} variables - object containing keys matching the names of placeholders to interpolate
 * @param {String} [formatKey] - key format to match in given 'variables' (e.g. format = '$key')
 * @param {String} [name] - function name to use in case error is thrown
 * @param {Boolean} [suppressError] - whether to ignore error when replacement string not found, and leave as is
 * @return {String} output - with interpolated variables
 */
export function interpolateString (
	string: string,
	variables: Record<string, unknown> = {},
	{formatKey, name, suppressError}: InterpolateStringOptions = {},
): string {
	return string.replace(interpolateStringPattern, (__: string, match: string) => {
		let key = match
		if (formatKey) key = formatKey.replace('key', key)
		// noinspection JSCheckFunctionSignatures
		// @Note: `get` takes (object, path, defaultValue) - the split yields the path, plus an
		// optional fallback. Extra comma separated parts are ignored by `get`, as before.
		const result = get(variables, ...(key.split(',') as [string, string?]))
		if (result === void 0) {
			if (!suppressError && !variables.hasOwnProperty(key.split(',')[0])) {
				throw new Error(`${name || interpolateString.name + '()'} expects variable '${key}', got '${variables[key]}'`)
			}
			return `{${match}}`
		}
		// @Note: non-string values (numbers, booleans) are returned as is and coerced by `replace`
		return result as string
	})
}

export const interpolateStringPattern = /{([^{}]+)}/g

/**
 * Get File Name without Extension String
 *
 * @param {string} fileName - full file name with extension
 */
export function fileNameWithoutExt (fileName: string): string {
	return fileName.replace(fileNameWithoutExtPattern, '')
}

/**
 * Pluralize or singularize an English word based on count.
 * Handles common suffix rules (-y → -ies, -s/-x/-z/-ch/-sh → -es) plus a small set of irregular forms.
 *
 * @param {string} word - The word to pluralize/singularize
 * @param {number} [count] - A count; treated as plural when not provided or != 1
 * @param {boolean} [shouldIncludeCount] - If true, prefix the result with the count
 * @return {string} - A new string
 */
export function pluralize(word: string, count?: number | null, shouldIncludeCount?: boolean): string {
	const n = count == null ? 2 : count
	const result = Math.abs(n) === 1 ? toSingular(word) : toPlural(word)
	return shouldIncludeCount ? `${n} ${result}` : result
}

const irregularPluralByForms: Record<string, string> = {
	man: 'men', woman: 'women', child: 'children', tooth: 'teeth', foot: 'feet',
	mouse: 'mice', person: 'people', goose: 'geese', ox: 'oxen',
}
const irregularSingularByForms: Record<string, string> = Object.fromEntries(
	Object.entries(irregularPluralByForms).map(([s, p]) => [p, s])
)
const uncountable = new Set([
	'sheep', 'fish', 'series', 'species', 'deer', 'information', 'equipment', 'rice', 'money',
])

function preserveCase(source: string, target: string): string {
	if (source === source.toUpperCase()) return target.toUpperCase()
	if (source[0] === source[0].toUpperCase()) return target[0].toUpperCase() + target.slice(1)
	return target
}

function toPlural(word: string): string {
	const lower = word.toLowerCase()
	if (uncountable.has(lower)) return word
	if (irregularPluralByForms[lower]) return preserveCase(word, irregularPluralByForms[lower])
	if (irregularSingularByForms[lower]) return word // already plural
	if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies'
	if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es'
	return word + 's'
}

function toSingular(word: string): string {
	const lower = word.toLowerCase()
	if (uncountable.has(lower)) return word
	if (irregularSingularByForms[lower]) return preserveCase(word, irregularSingularByForms[lower])
	if (irregularPluralByForms[lower]) return word // already singular
	if (/ies$/i.test(word)) return word.slice(0, -3) + 'y'
	if (/(ses|xes|zes|ches|shes)$/i.test(word)) return word.slice(0, -2)
	if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1)
	return word
}

/**
 * Convert String to Alpha Numeric Characters with dashes and underscores
 *
 * @param {String} string - to convert
 * @returns {String} - with alpha numeric characters, dash and underscore only
 */
export function toAlphaNumId(string: string): string {
	return string.replace(alphaNumIdPattern, '')
}

/**
 * Truncate a String to Given Character Length, Showing the Last n Characters at the End
 *
 * @param {String} string - to truncate with ellipses
 * @param {Number} [length] - number of characters to keep in total
 * @param {Number} [lastChars] - number of characters to keep at the end
 * @returns {String} string - truncated to given total length
 */
export function truncate(string: string, length = 15, lastChars = 3): string {
	if (string.length <= length) return string
	const firstChars = length - lastChars - 3
	if (firstChars < 1) return string
	return string.substr(0, firstChars) + '...' + string.substr(string.length - lastChars, lastChars)
}

/**
 * Convert All Characters to lower case
 * @note: falsy values (null, undefined, '', 0, false) are returned untouched, as at runtime.
 * @param {String|*} string - value to make lower case
 * @returns {String|*} - in lower case
 */
export function toLowerCase (string: string): string
export function toLowerCase <T>(string: T): T
export function toLowerCase (string: unknown): unknown {
	return (string as string) && (string as string).toLowerCase()
}

// LODASH CLONES
// -----------------------------------------------------------------------------

export {
	/**
	 * A wrapper around the lodash's capitalize function
	 *
	 * @uses lodash
	 * @see {@link https://lodash.com/docs/4.17.4#capitalize} for further information.
	 *
	 * @param {string} string - the string to capitalize
	 * @returns {string} - the capitalized string
	 */
		capitalize,
}
