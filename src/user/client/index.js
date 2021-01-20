import { USER_CLIENT } from '../constants'
import saga from './sagas'

/**
 * EXPORTS FOR FRONTEND ONLY ===================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

const userClient = {
  NAME: USER_CLIENT,
  saga,
}

export default userClient
