import form from './core/modules/form'
import popup from './core/modules/popup'
import redux, { createStore } from './core/modules/redux'
import router from './core/modules/router/browser'
import saga from './core/modules/saga'
import settings from './core/modules/settings'
import upload from './core/modules/upload'
import user from './core/modules/user'
import { Active } from './core/utils'

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
