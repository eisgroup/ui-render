import { ROUTE } from 'modules-pack/variables'
import Demo from './eis/demo'
import Docs from './eis/docs'
import OpenL from './eis/openl'
import PolicyPage from './eis/Policy'
import Webstudio from './eis/webstudio'
// import Tester from './tester'
// import Theme from './theme'

/**
 * EXPORTS =====================================================================
 * Mapping Routes with Pages
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  [ROUTE.HOME]: OpenL,
  [ROUTE.DOCS]: Docs,
  [ROUTE.WEBSTUDIO]: Webstudio,
  [ROUTE.TEST_POLICY]: PolicyPage,
  [ROUTE.DEMO]: Demo,
  // [ROUTE.TESTER]: Tester,
  // [ROUTE.THEME]: Theme,
}
