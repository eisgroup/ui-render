import { ROUTE } from '../common/variables'
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
  [ROUTE.HOME]: Home,
  [ROUTE.REPORT]: Home,
  [ROUTE.TESTER]: Tester,
  [ROUTE.THEME]: Theme,
}
