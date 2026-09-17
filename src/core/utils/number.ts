import { hasListValue } from './array'
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

/** One entry of the list {@link startEndFromNumberRanges} scans; both bounds are optional and nullable. */
type NumberRange = { from?: number | null, to?: number | null }

/** The boundaries {@link startEndFromNumberRanges} returns; either side is missing when unresolved. */
type NumberRangeBounds = { start: number | undefined, end: number | undefined }

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
 * Checks if value is classified as a Number primitive or object.
 *
 * Note: To exclude Infinity, -Infinity, and NaN,
 * which are classified as numbers, use the isFinite method.
 *
 * @example
 *  isNumber(3)
 *  >>> true
 *  isNumber(Number.MIN_VALUE)
 *  >>> true
 *  isNumber(Infinity)
 *  >>> true
 *  isNumber('3')
 *  >>> false
 *
 * @param {*} val - The value to check.
 * @returns {boolean} - Returns true if value is a number, else false.
 */
export { isNumber } from './lodash-lite'

/**
 * Returns true if the given variable is a number,
 * including if it's data type is not a number eg. '1'
 *
 * @example
 isNumeric('1')  // NOTE: isNumber('1') would return false
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
 * Extract the Starting and Ending Number in given list of continuously incrementing number ranges
 *
 * @param {Array<{from: Number, to: Number}>} arrayOfNumberRanges - to check for values
 * @returns {{start: Number|Undefined, end: Number|Undefined}}
 */
export function startEndFromNumberRanges(arrayOfNumberRanges?: readonly NumberRange[] | null): NumberRangeBounds {
	if (!hasListValue(arrayOfNumberRanges)) return { start: undefined, end: undefined }
	const ranges = arrayOfNumberRanges as readonly NumberRange[]
	const start = (ranges.find(({ from }) => from != null) || ({} as NumberRange)).from as number | undefined
	let end = ([...ranges].reverse().find(({ to }) => to != null) || ({} as NumberRange)).to as number | undefined
	// Note: the comparison is left as is — with either side missing it is `false` at runtime
	if ((end as number) <= (start as number)) end = undefined
	return { start, end }
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
 * Compute Radian Value from given Degree
 *
 * @param {Number} degree - to ompute
 * @returns {Number} radian
 */
export function rad(degree: number): number {
	return (degree * Math.PI) / 180
}

/**
 * Round Number to given Precision decimal point
 *
 * @example:
 *    roundNumber(123.4567, 3)
 *    >>> 123.457
 *
 * @param {number} number - value to round
 * @param {number} [precision] - decimal places to keep
 * @returns {number} - with rounded values
 */
export function round(number: number, precision = 0): number {
	const factor = Math.pow(10, precision)
	return Math.round(number * factor) / factor
}

/**
 * Round Number up to given Precision decimal point
 *
 * @example:
 *    roundUp(123.4564, 3)
 *    >>> 123.457
 *
 * @param {number} number - value to round
 * @param {number} [precision] - decimal places to keep
 * @returns {number} - with rounded values
 */
export function roundUp(number: number, precision = 0): number {
	const factor = Math.pow(10, precision)
	return Math.ceil(number * factor) / factor
}

/**
 * Round Number down to given Precision decimal point
 *
 * @example:
 *    roundDown(123.4567, 3)
 *    >>> 123.456
 *
 * @param {number} number - value to round
 * @param {number} [precision] - decimal places to keep
 * @returns {number} - with rounded values
 */
export function roundDown (number: number, precision = 0): number {
	const factor = Math.pow(10, precision)
	return Math.floor(number * factor) / factor
}

/**
 * Round Number to the closest Multiple of value
 * @Note: this function need precision rounding because of floating point issues, as the last operation is multiply
 *    => example: roundTo(1.2, 0.1)
 *    >>> 1.2000000000000002 -> this is the output without precision rounding
 *
 * @example:
 *    roundTo(123.4567, 10)
 *    >>> 120
 *
 * @param {number} number - value to round
 * @param {number} [multiple] - value, the multiple of which to round to
 * @returns {number} - rounded to given multiple of value
 */
export function roundTo (number: number, multiple = 1): number {
	return +(Math.round(number / multiple) * multiple).toPrecision(15)
}

/**
 * Round Down Number to the closest Multiple of value
 * @Note: this function needs rounding twice, because
 *    => example: 1.2 / 0.1
 *    >>> 11.999999999999998 -> rounds down to 11
 *
 * @example:
 *    roundTo(123.4567, 10)
 *    >>> 120
 *
 * @param {number} number - value to round
 * @param {number} [multiple] - value, the multiple of which to round to
 * @returns {number} - rounded to given multiple of value
 */
export function roundDownTo (number: number, multiple = 1): number {
	return +(Math.floor(+(number / multiple).toPrecision(15)) * multiple).toPrecision(15)
}

/**
 * Round Up Number to the closest Multiple of value
 * @Note: this function needs rounding twice, like roundDownTo
 *
 * @example:
 *    roundTo(123.4567, 10)
 *    >>> 130
 *
 * @param {number} number - value to round
 * @param {number} [multiple] - value, the multiple of which to round to
 * @returns {number} - rounded to given multiple of value
 */
export function roundUpTo (number: number, multiple = 1): number {
	return +(Math.ceil(+(number / multiple).toPrecision(15)) * multiple).toPrecision(15)
}

/**
 * Get decimal places of given Numeric value
 *
 * @param {number|string} value - number to get precision for
 * @return {number} precision - decimal places
 */
export function decimalPlaces (value: unknown): number {
	const match = String(Number(value)).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
	if (!match) return 0
	return Math.max(
		// Number of digits right of decimal point.
		(match[1] ? match[1].length : 0) -
			// Adjust for scientific notation.
			(match[2] ? +match[2] : 0),
		0
	)
}

/**
 * Calculates the Greatest Common Divisor Between Two Numbers
 *
 * @param {Number|String} a - first number
 * @param {Number|String} b - second number
 * @returns {Number} - the biggest divisible number between `a` and `b`
 */
export function greatestCommonDivisor(a: number | string, b: number | string): number {
	const first = Number(a)
	const second = Number(b)
	if (!Number.isFinite(first) || !Number.isFinite(second)) return Infinity
	return second ? greatestCommonDivisor(second, first % second) : Math.abs(first || Infinity)
}

/**
 * Returns a random integer/float between min (inclusive) and max (inclusive),
 * if given numbers are whole integers, then returned value will also be a whole number,
 * if given numbers are floats, then returned value can also be a float.
 *
 * Note: Using Math.round() will give you a non-uniform distribution!
 *
 * @param {number} min - minimum number
 * @param {number} max - maximum number
 * @returns {number} - random value between min and max, inclusive
 */
export function randomNumberInRange(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Compute the Difference between two numbers in Percents
 *
 * @param {number} newNumber - new value to calculate percent change
 * @param {number} baseNumber - the number to calculate percentage from
 * @return {number|NaN} diff - percentage difference, or not a number
 */
export function toPercentage(newNumber: unknown, baseNumber: unknown): number {
	if (!isNumeric(newNumber) || !isNumeric(baseNumber)) return NaN
	const newValue = Number(newNumber)
	const baseValue = Number(baseNumber)
	if (baseValue === 0) return newValue === 0 ? 0 : newValue > 0 ? Infinity : -Infinity
	return ((newValue - baseValue) / baseValue) * 100
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
