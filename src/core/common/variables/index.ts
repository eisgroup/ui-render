import { FILE } from '../../components/files'
import { __PROD__, HOMEPAGE } from '../../utils'
/**
 * GLOBAL VARIABLES ============================================================
 * =============================================================================
 */

export * from './routes'

// A name-only `Image` loads from here. The homepage prefix applies only when a homepage is actually
// set: in the published library build `process.env` is baked to `{NODE_ENV: 'production'}`
// (webpack.library.config.mjs), so __PROD__ is always true there and REACT_APP_HOMEPAGE never is —
// and without this guard every release from 0.32.4 wrote "undefined/static/images/", a page-relative
// URL that 404s in every host. Measured through webpack, esbuild and Vite hosts and a Node render.
if (__PROD__ && HOMEPAGE) FILE.PATH_IMAGES = `${HOMEPAGE}/static/images/`
