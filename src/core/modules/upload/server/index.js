import { assertBackend } from 'ui-utils-pack'
import { UPLOAD_SERVER } from '../constants'
import schema from '../schema.gql'
import resolver from './resolvers'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

export * from './file'
export * from './image'
export * from './upload'
const uploadServer = {
  NAME: UPLOAD_SERVER,
  resolver,
  schema,
}

export default uploadServer
