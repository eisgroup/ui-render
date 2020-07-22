import coreModules from 'core/src/common'
import createStore from 'core/src/common/redux/createStore'
import { Active } from 'core/src/common/variables'
import serverModules from 'modules-pack'
import commonModules from './common'

// =============================================================================
// STORE CREATION
// =============================================================================

Active.store = createStore(coreModules.concat(commonModules).concat(serverModules))
export default Active.store
