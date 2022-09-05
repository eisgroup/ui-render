/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

/**
 * Compute File Source String for Client Consumption in Local Development Environment
 *    - Append `version` query string to force clearing cache when User updates a file
 *
 * @example:
 *    - Production CDN can be prepended with .env variable REACT_APP_CDN_URL=https://cdn.domain.com
 *      => this is to be done in frontend to reduce network payload size
 *    - to load files in local development, set server .env variable UPLOAD_PATH=../web/public
 *
 * @param {Object<src, name>} fileData - to get src for
 * @returns {String} source - file path or base64 encoded data
 */
export function fileSrc ({src, created, updated}) {
  // `created` or `updated` timestamps can be truncated to 3 digits to reduce network payload and page sizes
  // => it should be enough for most cases
  return `${src}?v=${String(updated || created || '0').substr(-3)}`
}

export default {
  File: {
    src: fileSrc
  },
  Image: {
    src: fileSrc
  }
}
