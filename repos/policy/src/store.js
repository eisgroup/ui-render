import api from 'modules-pack/api'
import form from 'modules-pack/form'
import popup from 'modules-pack/popup'
import redux, { createStore } from 'modules-pack/redux'
import router from 'modules-pack/router/browser'
import saga from 'modules-pack/saga'
import settings from 'modules-pack/settings'
import upload from 'modules-pack/upload'
import user from 'modules-pack/user'
import { Active } from 'utils-pack'

/**
 * STORE CREATION ==============================================================
 * =============================================================================
 */

const modulesActivated = [
  redux,
  saga,
  api,
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
