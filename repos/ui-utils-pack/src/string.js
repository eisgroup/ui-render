import { capitalize, get } from 'lodash-es'
import pluralizer from 'pluralize'

export const alphaNumPattern = /[^a-zA-Z0-9]/g
export const alphaNumIdPattern = /[^a-zA-Z0-9_-]/g
export const escapeRegExpPattern = /[.*+?^${}()|[\]\\]/g
export const fileNameWithoutExtPattern = /\.[^.$]+$/
export const hyphensPattern = /-+/g
export const hyphensTrimPattern = /^-+|-+$/g
export const isBase64Pattern = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
// Matches multiples spaces, including tabs, newline, etc.
export const spacesPattern = /\s\s+/g

// Random String Generation (with increased search space to 88^n)
const symbols = `~!@#%^&*()[]|{}<>:;,.?-+_=` // only use safe symbols
const symbolRatio = symbols.length / (62 + symbols.length) // rate of symbols against alphanumeric characters
const upperThreshold = 1 - 26 / (62 + symbols.length) // minimum Math.random() result for upper case
const upperThresholdAlphaNum = 1 - 26 / 62 // minimum Math.random() result for upper case

/**
 * STRING FUNCTIONS ===========================================================
 * =============================================================================
 */

/**
 * Escape String for use in Regex Expression
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param {String} string - to be sanitized
 * @returns {String} string - escaped for Regex use
 */
export function escapeRegExp (string) {
	return string.replace(escapeRegExpPattern, '\\$&') // $& means the whole matched string
}

/**
 * Convert String to RegexExp (with given String being escaped first)
 * @param {String} string - to be converted to Regex
 * @param {*[]} [args] - to be passed to RegexExp initialization
 */
export function regexExp (string, ...args) {
	return new RegExp(escapeRegExp(string), ...args)
}

/**
 * Get Cookie Value by Name from Cookie String
 *
 * @example:
 *    const cookie = 'KEY=value; KEY2=value2'
 *    getCookie(cookie, KEY)
 *    >>> 'value'
 *
 * @param {String} cookie - whole cookie string to get value from
 * @param {String} key - cookie name to get value for
 * @return {String} value - cookie
 */
export function getCookie(cookie, key) {
	if (!cookie) return
	let value = cookie.split('; ').find(string => string.indexOf(key + '=') === 0)
	if (!value) return
	return value.split('=')[1]
}

/**
 * Get Query Parameter Value by its Key from URL String
 * @example:
 *  // URL is: https://example.com?foo=man&bar=&baz
 *  var foo = getParameterByKey('foo'); // "man"
 *  var bar = getParameterByKey('bar'); // "" (present with empty value)
 *  var baz = getParameterByKey('baz'); // "" (present with no value)
 *  var qux = getParameterByKey('qux'); // undefined (absent)
 *
 * @param {String} key - query parameter to extract from current URL
 * @param {String} [url] - string to search query parameters, defaults to current browser URL
 * @returns {String|Undefined} - value if found, else undefined
 */
export function getParamByKey (key, url = window.location.href) {
	key = key.replace(getParamByKeyPattern, '\\$&')
	const regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)')
	const results = regex.exec(url)
	if (!results) return undefined
	if (!results[2]) return ''
	return decodeURIComponent(results[2].replace(getParamByKeySpacePattern, ' '))
}

export const getParamByKeyPattern = /[[\]]/g
export const getParamByKeySpacePattern = /\+/g

/**
 * Get URI from given URL string
 * @param {String} url - to extract URI
 * @returns {String} URI
 */
export function pathURI (url) {
	return url.split('/').pop()
}

/**
 * Check that given value is a string and is not empty
 *
 * @param {*} value - to check
 * @returns {Boolean} true - if given value is non-empty string
 */
export function hasStringValue(value) {
	return !!value && typeof value === 'string'
}

/**
 * Checks to see if the search param exists within the string param.
 *
 * @param {string} string - haystack
 * @param {string} search - needle
 * @return {boolean}
 */
export function isInString(string, search) {
	return string.indexOf(search) > -1
}

