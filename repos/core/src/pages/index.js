import { ROUTE } from '../common/variables'
import Docs from './eis/docs'
import PolicyPage from './eis/Policy'
import Tester from './eis/Tester'

/**
 * EXPORTS =====================================================================
 * Mapping Routes with Pages
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

// Setup routes to deploy react-router on github pages
// see https://dev.to/janjibdev/problem-with-react-router-app-and-github-pages-lij
// To deploy to GitHub pages, run:
// yarn workspace web deploy
export default {
  [ROUTE.HOME]: Docs,
  [ROUTE.DOCS]: Docs,
  [ROUTE.TEST]: Tester,
  [ROUTE.TEST_POLICY]: PolicyPage,
}
