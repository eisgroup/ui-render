import form from './form'
import popup from './popup'
import router from './router'
import settings from './settings'
import upload from './upload'
import user from './user'

/**
 * MODULE EXPORTS ==============================================================
 * Exposing API for Activated Modules
 * =============================================================================
 */

export {
  router,
  form,
  popup,
  settings,
  upload,
  user,
}

/* Activated Modules */
export default [
  router,
  form,
  popup,
  settings,
  upload,
  user,
]