/**
 * Checks to see if any of the searches params exist within the string param.
 *
 * @param {string} string - haystack
 * @param searches - needles
 * @return {boolean}
 */
export function isInStringAny(string, ...searches) {
	if (typeof string !== 'string') return false

	for (const value of searches) {
		if (string.indexOf(value) >= 0) return true
	}

	return false
}

/**
 * Insert Value to String at Specified Index
 *
 * @param {string} string - the string to be inserted to
 * @param {number} index - the position to insert
 * @param {string|number} value - the string to insert
 * @returns {string}
 */
export function insertToString (string, index, value) {
	if (index > 0) return string.substring(0, index) + value + string.substring(index, string.length)
	return value + string
}

/**
 * Check if Given Value is a Base64 Encoded String
 * @note: cache regex pattern for faster search on large strings
 * @param {String} string - value to check
 * @returns {Boolean} true - if it is a valid Base64 encoded string
 */
export function isBase64 (string) {
	return isBase64Pattern.test(string)
}

/**
 * Check if given string is a File URL or Path.
 * Helps to determine if File.src is URL or Path string vs. base64 encoded string.
 * @param {String} string - to check
 * @returns {Boolean} true - if string contains a dot '.', because a file always needs extension
 */
export function isFileSrc (string) {
	return !!string && string.indexOf('.') > -1
}

/**
 * Check if Given String is a Valid IP v4 Address
 *
 * @param {*} address - value to check
 * @returns {Boolean} true - if value given is a valid IP address string
 */
export function isIpAddress (address) {
	return typeof address === 'string' && isIpAddressPattern.test(address)
}

export const isIpAddressPattern = new RegExp(
	'^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}' +
	'([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)' +
	'*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$|^\\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|((' +
	'[0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1' +
	'\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1' +
	'\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}' +
	'(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)' +
	'(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|' +
	'((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?' +
	'\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|' +
	'2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}' +
	'(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]' +
	'|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]' +
	'|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\s*$'
)

/**
 * Check if given string is a valid Phone Number
 *
 * @param {String} string - value to check
 * @returns {Boolean} true - if is valid phone number
 */
export function isPhoneNumber(string) {
	return isPhoneNumberPattern.test(string)
}

export const isPhoneNumberPattern = /^\+[0-9()\-\s]+$/

/**
 * Check if given value is a String
 * @param {*} value - to check
 * @returns {Boolean} true - if it's a string
 */
