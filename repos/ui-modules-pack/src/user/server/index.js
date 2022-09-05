import { assertBackend } from 'ui-utils-pack'
import { USER_SERVER } from '../constants'
import schema from '../schema.gql'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

const userServer = {
  NAME: USER_SERVER,
  schema, // for modular import in projects, because Nodemon did not compile direct schema import from external package
}

export default userServer
