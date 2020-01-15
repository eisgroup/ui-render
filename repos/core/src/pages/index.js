import { ROUTE } from '../common/variables'
import OpenL from './eis/openl'
import Home from './home'
import Tester from './tester'
import Theme from './theme'

/**
 * EXPORTS =====================================================================
 * Mapping Routes with Pages
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  [ROUTE.HOME]: OpenL,
  [ROUTE.REPORT]: Home,
  [ROUTE.TESTER]: Tester,
  [ROUTE.THEME]: Theme,
}