export function isString(value) {
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
export function interpolateString (string, variables = {}, {formatKey, name, suppressError} = {}) {
	return string.replace(interpolateStringPattern, (__, match) => {
		let key = match
		if (formatKey) key = formatKey.replace('key', key)
		// noinspection JSCheckFunctionSignatures
		const result = get(variables, ...key.split(','))
		if (result === void 0) {
			if (!suppressError && !variables.hasOwnProperty(key.split(',')[0])) {
				throw new Error(`${name || interpolateString.name + '()'} expects variable '${key}', got '${variables[key]}'`)
			}
			return `{${match}}`
		}
		return result
	})
}

export const ips = interpolateString
export const interpolateStringPattern = /{([^{}]+)}/g

/**
 * Remove brackets around strings (add a dot before it, except when bracket is the first character)
 *
 * @example:
 *    formatKeyPath('object[string]')  // 'object.string'
 *
 * @param {string} keyPath - the path string to format
 */
export function formatKeyPath(keyPath) {
	return keyPath.replace(
		formatKeyPathPattern, (match, match1, match2, match3, offset) => (offset > 0 ? '.' : '') + String(match2)
	)
}

export const formatKeyPathPattern = /(\[)(.*?)(\])/g

/**
 * Get File Name Format Extension from String
 *
 * @param {string} fileName - full file name with format extension (ex. 'image.png')
 * @returns {string} extension - file format if exists (ex. 'png') or empty string if it does not
 */
export function fileFormat (fileName) {
	const array = fileName.split('.')
	return array.length > 1 ? array.pop() : ''
}

/**
 * Get File Extension used in Backend from User submitted file name
 *
 * @param {String|Null|Undefined} fileName - to extract extension
 * @returns {String|Undefined} file format extension, or empty string, or undefined
 */
export function fileFormatNormalized (fileName) {
	if (!fileName) return
	const ext = fileFormat(toLowerCase(fileName))
	switch (ext) {
		case 'jpeg':
		case 'jpg':
			return 'jpg'
		default:
			return ext
	}
}

/**
 * Get File Name without Extension String
 *
 * @param {string} fileName - full file name with extension
 */
export function fileNameWithoutExt (fileName) {
	return fileName.replace(fileNameWithoutExtPattern, '')
}

/**
 * Convert Data URL, such as Base64 Image string to JS File object
 * @param {String} dataUrl
 * @param {String} filename
 * @returns {File} file - object
 */
export function fileFromDataUrl (dataUrl, filename) {
	const arr = dataUrl.split(',')
	const mime = arr[0].match(/:(.*?);/)[1]
	const str = atob(arr[1])
	let n = str.length
	const u8arr = new Uint8Array(n)

	while (n--) {
		u8arr[n] = str.charCodeAt(n)
	}

	return new File([u8arr], filename, {type: mime})
}

/**
 * Get File Mime Type from Data URL
 * @param {String} dataUrl - see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * @returns {String|undefined} mime type
 */
export function mimeTypeFromDataUrl (dataUrl) {
	return dataUrl.split(',')[0].match(/:(.*?);/)[1]
}

/**
 * Get hostname from URL string
 *
 * @param {string} url - to extract hostname
 * @return {string} - hostname
 */
export function hostname (url) {
	let hostname

	// find & remove protocol (http, ftp, etc.) and get hostname
	if (url.indexOf('://') > -1) {
		hostname = url.split('/')[2]
	} else {
		hostname = url.split('/')[0]
	}

	// find & remove port number
	hostname = hostname.split(':')[0]

	// find & remove "?"
	hostname = hostname.split('?')[0]

	return hostname
}

/**
 * Get Matching Substring Between Two Strings
 *
 * @example:
 * matchBetween('cool_black__hat', '_', '__')
 * >>> 'black'
 *
 * @param {string} string - to match against
 * @param {string} before - string preceding the match
 * @param {string} after - string succeeding the match
 * @returns {string} - matching string between `before` and `after` strings if found, or an empty string if not
 */
export function matchBetween(string, before, after) {
	return get(string.match(`${before}(.*)${after}`), '[1]') || ''
}

/**
 * Convert two strings or numbers into one scrambled string, deterministically
 *
 * @param {string|number} str1
 * @param {string|number} str2
 * @returns {string} - scrambled characters from provided values
 */
export function mergeStrings(str1, str2) {
	str1 = String(str1)
	str2 = String(str2)
	const strLong = (str1.length >= str2.length ? str1 : str2).split('').reverse()
	const strShort = (str1.length > str2.length ? str2 : str1).split('')
	return strLong
		.map((char, index) => {
			return strShort[index] != null ? char + strShort[index] : char + strShort[index % strShort.length]
		})
		.join('')
}

/**
 * Pad Left given String with Template String
 *
 * @param {String} string - to be padded, example 7
 * @param {String} padTemplate - example: '000'
 * @return {String} padded with template - example: '007'
 */
export function padStringLeft (string, padTemplate) {
	return `${padTemplate}${string}`.slice(-(Math.max(string.length, padTemplate.length)))
}

/**
 * Pad Right given String with Template String
 *
 * @param {String} string - to be padded, example 7
 * @param {String} padTemplate - example: '000'
 * @return {String} padded with template - example: '700'
 */
export function padStringRight (string, padTemplate) {
	return `${string}${padTemplate}`.substr(0, Math.max(string.length, padTemplate.length))
}

/**
 * Converts the given singular word to it's plural version
 *
 * @example
 *  plural('butterfly')
 *  >>> 'butterflies'
 *
 * @uses pluralize
 * @see {@link https://github.com/blakeembrey/pluralize} for further information
 *
 * @param {string} string
 */
export function plural(string) {
	return pluralizer.plural(string)
}

/**
 * Pluralize or singularize a word based on count
 *
 * @uses pluralize
 * @see {@link https://github.com/blakeembrey/pluralize} for further information
 *
 * @param {string} word - The word to pluralize/singularize
 * @param {number} count - A count
 * @param {boolean} [shouldIncludeCount] - If true will prefix the given count to the word
 * @return {string} - A new string
 */
export function pluralize(word, count, shouldIncludeCount) {
	return pluralizer(word, count, shouldIncludeCount)
}

/**
 * Get a random Character from provided string
 *
 * @param {String} string
 * @returns {String} character
 */
export function randomFromString(string) {
	return string.charAt(Math.floor(Math.random() * string.length))
}

/**
 * Create a Random ASCII String with Random length within given min - max range
 *
 * @param {Number} [min] - length
 * @param {Number} [max] - length
 * @param {Boolean} [alphaNum] - whether to create alphanumeric string only
 * @param {Boolean} [hex] - whether to create hex string only
 * @returns {String} random - ASCII compliant string
 */
export function randomString (min = 32, max = 64, {alphaNum = false, hex = false} = {}) {
	const searchSpace = hex ? 16 : 36
	const uppercase = alphaNum ? upperThresholdAlphaNum : upperThreshold
	return [...Array(randomNumberInRange(min, max))]
		.map(() => {
			const random = Math.random()
			if (!alphaNum && !hex && random < symbolRatio) return randomFromString(symbols)
			const string = (~~(random * searchSpace)).toString(searchSpace)
			return !hex && random > uppercase ? string.toUpperCase() : string
		})
		.join('')
}

randomString.history = []

/**
 * Hash ASCII String using SHA256
 *
 * @param {String} ascii - compliant
 * @returns {String} digest - hashed to 64 characters long
 */
export function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value >>> amount) | (value << (32 - amount))
	}

	const mathPow = Math.pow
	const maxWord = mathPow(2, 32)
	const lengthProperty = 'length'
	let i, j // Used as a counter across the whole file
	let result = ''

	const words = []
	const asciiBitLength = ascii[lengthProperty] * 8

	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	let hash = (sha256.h = sha256.h || [])
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	const k = (sha256.k = sha256.k || [])
	let primeCounter = k[lengthProperty]
	/*/
  const hash = [], k = [];
  const primeCounter = 0;
  //*/

	const isComposite = {}
	for (let candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate
			}
			hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
			k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
		}
	}

	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i)
		if (j >> 8) return // ASCII check: only accept characters in range 0-255
		words[i >> 2] |= j << (((3 - i) % 4) * 8)
	}
	words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
	words[words[lengthProperty]] = asciiBitLength

	// process each chunk
	for (j = 0; j < words[lengthProperty]; ) {
		const w = words.slice(j, (j += 16)) // The message is expanded into 64 words as part of the iteration
		const oldHash = hash
		// This is now the undefined working hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8)

		for (i = 0; i < 64; i++) {
			// Expand the message into 64 words
			// Used below if
			const w15 = w[i - 15],
				w2 = w[i - 2]

			// Iterate
			const a = hash[0],
				e = hash[4]
			const temp1 =
				hash[7] +
				(rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
				((e & hash[5]) ^ (~e & hash[6])) + // ch
				k[i] +
				// Expand the message schedule if needed
				(w[i] =
					i < 16
						? w[i]
						: (w[i - 16] +
						  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
								w[i - 7] +
								(rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
						  0)
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			const temp2 =
				(rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
				((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])) // maj

			hash = [(temp1 + temp2) | 0].concat(hash) // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1) | 0
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i]) | 0
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			const b = (hash[i] >> (j * 8)) & 255
			result += (b < 16 ? 0 : '') + b.toString(16)
		}
	}
	return result
}

