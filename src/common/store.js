import commonModules from 'ui-modules-pack/common'
import { createStore } from 'ui-modules-pack/redux'
import { Active } from 'ui-utils-pack'

/**
 * EXAMPLE STORE CREATION ======================================================
 * =============================================================================
 */

Active.store = createStore(commonModules)
export default Active.store
