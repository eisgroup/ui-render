export const ObjectId = require('bson-objectid') // adds 1 KB to bundle size gzipped

/**
 * Create 12 bits Hex string ID compatible with MongoDB ID
 *
 * @return {string} ID
 */
export function MongoId () {
  return new ObjectId().toString()
}