/**
 * Encode given String to HEX format
 *
 * @param {String} string - to encode
 * @returns {String} hex - encoded string
 */
export function toHex(string) {
	let hex
	let result = ''
	for (let i = 0; i < string.length; i++) {
		hex = string.charCodeAt(i).toString(16)
		result += ('000' + hex).slice(-4)
	}
	return result
}

/**
 * Convert String to Alpha Numeric Characters
 *
 * @param {String} string - to convert
 * @returns {String} - with alpha numeric characters only
 */
export function toAlphaNum(string) {
	return string.replace(alphaNumPattern, '')
}

/**
 * Convert String to Alpha Numeric Characters with dashes and underscores
 *
 * @param {String} string - to convert
 * @returns {String} - with alpha numeric characters, dash and underscore only
 */
export function toAlphaNumId(string) {
	return string.replace(alphaNumIdPattern, '')
}

/**
 * Sanitize String for use in URL without encoding.
 * @param {String} string - to sanitize, can contain any characters
 * @returns {String} URI - sanitized for browser URL, without encoding/decoding
 */
export function toURI (string) {
	return string && string.replace(spacesPattern, '-') // remove spaces/newlines before stripping special characters
		.replace(alphaNumIdPattern, '-') // convert all invalid characters to hyphen
		.replace(hyphensPattern, '-') // may have hyphen at the start or end
		.replace(hyphensTrimPattern, '')
		.toLowerCase()
}

