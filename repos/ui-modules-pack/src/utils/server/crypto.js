import bcrypt from 'bcryptjs'

/**
 * CRYPTOGRAPHIC HELPERS =======================================================
 * =============================================================================
 */

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
