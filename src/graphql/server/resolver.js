import { GraphQLScalarType } from 'graphql'
import { SevenBoom as Response } from 'graphql-apollo-errors'
import gqlFields from 'graphql-fields'
import { Kind } from 'graphql/language'
import { SERVER } from 'modules-pack/variables'
import { definitionByValue, enumFrom, isObject } from 'utils-pack'

export { Response }
export const queryFields = gqlFields

/**
 * GRAPHQL RESOLVER HELPERS ====================================================
 * =============================================================================
 */

/**
 * Wrapper for Resolver Functions to return cached results
 *
 * @example:
 *    // Inside GraphQL resolver:
 *    const query = Event.betweenTimeRange.bind(Event, start, end, published)
 *    return ((start || end) ? query() : cachedQuery(`eventsBetween`, query))
 *
 * @param {String} id - query ID to store/retrieve cache
 * @param {Function} callback - async method that returns the result to be cached
 * @param {Number} [cacheTime] - duration in milliseconds
 * @returns {Promise<*>}
 */
export async function cachedQuery (id, callback, cacheTime = SERVER.QUERY_CACHE_TIME) {
  cachedQuery.clean(cacheTime)
  const cached = cachedQuery.by[id]
  if (cached && cached.time > Date.now() - cacheTime) return cached.result
  const result = await callback()
  cachedQuery.by[id] = {result, time: Date.now()}
  return result
}

cachedQuery.by = {} // {'queryId': {result, time}}
cachedQuery.clean = function (cacheTime = SERVER.QUERY_CACHE_TIME) {
  const expireTime = Date.now() - cacheTime
  for (const id in this.by) {
    const {time} = this.by[id]
    if (time <= expireTime) delete this.by[id] // free up memory
  }
}

/**
 * Resolve the final return value (Document/Query/Error) from GraphQL Resolvers.
 * @note: this function is for reference only, do not delete it.
 *        See content of the function for implementation example.
 * @example: if the resolver returns Promise, Promise.then() or `await` keyword resolves to the final result,
 *        no matter how many promises are nested.
 * Case 1.
 * resolver() {
 *    return Model.find()
 * }
 * >>> `result`: Query
 *
 * Case 2.
 * async resolver() {
 *    return Model.findById()
 * }
 * >>> `result`: Promise<Document>
 *
 * Case 3.
 * async resolver() {
 *    const instance = await Model.findById()
 *    return Object.assign(instance, entry).save()
 * }
 * >>> `result`: Promise<Document>
 *
 * Usage inside a Decorator that wraps the resolver:
 * function resolvePromise () {
 * -----------------------------------------------------------------------------
 //   descriptor.value = async function (...args) {
 //     // If result is a Promise, resolve it, else use as is without resolving
 //     let instance = func.apply(this, args)
 //     instance = (instance instanceof Promise) ? (await instance) : instance
 *    }
 * -----------------------------------------------------------------------------
 * }
 */

/**
 * GRAPHQL TYPE DEFINITIONS ----------------------------------------------------
 * -----------------------------------------------------------------------------
 */
/**
 * GraphQL Enum Type - Dynamically defined given Definition Object
 * @example:
 *    const Language = graphQlEnumType(LANGUAGE, 'Language')
 * @param {String} name - of GraphQL type, cannot contain space
 * @param {Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its _ value
 * @param {String} [description] - of GraphQL type
 * @returns {GraphQLScalarType} enum - type
 */
export function gqlEnumType (name, DEFINITION, {description} = {}) {
  const hasEnum = {}
  const enums = enumFrom(DEFINITION).sort().filter(code => (hasEnum[code] = true))
  const Type = new GraphQLScalarType({
    name,
    description: description || `Dynamically defined enumerable: [${enums}]`,
    serialize: (value) => value,  // value sent to the client
    parseValue (value) {return this._fromClient(value)},
    parseLiteral () {return this._fromClient(parseLiteral(...arguments))},
  })
  Type._fromClient = function (value) {
    if (hasEnum[value]) return value
    throw Response.badRequest(`Invalid ${this.name} enum ${value}, must be one of [${enums}]`)
  }
  return Type
}

/**
 * GraphQL Dynamic Key/Value Pairs Object Type
 *
 * @example:
 *    const Phones = graphQlObjType(PHONE, String, 'Phones', {validate: isPhoneNumber})
 * @param {String} name - of GraphQL type, cannot contain space
 * @param {Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its _ value
 * @param {*} ValueType - type of the value i.e String, Number, Array, etc.
 * @param {String} [description] - of GraphQL type
 * @param {Function} [validate] - function that returns true/false if value is valid/invalid
 * @returns {GraphQLScalarType} object - with dynamic keys mapped to values
 */
