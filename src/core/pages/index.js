import { ROUTE } from '../common/variables'
import Docs from './main/Docs'
import Tester from './main/Tester'

export default {
  [ROUTE.HOME]: Docs,
  [ROUTE.DOCS]: Docs,
  [ROUTE.TEST]: Tester
}
