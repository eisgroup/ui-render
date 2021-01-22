import { GraphQLScalarType } from 'graphql'
import { SevenBoom as Response } from 'graphql-apollo-errors'
import { Kind } from 'graphql/language'
import { SERVER, UPLOAD } from 'modules-pack/variables'
import { __DEV__, definitionByValue, enumFrom, fileExtensionNormalized } from 'utils-pack'
import { base64Encode } from './file'

export { Response }

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
 * GraphQL Enum Type - Dynamically defined given Definition Object
 * @example:
 *    const Language = graphQlEnumType(LANGUAGE, 'Language')
 * @param {String} name - of GraphQL type, cannot contain space
 * @param {Object<NAME<code>>} DEFINITION - key/value pairs of variable name with its code value
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
 * @param {Object<NAME<code...>>} DEFINITION - key/value pairs of variable name with its code value
 * @param {*} ValueType - type of the value i.e String, Number, Array, etc.
 * @param {String} [description] - of GraphQL type
 * @param {Function} [validate] - function that returns true/false if value is valid/invalid
 * @returns {GraphQLScalarType} object - with dynamic keys mapped to values
 */
export function gqlDynamicObjType (name, DEFINITION, ValueType = String, {validate, description} = {}) {
  const keyBy = definitionByValue(DEFINITION)
  const keyEnums = enumFrom(DEFINITION)
  const Type = new GraphQLScalarType({
    name,
    description: description || `Object with dynamic key/value pairs:\n- Key \`String\` [${keyEnums}]\n- Value \`${ValueType.name}\``,
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
 * @param {Object<NAME<code...>>} TAG - definition
 * @param {Object<NAME<code...>>} TAG_LEVEL - definition
 * @param {String} [description] - of GraphQL type
 * @param {Boolean} [range] - whether each level must be a list of values (for sliders)
 * @returns {GraphQLScalarType} tag/level - type
 */
export function gqlTagLevelType (name, TAG, TAG_LEVEL, {description, range = false} = {}) {
  const tagBy = definitionByCode(TAG)
  const tagLevelBy = definitionByCode(TAG_LEVEL)
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
 * GraphQL File Type - Dynamically defined given list of allow file kinds
 * @example:
 *    const UserPhotos = graphQlFileType('UserPhotos')
 *    >>> {
 *          'public': {
 *              i
 *              src
 *              name
 *              created
 *           }
 *        }
 * @param {String} name - of GraphQL type, cannot contain space
 * @param {Array<String>} KINDS - enumerable list of allowed file kinds, defaults to ['public']
 * @param {String} [description] - of GraphQL type
 * @returns {GraphQLScalarType} files - type
 */
export function gqlFileType (name, KINDS = ['public'], {description} = {}) {
  const isAllowed = {}
  KINDS.forEach(kind => (isAllowed[kind] = true))
  const Type = new GraphQLScalarType({
    name,
    description: description || ('An object mapping of file kinds `[' + KINDS + ']` to list of files `[{i, src, name, created}]`'),
    serialize: ({dir, data}) => {
      const result = {}
      const uploadPath = `${__DEV__ ? UPLOAD_PATH : UPLOAD_DIR}${dir}`
      for (const kind in data.toObject()) {
        const [...fileList] = data[kind] || []
        if (!fileList.length) continue
        result[kind] = []
        fileList.forEach(({i, name, created}) => {
          result[kind].push({i, name, created, src: srcFrom({i, name, created}, {uploadPath, kind})})
        })
      }
      return result
    },  // value sent to the client
    parseValue (value) {return this._fromClient(value)},
    parseLiteral () {return this._fromClient(parseLiteral(...arguments))},
  })

  // @Note: this is not used, replaced by `[FileInput!]`
  Type._fromClient = function (value) {
    if (isObject(value)) {
      for (const kind in value) {
        if (!isAllowed[kind])
          throw Response.badRequest(`Invalid ${this.name} kind ${kind}, must be one of [${KINDS}]`)
        const files = value[kind]
        if (!hasListValue(files))
          throw Response.badRequest(`Invalid ${this.name} input for kind ${kind}, must be array of FileInput, got ${files}`)
      }
      return value
    }
    throw Response.badRequest(`Invalid ${this.name} ${value}, must be key/value pairs`)
  }
  return Type
}

/**
 * Get Avatar URL from given Instance Photos object
 *
 * @param {String} [photosPath] - to retrieve photos from instance
 * @param {String} [kind] - of file kind to use, defaults to 'public'
 * @return {Function} resolver - for GraphQL
 *    @returns {String|Null} URL - if exists
 */
export function avatarFromPhotos ({kind = 'public', photosPath = 'photos'} = {}) {
  return function (instance) {
    const {[photosPath]: photos} = instance || {}
    if (!photos) return null
    const {dir} = photos
    const {i, name, created} = get(photos, `data.${kind}.0`) || {}
    if (i == null || dir == null) return null
    return srcFrom({i, name, created}, {dir, kind})
  }
}

/**
 * Compute File Source String for Client Consumption
 *    - Append `created` query string to force clearing cache when User updates a file
 *    - Base encode image files while in Dev mode because CSS background-image cannot load local files
 *
 * @param {Object<i, name, created>} fileData - to get src for
 * @param {String} [dir] - directory path of given file to compute `uploadPath`
 * @param {String} [uploadPath] - where the file is located, required if `dir` not defined
 * @param {String} [kind] - of file kind to use, defaults to 'public'
 * @returns {String} source - file path or base64 encoded data
 */
export function srcFrom ({i, name, created}, {dir, uploadPath, kind = 'public'}) {
  if (!uploadPath && !dir) throw new Error(`${srcFrom.name}() requires either \`dir\` or \`uploadPath\``)
  if (!uploadPath) uploadPath = `${__DEV__ ? UPLOAD.PATH : UPLOAD.DIR}${dir}`
  const ext = fileExtensionNormalized(name) || ''
  const filePath = `${uploadPath}/${kind}/${i}${ext && `.${ext}`}`
  return (__DEV__ && ext === 'jpg') ? base64Encode(filePath) : `${filePath}?t=${created}`
}

/**
 * Get Queried Field Names
 *
 * @param {Object} info - 4th argument in resolver function
 * @param {String} queryName - to get fields for, example: 'users'
 * @returns {Object} field - with queried field names as keys
 */
export function queryFields (info, queryName) {
  const result = {}
  const query = info.fieldNodes.find(({name: {kind, value} = {}}) => kind === 'Name' && value === queryName)
  const queries = [query]
  for (const key in info.fragments) {
    queries.push(info.fragments[key])
  }
  queries.forEach(q => {
    get(q, 'selectionSet.selections', []).forEach(({name: {value} = {}}) => {
      if (value) result[value] = {} // only checking first level fields for now.
    })
  })
  return result
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
