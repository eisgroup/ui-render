import pages from 'core/src/pages'
import { ROUTE } from 'ui-modules-pack/variables'
import Dashboard from './Dashboard'
import Earth from './Earth'
import Rocket from './Rocket'
import Canopy from './Canopy'

pages[ROUTE.HOME] = Dashboard
pages[ROUTE.EARTH] = Earth
pages[ROUTE.ROCKET] = Rocket
pages[ROUTE.CANOPY] = Canopy
