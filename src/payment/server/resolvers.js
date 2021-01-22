import { GraphQLScalarType } from 'graphql'
import { gqlEnumType, Response } from 'modules-pack/utils/server/resolver'
import { CURRENCY } from 'modules-pack/variables'
import { isNumeric, round } from 'utils-pack'

export const CurrencyAmount = new GraphQLScalarType({
  name: 'CurrencyAmount',
  description: 'Measurement unit for money, example: saved as `Int cents` in database, and `Float dollar` in client side',
  serialize: (value) => round(value / 100, 2),  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
CurrencyAmount._fromClient = function (value) {
  if (isNumeric(value)) return Math.round(value * 100)
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be numeric`)
}

export const CurrencySymbol = gqlEnumType('CurrencySymbol', CURRENCY)

export default {
  CurrencyAmount,
  CurrencySymbol
}
