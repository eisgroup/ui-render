import { fileExtensionNormalized, isBase64 } from 'utils-pack'
import { STYLE } from '../styles'

/**
 * Compute CSS `background-image` property from given file data
 *
 * @param {String} src
 * @param {String} [name] - file name
 * @returns {String} backgroundImage - for CSS style
 */
export function cssBgImageFrom ({src, name}) {
  return `url('${isBase64(src) ? `data:image/${fileExtensionNormalized(name) || 'png'};base64, ${src}` : encodeURI(src)}')`
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
