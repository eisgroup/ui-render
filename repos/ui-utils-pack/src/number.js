import { hasListValue } from './array.js'
import { isInString } from './string.js'

/**
 * NUMBER FUNCTIONS ============================================================
 * =============================================================================
 */

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
export { isNumber } from 'lodash-es'

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
export function isNumeric(val) {
	return !isNaN(parseFloat(val)) && isFinite(val) // must use parseFloat, cannot use the faster Number()
}

/**
 * Check if given list of {from: Number, to: Number} is in continuous incrementing order
 * (useful for checking schedules of time durations in milliseconds)
 *
 * @param {Array<{from: Number, to: Number}>} arrayOfNumberRanges - to check for validity
 * @returns {Boolean} true - if it is a continuously incrementing ranges of numbers
 */
export function isContinuousNumberRanges(arrayOfNumberRanges) {
	if (!hasListValue(arrayOfNumberRanges)) return false
	let result = true
	let lastTo = -Infinity
	arrayOfNumberRanges.forEach(({ from, to }) => {
		if (from <= lastTo || from >= to) result = false
		if (to) lastTo = to
	})
	return result
}

/**
 * Extract the Starting and Ending Number in given list of continuously incrementing number ranges
 *
 * @param {Array<{from: Number, to: Number}>} arrayOfNumberRanges - to check for values
 * @returns {{start: Number|Undefined, end: Number|Undefined}}
 */
export function startEndFromNumberRanges(arrayOfNumberRanges) {
	const start = (arrayOfNumberRanges.find(({ from }) => from != null) || {}).from
	let end = ([...arrayOfNumberRanges].reverse().find(({ to }) => to != null) || {}).to
	if (end <= start) end = undefined
	return { start, end }
}

/**
 * Increment Counter
 *
 * @example:
 *  - This is a Closure Function, declare at the start to instantiate the environment:
 *    const addCount = createIncrementCounter(7)
 *  - Then perform incrementing:
 *    addCount()
 *    >>> 8
 *  - Add 2 to current count:
 *    addCount(2)
 *    >>> 10
 *  - Reset Count:
 *    addCount(0)
 *    >>> 0
 *  - Subtract 2 from current count:
 *    addCount(-2)
 *    >>> -2
 *
 * @param {number} initValue - initial count
 * @return {Function} - closure that stores a local number count,
 *    and increments count by 1 when no argument passed
 * @return
 */
export function createIncrementCounter(initValue = 0) {
	let count = initValue
	return value => {
		if (value === 0) {
			count = value // Reset count
		} else if (isNumeric(value)) {
			count += Number(value)
		} else {
			count++ // eslint-disable-line
		}

		return count
	}
}

/**
 * Format Currency
 *
 * @param {Number|String} value - to format with currency symbol
 * @param {String} [symbol] - currency code to use, default is `$`
 */
export function formatCurrency(value, { symbol = '$' } = {}) {
	return `${symbol} ${shortNumber(value, 3)}`
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
	value,
	{ decimals, delimits = 3, sectionDelimiter = ',', decimalDelimiter, ordinal } = {}
) {
	if (!isNumeric(value)) return value
	const number = Number(value)

	/* Set Decimals */
	let result = decimals != null ? number.toFixed(decimals) : String(number) // toFixed is slow, but can force decimal

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
	if (Number(result) === 0) result = result.replace('-', '')
	return ordinal ? toOrdinal(result) : result
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
export function shortNumber (value, digits = 3, divider = 1000, delimiter, suffixes) {
	let number = Number(value)
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
export function formatSI (number, precision = 3, divider = 1000, delimiter = '', suffixes = formatSI.PREFIXES) {
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
}

/**
 * Calculate Logarithm for given exponent and base numbers
 *
 * @param {Number} exponent
 * @param {Number} base
 * @returns {number} log
 */
export function mathLog(exponent, base) {
	return Math.log(exponent) / Math.log(base)
}

/**
 * Format Number to Ordinal Numeric String
 *
 * @param {number|string} number - to format
 * @return {string} - ordered number (i.e. 1st, 2nd, 3rd, 4th...)
 */
export function toOrdinal(number) {
	const v = number % 100
	return number + (toOrdinal.list[(v - 20) % 10] || toOrdinal.list[v] || toOrdinal.list[0])
}

toOrdinal.list = ['th', 'st', 'nd', 'rd']

/**
 * Compute Radian Value from given Degree
 *
 * @param {Number} degree - to ompute
 * @returns {Number} radian
 */
export function rad(degree) {
	return (degree * Math.PI) / 180
}

/**
 * Round off a number to n* last digits
 * (e.g. converting timestamps into whole seconds)
 *
 * @example:
 *    roundTail(1234567, 3)
 *    >>> 1235000
 *    roundTail(1234567, 7)
 *    >>> 1000000
 *    roundTail(5234567, 7)
 *    >>> 10000000
 * @param {number} number - the value to convert
 * @param {number} lastDigits - the number of digits to round off to 0 at the end
 * @returns {number} - rounded number
 */
export function roundTail(number, lastDigits) {
	if (-1 < number && number < 1) return 0
	const precision = Math.pow(10, lastDigits)
	return Math.round(number / precision) * precision || precision / 10
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
export function round(number, precision = 0) {
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
export function roundUp(number, precision = 0) {
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
export function roundDown (number, precision = 0) {
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
export function roundTo (number, multiple = 1) {
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
export function roundDownTo (number, multiple = 1) {
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
export function roundUpTo (number, multiple = 1) {
	return +(Math.ceil(+(number / multiple).toPrecision(15)) * multiple).toPrecision(15)
}

/**
 * Get decimal places of given Numeric value
 *
 * @param {number|string} value - number to get precision for
 * @return {number} precision - decimal places
 */
export function decimalPlaces (value) {
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
export function greatestCommonDivisor(a, b) {
	return b ? greatestCommonDivisor(b, a % b) : Math.abs(Number(a) || Infinity)
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
export function randomNumberInRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Compute the Difference between two numbers in Percents
 *
 * @param {number} newNumber - new value to calculate percent change
 * @param {number} baseNumber - the number to calculate percentage from
 * @return {number|NaN} diff - percentage difference, or not a number
 */
export function toPercentage(newNumber, baseNumber) {
	if (!isNumeric(newNumber) || !isNumeric(baseNumber)) return NaN
	if (baseNumber === 0) return newNumber === 0 ? 0 : newNumber > 0 ? Infinity : -Infinity
	return ((newNumber - baseNumber) / baseNumber) * 100
}

/**
 * Convert Fraction number to Percentage string with '%', or render an empty string if not a number
 *
 * @param {Number|String} number - fraction from 0 to 1 to show as percent
 * @param {Number} [decimals] - number of digits to show after the dot
 * @returns {String} percentage - formatted string with set decimal places and '%', or empty string
 */
export function toPercent (number, decimals = 0) {
	if (!isNumeric(number)) return ''
	return (Number(number) * 100).toFixed(decimals).toLocaleString() + '%'
}
