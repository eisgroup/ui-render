// import api from '../api'
import logger from '../logger'
import redux from '../redux'
import saga from '../saga'
import socket from '../socket'

/**
 * EXAMPLE EXPORTS =============================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

/* Activated Modules */
const commonModules = [
  redux,
  saga,
  // api,
  socket,
  logger  // must be the last module to avoid intercepting other middleware
]

export default commonModules
