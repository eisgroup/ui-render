import pages from 'core/src/pages'
import { ROUTE } from 'ui-modules-pack/variables'
import Rocket from './Rocket'
import Dashboard from './Dashboard'

pages[ROUTE.HOME] = Dashboard
pages[ROUTE.ROCKET] = Rocket
