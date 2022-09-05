import { Active } from 'ui-utils-pack'
import login from './login.gql'
import signup from './signup.gql'
import user from './user.gql'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

if (!Active.UserMutation) Active.UserMutation = user
export {
  login,
  signup,
  user,
}
