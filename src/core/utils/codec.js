/**
 * Converts given value to a JSON string if necessary.
 * Circular references are replaced with the string "[Circular]".
 *
 * @param {*} data - to convert
 * @param {*} args - additional options (replacer, space)
 * @return {string}
 */
export function toJSON (data, ...args) {
  if (typeof data !== 'object') return data
  const [replacer, space] = args
  return JSON.stringify(data, withCircularGuard(replacer), space)
}

/**
 * Attempts to parse a JSON string.
 *
 * @param {string} data - the string to be parsed
 * @return {Object|Null} - a JavaScript object if parsed successfully, null if not
 */
export function fromJSON (data) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

function withCircularGuard (replacer) {
  const seen = new WeakSet()
  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return typeof replacer === 'function' ? replacer.call(this, key, value) : value
  }
}
