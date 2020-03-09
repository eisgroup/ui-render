import bcrypt from 'bcryptjs'
import { get } from 'core/src/common/utils'
import { QUERY_CACHE_TIME } from 'core/src/common/variables'
import { Kind } from 'graphql/language'

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * Wrapper for Resolver Functions to return cached results
 * @param {String} id - query ID to store/retrieve cache
 * @param {Function} callback - async method that returns the result to be cached
 * @param {Number} [cacheTime] - duration in milliseconds
 * @returns {Promise<*>}
 */
export async function cachedQuery (id, callback, cacheTime = QUERY_CACHE_TIME) {
  cachedQuery.clean(cacheTime)
  const cached = cachedQuery.by[id]
  if (cached && cached.time > Date.now() - cacheTime) return cached.result
  const result = await callback()
  cachedQuery.by[id] = {result, time: Date.now()}
  return result
}

cachedQuery.by = {} // {'queryId': {result, time}}
cachedQuery.clean = function (cacheTime = QUERY_CACHE_TIME) {
  const expireTime = Date.now() - cacheTime
  for (const id in this.by) {
    const {time} = this.by[id]
    if (time <= expireTime) delete this.by[id] // free up memory
  }
}

export function getIpFromRequest (req) {
  return get(req, 'headers["x-forwarded-for"]') || get(req, 'connection.remoteAddress')
}

/**
 * Hash a string using bcrypt
 * Note: keep it under Server only because bcrypt library produces error with create-react-app
 *
 * @param {string} string - value to hash
 * @param {boolean} isAsync - whether process should be asynchronous, default is true because it takes ~80ms
 * @param {number} saltRounds - the cost of processing the data, must be minimum 12
 * @returns {string} - hashed value
 */
export function generateHash (string, isAsync = true, saltRounds = 12) {
  if (isAsync) return bcrypt.hash(string, saltRounds)
  return bcrypt.hashSync(string, saltRounds)
}

/**
 * Compare a string using bcrypt
 * Note: keep it under Server only because bcrypt library produces error with create-react-app
 *
 * @param {string} string - value to check
 * @param {string} hash - value to compare against
 * @param {boolean} isAsync - whether process should be asynchronous, default is true because it takes ~80ms
 * @returns {boolean} - whether string matches hash
 */
export function compareHash (string, hash, isAsync = true) {
  if (isAsync) return bcrypt.compare(string, hash)
  return bcrypt.compareSync(string, hash)
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

