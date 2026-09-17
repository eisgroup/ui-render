/** Replacer accepted by `toJSON`, matching `JSON.stringify`'s second argument. */
type JSONReplacer = (this: unknown, key: string, value: unknown) => unknown

/**
 * Converts given value to a JSON string if necessary.
 * Circular references are replaced with the string "[Circular]".
 *
 * @param {*} data - to convert
 * @param {*} args - additional options (replacer, space)
 * @return {string}
 */
export function toJSON (
  data: unknown,
  ...args: [replacer?: JSONReplacer | null, space?: string | number]
): any {
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
export function fromJSON (data: unknown): any {
  try {
    return JSON.parse(data as string)
  } catch (e) {
    return data
  }
}

function withCircularGuard (replacer: JSONReplacer | null | undefined): JSONReplacer {
  const seen = new WeakSet<object>()
  return function (this: unknown, key: string, value: unknown) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return typeof replacer === 'function' ? replacer.call(this, key, value) : value
  }
}
