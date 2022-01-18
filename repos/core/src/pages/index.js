import { ROUTE } from 'modules-pack/variables'
import Docs from './eis/docs'
import PolicyPage from './eis/Policy'
// import Tester from './tester'
// import Theme from './theme'

/**
 * EXPORTS =====================================================================
 * Mapping Routes with Pages
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  [ROUTE.HOME]: Docs,
  [ROUTE.DOCS]: Docs,
  [ROUTE.TEST_POLICY]: PolicyPage,
  // [ROUTE.TESTER]: Tester,
  // [ROUTE.THEME]: Theme,
}
