import { assertBackend } from 'ui-utils-pack'
import { _TEMPLATE_SERVER } from '../constants'
import schema from '../schema.gql'
// import Model from './models'
// import resolver from './resolvers'

// -----------------------------------------------------------------------------
// import schema from 'ui-modules-pack/_template/schema.gql'
// -> does not compile with Nodemon when importing schema from package,
// but can import the '_templateServer' index.js module with schema attached,
// or import schema from symlink.
// import schema from '../../../_symlink/tag/schema.gql'
// Best to include `_templateServer` in modules.js
// -----------------------------------------------------------------------------

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

const _templateServer = {
  NAME: _TEMPLATE_SERVER,
  // Model,
  // resolver,
  schema, // for modular import in projects, because Nodemon did not compile direct schema import from external package
}

export default _templateServer
