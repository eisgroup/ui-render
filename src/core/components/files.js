import { ENV } from 'ui-utils-pack'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const CDN_URL = ENV.REACT_APP_CDN_URL || ''

export const FILE = {
  PATH_IMAGES: `${CDN_URL}/static/images/`,
  CDN_URL,
}

