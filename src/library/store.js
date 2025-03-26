import form from 'ui-modules-pack/form'
import popup from 'ui-modules-pack/popup'
import redux, { createStore } from 'ui-modules-pack/redux'
import router from 'ui-modules-pack/router/browser'
import saga from 'ui-modules-pack/saga'
import settings from 'ui-modules-pack/settings'
import upload from 'ui-modules-pack/upload'
import user from 'ui-modules-pack/user'
import { Active } from 'ui-utils-pack'

/**
 * STORE CREATION ==============================================================
 * =============================================================================
 */

const modulesActivated = [
  redux,
  saga,
  router,
  form,
  popup,
  settings,
  upload,
  user,
]
Active.store = createStore(modulesActivated)
Active.createStore = () => createStore(modulesActivated)
export default Active.store
