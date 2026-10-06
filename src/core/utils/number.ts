import { isInString } from './string'

/**
 * NUMBER FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * @Note on the types (§9.6-E1): these helpers are deliberately forgiving about their inputs —
 * callers pass numeric strings, `null` and non-finite values, and every function guards at runtime
 * instead of rejecting them. The types stay LOOSE on purpose: `unknown` where a value is only
 * inspected behind a runtime guard, `number | string` where the runtime coerces, and no tightening
 * of what any function accepts.
 */

/** Options of {@link formatNumber} — every one is optional, like the runtime defaults below. */
type FormatNumberOptions = {
	decimals?: number | null,
	delimits?: number,
	sectionDelimiter?: string,
	decimalDelimiter?: string,
	ordinal?: boolean,
}

/**
 * Exponent (as a key) to unit suffix, as used by {@link formatSI}.
 * @Note: a caller may pass a PARTIAL map (see the `{0: 'B', 3: 'KiB'}` usage in tests) — a missing
 *    exponent resolves to `undefined` at runtime and is stringified into the result, unchanged.
 */
type SiSuffixes = Record<string, string>

/**
 * Returns true if the given variable is a number,
 * including if it's data type is not a number eg. '1'
 *
 * @example
 isNumeric('1')
 >>> true
 isNumeric('a')
 >>> false
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isNumeric(val: unknown): boolean {
	// Note: the casts keep the JS coercion the two globals do on non-string/non-number input
	return !isNaN(parseFloat(val as string)) && isFinite(val as number) // must use parseFloat, cannot use the faster Number()
}

/**
 * Format Number to Delimited String, and optionally set the number of Decimals
 * @Note: use Number().toLocaleString() for faster performance if no fixed decimals needed.
 *
 * @param {number|string} value - number to format
 * @param {number} [decimals] - length of decimal
 * @param {number} [delimits] - length of digits to be delimited
 * @param {string} [sectionDelimiter] - section delimiter character
 * @param {string} [decimalDelimiter] - decimal delimiter character
 * @param {boolean} [ordinal] - whether to convert to ordinal number
 * @return {string} - delimited number with specified decimals
 */
export function formatNumber(
	value: number | string,
	{ decimals, delimits = 3, sectionDelimiter = ',', decimalDelimiter, ordinal }: FormatNumberOptions = {}
): string | number {
	if (!isNumeric(value)) return value
	const number = Number(value)

	/* Set Decimals */
	let result = decimals != null ? number.toFixed(decimals) : String(number) // toFixed is slow, but can force decimal
	if (Number(result) === 0) result = result.replace('-', '')

	/* Replace Delimiter */
	if (decimalDelimiter) result = result.replace('.', decimalDelimiter)

	/* Delimit Sections */
	// Note: because JS does not have negative lookbehind regex, we have to create dynamic pattern
	if (number >= 1000 || number <= -1000) {
		// Note: below code is slightly slower than toLocalString(), but needed for custom formatting
		const dot = decimalDelimiter || '.'
		const dotPattern = `\\${dot}\\d+`
		const pattern = `(\\d)(?=(\\d{${delimits}})+(${isInString(result, dot) ? dotPattern : '$'}))`
		result = result.replace(new RegExp(pattern, 'g'), `$1${sectionDelimiter}`)
	}

	/* Final Output */
	return ordinal ? result + getOrdinalSuffix(number) : result
}

/**
 * Shorten Number to given Digits Length, with Suffix Added if Necessary
 *
 * @param {number|string} value - number to format
 * @param {Number} [digits] - maximum number of digits to keep (will add/remove decimals to match final length)
 * @param {Number} [divider] - value to divide by when determining exponent steps, example: 1024 for bytes
 * @param {String} [delimiter] - character to insert between computed value and suffix
 * @param {Object} [suffixes] - list of suffixes to use for each exponent
 * @return {String} number - shorten to digits length with suffix if needed
 */
export function shortNumber (
	value: number | string, digits = 3, divider = 1000, delimiter?: string, suffixes?: SiSuffixes
): string {
	// Note: `number` holds the numeric value first, then the formatted string — as it did in JS
	let number: number | string = Number(value)
	if (!Number.isFinite(number)) return String(number)
	if (number === 0) return '0'

	/* Suffix Required */
	if (number >= divider || number <= -divider) return formatSI(number, digits, divider, delimiter, suffixes)

	/* No Suffix Truncate (for numbers less than 1k, with decimals rounded if needed) */
	const decimals = Math.max(0, digits - String(~~Math.abs(number)).length)
	number = number.toFixed(decimals) // must use toFixed(), cannot use parseFloat, to avoid scientific notation
	return decimals ? number.replace(/\.?0+$/, '') : number
}

