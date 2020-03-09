import coreModules from 'core/src/common'
import createStore from 'core/src/common/redux/createStore'
import { ACTIVE } from 'core/src/common/variables'
import commonModules from './common'
import serverModules from './modules'

// =============================================================================
// STORE CREATION
// =============================================================================

ACTIVE.store = createStore(coreModules.concat(commonModules).concat(serverModules))
export default ACTIVE.store
