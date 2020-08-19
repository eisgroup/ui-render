import coreModules from 'modules-pack/common'
import { createStore } from 'modules-pack/redux'
import { Active } from 'utils-pack'
import commonModules from './common'
import serverModules from './modules'

// =============================================================================
// STORE CREATION
// =============================================================================

Active.store = createStore(coreModules.concat(commonModules).concat(serverModules))
export default Active.store
