import { Response } from 'ui-modules-pack/graphql/server/resolver'
import { hasDeveloperOrHigherAuth } from 'ui-modules-pack/user/logic'
import { __PROD__, toFlatObj } from 'ui-utils-pack'
import ApiKey from './models'
import { apiKeyQueryValidate } from './validators'

/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

export default {
  Query: {
    // Public Endpoint - Retrieves Valid API Key only
    apiKey: async (object, {filter}, {user: {id} = {}}) => {
      const error = await apiKeyQueryValidate(filter, id)
      if (error) return error
      return ApiKey.get(toFlatObj(filter))
    },
    // Internal Developer Staff use only
    apiKeys (object, {filter = {}}, {user: {id, auth} = {}}) {
      if (!id || (__PROD__ && hasDeveloperOrHigherAuth(auth))) return Response.unauthorized(id)
      return ApiKey.find(toFlatObj(filter))
    }
  },
  // Mutation: {
  //   async method (_, __, {user: {id, auth} = {}}) {
  //   }
  // }
}
