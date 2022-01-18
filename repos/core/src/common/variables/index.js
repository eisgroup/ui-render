import { FILE } from 'react-ui-pack/files'
import { __PROD__, ENV } from 'utils-pack'
/**
 * GLOBAL VARIABLES ============================================================
 * =============================================================================
 */

export * from './routes'

if (__PROD__) FILE.PATH_IMAGES = `${ENV.REACT_APP_HOMEPAGE}/static/images/`

/* Platform Prefixes */
export const SERVER = 'SERVER'
