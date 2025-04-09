import CircularJSON from 'circular-json' // do not change to `flatted` package, because it does not comply to JSON standard

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

