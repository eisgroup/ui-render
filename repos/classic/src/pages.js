import WebStudioPage from 'core/src/pages/eis/webstudio'
import { ROUTE, ROUTES } from 'modules-pack/variables'

/**
 * EXPORTS =====================================================================
 * Mapping Routes with Pages
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  [ROUTE.HOME]: WebStudioPage,
}

ROUTES.FOR_NAV = []
