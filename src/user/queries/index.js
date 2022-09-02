import { Active } from 'ui-utils-pack'
import logout from './logout.gql'
import user from './user.gql'
import usersSummary from './usersSummary.gql'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

if (!Active.UserQuery) Active.UserQuery = user
export {
  user,
  usersSummary,
  logout,
}
