import CircularJSON from 'circular-json-es6'

/**
 * DATA FORMAT FUNCTIONS =======================================================
 * =============================================================================
 */

export {
  CircularJSON
}

/**
 * Converts given value to a JSON string if necessary
 *
 * @param {*} data - to convert
 * @param {*} args - additional options
 * @return {string}
 */
export function toJSON (data, ...args) {
  return (typeof data === 'object') ? CircularJSON.stringify(data, ...args) : data
}

/**
 * Attempts to parse a JSON string.
 *
 * @param {string} data - the string to be parsed
 * @return {Object|Null} - a JavaScript object if parsed successfully, null if not
 */
export function fromJSON (data) {
  try {
    return CircularJSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 * Checks to see if the data passed is valid JSON.
 *
 * @param {string} data - the json to parse.
 * @return {boolean}
 */
export function isJSON (data) {
  let isJson = true

  try {
    JSON.parse(data)
  } catch (e) {
    isJson = false
  }

  return isJson
}

/**
 * Convert Javascript object to text
 *
 * @param {*} value - to convert to text
 * @return {string}
 */
export function toText (value) {
  if (value == null) return String(value)
  const string = []

  /* Array */
  if (value.constructor === Array) {
    for (const prop in value) {
      string.push(toText(value[prop]))
    }
    return '[' + string.join(',') + ']'
  }

  /* Object */
  if (value.constructor === Object) {
    for (const prop in value) {
      string.push(prop + ':' + toText(value[prop]))
    }
    return '{' + string.join(',') + '}'
  }

  /* Function */
  if (value.constructor === Function) {
    return value.toString()
  }

  /* Other Values */
  return JSON.stringify(value)
}

/**
 * JSON Encoder and Decoder
 */
export const Json = {
  encode: toJSON,
  decode: fromJSON,
}
