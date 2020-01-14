import common from 'core/src/common'
import createStore from 'core/src/common/redux/createStore'
import { ACTIVE } from 'core/src/common/variables'
import webModules from 'core/src/modules'

/**
 * STORE CREATION ==============================================================
 * =============================================================================
 */

ACTIVE.store = createStore(common.concat(webModules))
ACTIVE.createStore = () => createStore(common.concat(webModules))
export default ACTIVE.store
