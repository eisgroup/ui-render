import coreModules from 'ui-modules-pack/common'
import { createStore } from 'ui-modules-pack/redux'
import { Active } from 'ui-utils-pack'
import commonModules from './common'
import serverModules from './modules'

// =============================================================================
// STORE CREATION
// =============================================================================

Active.store = createStore(coreModules.concat(commonModules).concat(serverModules))
export default Active.store
