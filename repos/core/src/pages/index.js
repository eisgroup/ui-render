import { ROUTE } from '../common/variables'
import Demo from './eis/demo'
import OpenL from './eis/openl'
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
  [ROUTE.DEMO]: Demo,
  [ROUTE.TESTER]: Tester,
  [ROUTE.THEME]: Theme,
}
