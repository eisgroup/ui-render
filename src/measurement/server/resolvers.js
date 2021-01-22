import { GraphQLScalarType } from 'graphql'
import { Response } from 'modules-pack/utils/server/resolver'
import { round } from 'utils-pack'

/**
 * TYPE RESOLVERS ==============================================================
 * =============================================================================
 */

export const Kg = new GraphQLScalarType({
  name: 'Kilogram',
  description: 'Measurement unit for weight, saved as `Int gram` in database, and `Float kg` in client side',
  serialize: (value) => round(value / 1000, 3),  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
Kg._fromClient = function (value) {
  if (Number(value) > 0) return Math.round(value * 1000)
  if (Number(value) === 0) return null
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be greater than or equal 0`)
}

export const Km = new GraphQLScalarType({
  name: 'Kilometre',
  description: 'Measurement unit for length, saved as `Int millimeter` in database, and `Float km` in client side',
  serialize: (value) => round(value / 1000000, 6),  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
Km._fromClient = function (value) {
  if (Number(value) > 0) return Math.round(value * 1000000)
  if (Number(value) === 0) return null
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be greater than or equal 0`)
}

export const Cm = new GraphQLScalarType({
  name: 'Centimeter',
  description: 'Measurement unit for length, saved as `Int millimeter` in database, and `Float cm` in client side',
  serialize: (value) => round(value / 10, 1),  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
Cm._fromClient = function (value) {
  if (Number(value) > 0) return Math.round(value * 10)
  if (Number(value) === 0) return null
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be greater than or equal 0`)
}

export default {
  Kg,
  Km,
  Cm,
}
