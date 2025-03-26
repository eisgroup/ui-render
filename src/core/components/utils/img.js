import { isFileSrc } from 'ui-utils-pack/string'

/**
 * Compute CSS `background-image` property from given file data
 *
 * @param {String} src - URL or base64 encoded data
 * @returns {String} backgroundImage - for CSS style
 */
export function cssBgImageFrom (src) {
  // Since base64 encoded string is usually large, it's better to check if `src` is URL or Path.
  // If not, default to base64 format, because that is the only other format valid for use as css url.
  // This logic works, especially when `src` can be String object, which fails with isBase64() check.
  return `url('${isFileSrc(src) ? encodeURI(src) : src}')`
}
