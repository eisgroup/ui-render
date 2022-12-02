import { FILE } from 'ui-react-pack/files'
import { __PROD__, ENV } from 'ui-utils-pack'
/**
 * GLOBAL VARIABLES ============================================================
 * =============================================================================
 */

export * from './routes'

const homePage = typeof ENV.REACT_APP_HOMEPAGE !== 'undefined' && ENV.REACT_APP_HOMEPAGE !== 'undefined' ? ENV.REACT_APP_HOMEPAGE : ''
if (__PROD__) FILE.PATH_IMAGES = `${homePage}/static/images/`

/* Platform Prefixes */
export const SERVER = 'SERVER'
