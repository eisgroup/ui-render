import { IMAGE } from 'modules-pack/variables'
import { __DEV__, _WORK_DIR_, fileExtensionNormalized } from 'utils-pack'
import { base64Encode } from './file'

/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

/**
 * Compute File Source String for Client Consumption in Local Development Environment
 *    - Append `version` query string to force clearing cache when User updates a file
 *    - Base encode image files in local development because CSS background-image cannot load local files
 *    - Prepend `src` with absolute file path in local development
 *    - TBD: Prepend `src` with CDN URL in production
 *
 * @param {Object<src, name>} fileData - to get src for
 * @returns {String} source - file path or base64 encoded data
 */
export function fileSrc ({src, name, created, updated}) {
  if (!__DEV__) return `${src}?v=${updated || created || '0'}`
  const ext = fileExtensionNormalized(name) || ''
  const localPath = `${_WORK_DIR_}${src}` // point to absolute file path, because there is no web server
  return (IMAGE.EXTENSIONS.includes(ext)) ? `data:image/${ext};base64,${base64Encode(localPath)}` : localPath
}

export default {
  File: {
    src: fileSrc
  },
}
