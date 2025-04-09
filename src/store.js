import popup from './core/modules/popup'
import redux, { createStore } from './core/modules/redux'
import settings from './core/modules/settings'
import upload from './core/modules/upload'
import { Active } from './core/utils'

const modulesActivated = [
  redux,
  popup,
  settings,
  upload,
]

Active.store = createStore(modulesActivated)
export default Active.store
