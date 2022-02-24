import { isFileSrc } from 'utils-pack'
import { STYLE } from '../styles'

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

/**
 * Compute Preview Image src from dynamic `preview` attribute
 * @param {String|Object} preview - type.UrlOrBase64OrPreview
 * @param {String} [size] - one of thumb/medium/large/etc.
 * @returns {String|Object} preview src ready for consumption by Components
 */
export function previewSize (preview, size = 'thumb') {
  return typeof preview === 'object' ? (preview[size] || preview) : preview
}

/**
 * Convert unitless pixels value to Rem equivalent
 *
 * @param {Number} pixels - to convert to rem
 * @returns {String} rem - equivalent
 */
export function toRem (pixels) {
  return (pixels / 16 / STYLE.SIZE_SCALE * 100) + 'rem'
}
