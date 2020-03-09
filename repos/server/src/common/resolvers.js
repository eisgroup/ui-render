import { toTimestamp } from 'core/src/common/utils'
import { GraphQLScalarType } from 'graphql'
import { SevenBoom as Response } from 'graphql-apollo-errors'
import JSON from 'graphql-type-json'
import { Kind } from 'graphql/language'

/**
 * GRAPHQL DATA MAPPING ========================================================
 * Define how field values are returned, to encapsulate away backend integration
 * =============================================================================
 */

const Timestamp = new GraphQLScalarType({
  name: 'Timestamp',
  description: 'Unix timestamp in `milliseconds`',
  serialize: toTimestamp,  // value sent to the client
  parseValue: toTimestamp,  // value from the client (as variables' interpolation)
  parseLiteral (ast) {  // value from the client (as inline arguments)
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return toTimestamp(ast.value) // ast.value is always in string format
    }
    throw Response.badRequest(`Invalid Timestamp input ${ast.value}, must be numeric string or number`)
  }
})

export default {
  Timestamp,
  JSON,
  Query: {
    cursor: (_, __, {res}) => {
      return res.cursor || {}
    }
  }
}

/**
 * INTERNAL HELPERS ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