/**
 * Format Number with SI Prefix
 * @link: https://github.com/ThomWright/format-si-prefix
 *
 * @param {Number} number - to format
 * @param {Number} [precision] - number of significant digits to keep, will round number if 0 given
 * @param {Number} [divider] - value to divide by when determining exponent steps, example: 1024 for bytes
 * @param {String} [delimiter] - character to insert between computed value and suffix
 * @param {Object} [suffixes] - list of suffixes to use for each exponent
 * @return {string} number - with unit suffix if needed
 */
export function formatSI (
	number: number, precision = 3, divider = 1000, delimiter = '', suffixes: SiSuffixes = formatSI.PREFIXES
): string {
	if (!Number.isFinite(Number(number))) return String(number)
	if (number === 0) return '0'

	let result = Math.abs(number) // significand
	let exponent = 0

	while (result >= divider && exponent < 24) {
		result /= divider
		exponent += 3
	}
	while (result < 1 && exponent > -24) {
		result *= divider
		exponent -= 3
	}

	const prefix = number < 0 ? '-' : ''
	if (result > divider) {
		// exponent == 24
		// significand can be arbitrarily long
		return `${prefix}${result.toFixed(0)}${delimiter}${suffixes[exponent]}`
	}
	return `${prefix}${(precision ? Number(result.toPrecision(precision)) : Math.round(result))}${delimiter}${suffixes[exponent]}`
}

formatSI.PREFIXES = {
	'24': 'Y',
	'21': 'Z',
	'18': 'E',
	'15': 'P',
	'12': 'T',
	'9': 'B',
	'6': 'M',
	'3': 'k',
	'0': '',
	'-3': 'm',
	'-6': 'µ',
	'-9': 'n',
	'-12': 'p',
	'-15': 'f',
	'-18': 'a',
	'-21': 'z',
	'-24': 'y',
} as SiSuffixes

/**
 * Format Number to Ordinal Numeric String
 *
 * @param {number|string} number - to format
 * @return {string} - ordered number (i.e. 1st, 2nd, 3rd, 4th...)
 */
export function toOrdinal(number: number | string): string {
	return (number as string) + getOrdinalSuffix(number)
}

toOrdinal.list = ['th', 'st', 'nd', 'rd']

function getOrdinalSuffix(number: number | string): string {
	const v = Math.abs(number as number) % 100
	return toOrdinal.list[(v - 20) % 10] || toOrdinal.list[v] || toOrdinal.list[0]
}

/**
 * What the rounding helpers below actually accept.
 *
 * Their JSDoc has always said `{number}` and their bodies have always coerced: every one of them
 * reaches the argument through `*` or `/`, so JavaScript converts a numeric string on the way in.
 * That is not an accident to "fix" — `src/core/components/renders.tsx` calls `round(value, decimals)`
 * with values straight out of `data.json`, where a number is routinely a string. Typing the
 * parameter `number` made the signature stricter than the function: the kind of lie that compiles
 * for years and then rejects working code the day its caller is converted.
 *
 * MEASURED, so this is a statement of fact rather than a hope:
 *   round('3.14159', 2) -> 3.14        round('1e3', 2) -> 1000
 *   round('abc', 2)     -> NaN         round('', 2)    -> 0
 *
 * It stops at `number | string` DELIBERATELY. `null` coerces to 0 and `undefined` to NaN, but
 * neither is a supported input — they merely fail to throw. Admitting them would document an
 * accident as a contract.
 */
type Numeric = number | string

/**
 * Round Number to given Precision decimal point
 *
 * @example:
 *    roundNumber(123.4567, 3)
 *    >>> 123.457
 *
 * @param {number|string} number - value to round; a numeric string is coerced, see `Numeric`
 * @param {number} [precision] - decimal places to keep
 * @returns {number} - with rounded values
 */
export function round(number: Numeric, precision = 0): number {
	const factor = Math.pow(10, precision)
	return Math.round((number as number) * factor) / factor
}

/**
 * Convert Fraction number to Percentage string with '%', or render an empty string if not a number
 *
 * @param {Number|String} number - fraction from 0 to 1 to show as percent
 * @param {Number} [decimals] - number of digits to show after the dot
 * @returns {String} percentage - formatted string with set decimal places and '%', or empty string
 */
export function toPercent (number: unknown, decimals = 0): string {
	if (!isNumeric(number)) return ''
	return (Number(number) * 100).toFixed(decimals).toLocaleString() + '%'
}