/**
 * Truncate a String to Given Character Length, Showing the Last n Characters at the End
 *
 * @param {String} string - to truncate with ellipses
 * @param {Number} [length] - number of characters to keep in total
 * @param {Number} [lastChars] - number of characters to keep at the end
 * @returns {String} string - truncated to given total length
 */
export function truncate(string, length = 15, lastChars = 3) {
	if (string.length <= length) return string
	const firstChars = length - lastChars - 3
	if (firstChars < 1) return string
	return string.substr(0, firstChars) + '...' + string.substr(string.length - lastChars, lastChars)
}

/**
 * Convert All Characters to lower case
 * @param {String|*} string - value to make lower case
 * @returns {String|*} - in lower case
 */
export function toLowerCase (string) {
	return string && string.toLowerCase()
}

/**
 * Convert Any Value type to lower case String
 * @param {*} value - make lower case
 * @returns {String} value - in lower case
 */
export function toLowerCaseAny (value) {
	return String(value).toLowerCase()
}

/**
 * Convert All Characters to UPPER CASE
 * @param {String|*} string - value to make upper case
 * @returns {String|*} - in upper case
 */
export function toUpperCase (string) {
	return string && string.toUpperCase()
}

/**
 * Convert Any Value type to UPPER CASE String
 * @param {*} value - make UPPER CASE
 * @returns {String} value - in UPPER CASE
 */
export function toUpperCaseAny (value) {
	return String(value).toUpperCase()
}

/**
 * Trim spaces at the start and end of String, and convert multiples spaces,
 * including tabs, newline, etc. in between to a single space.
 * @param {String|*} string - to trim
 * @returns {String|*} string - trimmed
 */
export function trimSpaces (string) {
	return string && string.replace(spacesPattern, ' ').trim()
}

/**
 * Create RFC4122 Complaint Version 4 UUID
 *
 * @see: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {String} uuid - in this format 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx'
 */
export function uuid () {
	const d0 = (Math.random() * 0xffffffff) | 0
	const d1 = (Math.random() * 0xffffffff) | 0
	const d2 = (Math.random() * 0xffffffff) | 0
	const d3 = (Math.random() * 0xffffffff) | 0
	return (
		lut[d0 & 0xff] +
		lut[(d0 >> 8) & 0xff] +
		lut[(d0 >> 16) & 0xff] +
		lut[(d0 >> 24) & 0xff] +
		'-' +
		lut[d1 & 0xff] +
		lut[(d1 >> 8) & 0xff] +
		'-' +
		lut[((d1 >> 16) & 0x0f) | 0x40] +
		lut[(d1 >> 24) & 0xff] +
		'-' +
		lut[(d2 & 0x3f) | 0x80] +
		lut[(d2 >> 8) & 0xff] +
		'-' +
		lut[(d2 >> 16) & 0xff] +
		lut[(d2 >> 24) & 0xff] +
		lut[d3 & 0xff] +
		lut[(d3 >> 8) & 0xff] +
		lut[(d3 >> 16) & 0xff] +
		lut[(d3 >> 24) & 0xff]
	)
}

const lut = []
for (let i = 0; i < 256; i++) {
	lut[i] = (i < 16 ? '0' : '') + i.toString(16)
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

function randomNumberInRange (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
