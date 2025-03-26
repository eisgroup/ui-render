import crypto from 'crypto' // adds 223 KB to bundle js

/**
 * CRYPTOGRAPHIC FUNCTIONS =====================================================
 * =============================================================================
 */

/**
 * Sign message with secret key using native Node.js crypto (fastest)
 *
 * @param {string} text - to sign
 * @param {string} key - secret
 * @param {string} [algo] - cryptographic algorithm to use
 * @param {string} [format] - output hash type, one of ['binary', 'hex', 'base64']
 * @param {string} [encoding] - input data type, one of ['binary', 'hex', 'base64']
 * @return {string} - signature
 */
export function cryptoSign (text, key, algo = 'sha256', format = 'hex', encoding) {
  return crypto.createHmac(algo, key).update(text, encoding).digest(format)
}

/**
 * Verify Signature integrity for given Message with Secret key
 *
 * @param {string} signature - to verify
 * @param {string} message - to sign
 * @param {string} key - secret
 * @param {string} [algo] - cryptographic algorithm to use
 * @param {string} [format] - output hash type, one of ['binary', 'hex', 'base64']
 * @return {boolean} - true if signature is valid, else false
 */
export function cryptoSignVerify (signature, message, key, algo = 'sha256', format = 'hex') {
  return !!(signature && message && key) && signature === cryptoSign(message, key, algo, format)
}

/**
 * Hash message using native Node.js crypto (fastest)
 *
 * @param {string} text - to hash
 * @param {string} [algo] - cryptographic algorithm to use
 * @param {string} [format] - output hash type, one of ['binary', 'hex', 'base64']
 * @return {string} - hash
 */
export function cryptoHash (text, algo = 'md5', format = 'hex') {
  return crypto.createHash(algo).update(text).digest(format)
}

/**
 * Encrypt Text string
 *
 * @param {String} text - message to encrypt
 * @param {String} key - at least 32 characters secret
 * @param {string} [algo] - cryptographic algorithm to use
 * @return {string} - encrypted text
 */
export function encrypt (text, key, algo = 'aes-256-ctr') {
  key = Buffer.from(key.slice(0, 32))
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algo, key, iv)
  return iv.toString('hex') + cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}

/**
 * Decrypt Text string
 *
 * @param {String} text - content with IV prefix to decrypt
 * @param {String} key - at least 32 characters secret
 * @param {string} [algo] - cryptographic algorithm to use
 * @return {string} - decrypted text
 */
export function decrypt (text, key, algo = 'aes-256-ctr') {
  key = Buffer.from(key.slice(0, 32))
  const iv = Buffer.from(text.substring(0, 32), 'hex')
  const decipher = crypto.createDecipheriv(algo, key, iv)
  return decipher.update(text.substring(32), 'hex', 'utf8') + decipher.final('utf8')
}
