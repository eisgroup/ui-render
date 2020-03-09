/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

export default {
  Query: {
    method (object, payload, context) {
    }
  },
  Mutation: {
    async method (_, __, {user: {id, auth} = {}}) {
    }
  }
}
