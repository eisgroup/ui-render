/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

/**
 * Compute File Source String for Client Consumption in Local Development Environment
 *    - Append `version` query string to force clearing cache when User updates a file
 *    - TBD: Prepend `src` with CDN URL in production
 *
 * @param {Object<src, name>} fileData - to get src for
 * @returns {String} source - file path or base64 encoded data
 */
export function fileSrc ({src, created, updated}) {
  // to load files in local development, set server .env variable for UPLOAD_PATH to ../web/public
  return `${src}?v=${updated || created || '0'}`
}

export default {
  File: {
    src: fileSrc
  },
}
