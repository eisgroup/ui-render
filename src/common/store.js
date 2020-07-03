import commonModules from 'modules-pack/common'
import { createStore } from 'modules-pack/redux'
import { ACTIVE } from 'utils-pack'

// =============================================================================
// STORE CREATION
// =============================================================================

ACTIVE.store = createStore(commonModules)
export default ACTIVE.store
