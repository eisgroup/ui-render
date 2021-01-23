import { assertFrontend } from 'utils-pack'
import { _TEMPLATE_CLIENT } from '../constants'
// import saga from './sagas'

/**
 * EXPORTS FOR FRONTEND ONLY ===================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertFrontend()

const _templateClient = {
  NAME: _TEMPLATE_CLIENT,
  // saga,
}

export default _templateClient
