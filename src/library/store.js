import form from 'ui-modules-pack/form'
import popup from 'ui-modules-pack/popup'
import redux, { createStore } from 'ui-modules-pack/redux'
import saga from 'ui-modules-pack/saga'
import settings from 'ui-modules-pack/settings'
import upload from 'ui-modules-pack/upload'
import { Active } from 'ui-utils-pack'

/**
 * STORE CREATION ==============================================================
 * =============================================================================
 */

const modulesActivated = [
  redux,
  saga,
  popup,
  settings,
  upload,
]
Active.store = createStore(modulesActivated)
export default Active.store