export function gqlDynamicObjType (name, DEFINITION, ValueType = String, {validate, description} = {}) {
  const keyBy = definitionByValue(DEFINITION)
  const keyEnums = enumFrom(DEFINITION)
  const example = `\n- {\n- ` + keyEnums.map(key => `&nbsp;&nbsp;${key}: \`${ValueType.name}\``).join(`\n- `) + `\n- }`
  const Type = new GraphQLScalarType({
    name,
    description: description || `${name} DEFINITION type:${example}`,
    serialize: (value) => value,  // value sent to the client
    parseValue (value) {return this._fromClient(value)},
    parseLiteral () {return this._fromClient(parseLiteral(...arguments))},
  })
  Type._fromClient = function (value) {
    if (isObject(value)) {
      for (const code in value) {
        const val = value[code]
        if (!keyBy[code])
          throw Response.badRequest(`Invalid ${this.name} code ${code}, must be one of [${keyEnums}]`)
        if (val.constructor !== ValueType)
          return Response.badRequest(`Invalid ${this.name}.${code} ${val}, must be ${ValueType.name}`)
        if (validate && !validate(val))
          return Response.badRequest(`Validation failed for ${this.name}.${code} ${val}`)
      }
      return value
    }
    throw Response.badRequest(`Invalid ${this.name} ${value}, must be key/value pairs`)
  }
  return Type
}

/**
 * GraphQL Key/Value Pairs Type - Tag (as key) and Level (as value)
 * @example:
 *    const LanguageLevel = graphQlTagLevelType(LANGUAGE, LANGUAGE_LEVEL, 'LanguageLevel')
 * @param {String} name - of GraphQL type, cannot contain space
 * @param {Object<KEY<_...>>|Array<_...>} TAG - key/value pairs of variable name with its _ value
 * @param {Object<KEY<_...>>|Array<_...>} TAG_LEVEL - key/value pairs of variable name with its _ value
 * @param {String} [description] - of GraphQL type
 * @param {Boolean} [range] - whether each level must be a list of values (for sliders)
 * @returns {GraphQLScalarType} tag/level - type
 */
export function gqlTagLevelType (name, TAG, TAG_LEVEL, {description, range = false} = {}) {
  const tagBy = definitionByValue(TAG)
  const tagLevelBy = definitionByValue(TAG_LEVEL)
  const tagEnums = enumFrom(TAG)
  const tagLevelEnums = enumFrom(TAG_LEVEL)
  const Type = new GraphQLScalarType({
    name,
    description: description || `Object with dynamic key/value pairs:\n- Key \`String\` [${tagEnums}]\n- Value \`Int\` between [${tagLevelEnums}]`,
    serialize: (value) => value,  // value sent to the client
    parseValue (value) {return this._fromClient(value)},
    parseLiteral () {return this._fromClient(parseLiteral(...arguments))},
  })
  Type._fromClient = function (value) {
    if (isObject(value)) {
      for (const code in value) {
        const level = value[code]
        if (!tagBy[code])
          throw Response.badRequest(`Invalid ${this.name} code ${code}, must be one of [${tagEnums}]`)
        if (!range && !tagLevelBy[level])
          throw Response.badRequest(`Invalid ${this.name} level ${level}, must be one of [${tagLevelEnums}]`)
        if (range) {
          if (!isList(level))
            throw Response.badRequest(`Invalid ${this.name} value ${level}, must be a list of levels`)
          level.forEach(lvl => {
            if (!tagLevelBy[lvl])
              throw Response.badRequest(`Invalid ${this.name} value ${level}, must be a list of [${tagLevelEnums}]`)
          })
        }
      }
      return value
    }
    throw Response.badRequest(`Invalid ${this.name} ${value}, must be key/value pairs`)
  }
  return Type
}

/**
 * GraphQL Scalar Type function to parse JSON literal
 */
export function parseLiteral (ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value

    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)

    case Kind.OBJECT:
      return parseObject(ast, variables)

    case Kind.LIST:
      return ast.values.map(function (n) {
        return parseLiteral(n, variables)
      })

    case Kind.NULL:
      return null

    case Kind.VARIABLE: {
      const name = ast.name.value
      return variables ? variables[name] : undefined
    }

    default:
      return undefined
  }
}

function parseObject (ast, variables) {
  const value = Object.create(null)
  ast.fields.forEach(function (field) {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(field.value, variables)
  })
  return value
}
