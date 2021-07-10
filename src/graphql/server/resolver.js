import { GraphQLScalarType } from 'graphql'
import { SevenBoom as Response } from 'graphql-apollo-errors'
import gqlFields from 'graphql-fields'
import { Kind } from 'graphql/language'
import { base64Encode } from 'modules-pack/utils/server/file'
import { IMAGE, SERVER } from 'modules-pack/variables'
import { __DEV__, _WORK_DIR_, definitionByValue, enumFrom, fileExtensionNormalized, isObject } from 'utils-pack'

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
 * Compute File Source String for Client Consumption in Local Development Environment
 *    - Base encode image files in local development because CSS background-image cannot load local files
 *    - Prepend `src` with absolute file path in local development
 *    - TBD: Prepend `src` with CDN URL in production
 *
 * @param {Object<src, name>} fileData - to get src for
 * @returns {String} source - file path or base64 encoded data
 */
export function fileSrc ({src, name}) {
  if (!__DEV__) return src
  const ext = fileExtensionNormalized(name) || ''
  const localPath = `${_WORK_DIR_}${src}` // point to absolute file path, because there is no web server
  return (IMAGE.EXTENSIONS.includes(ext)) ? base64Encode(localPath) : localPath
}

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
