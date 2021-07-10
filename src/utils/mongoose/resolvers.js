import { GraphQLScalarType } from 'graphql'
import { Response } from 'modules-pack/graphql/server/resolver'
import { isObjectID } from './types'

/**
 * TYPE RESOLVERS ==============================================================
 * =============================================================================
 */

export const ObjectID = new GraphQLScalarType({
  name: 'Id',
  description: 'Mongoose Object ID string`',
  serialize: value => value,  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
ObjectID._fromClient = function (value) {
  if (isObjectID(value)) return value
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be a Mongoose Object ID (hexadecimal 12-byte identifier)`)
}

export default {
  ObjectID
}
