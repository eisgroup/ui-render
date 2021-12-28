import { createModel, Id, index, Mixed, required, Timestamp } from 'modules-pack/utils/mongoose'
import { DEFAULT } from 'modules-pack/variables/defaults'
import { ONE_DAY, warn } from 'utils-pack'
import { API_MODEL, API_PLACES, API_PLATFORM_WEB, API_PROVIDER_GOOGLE } from '../constants'

/**
 * DATABASE MODELS =============================================================
 * =============================================================================
 */

if (!DEFAULT.API_KIND) DEFAULT.API_KIND = API_PLACES
if (!DEFAULT.API_PROVIDER) DEFAULT.API_PROVIDER = API_PROVIDER_GOOGLE
if (!DEFAULT.API_PLATFORM) DEFAULT.API_PLATFORM = API_PLATFORM_WEB

// Model Definition
const ApiKey = createModel(API_MODEL, {
  _id: Id,
  provider: {type: String, required, index}, // ex. 'google'
  api: {type: String, required, index}, // ex. 'places'
  key: {type: String, required, index},
  platform: String,
  active: {type: Boolean, default: true}, // for manually disabling API Key
  fail: {
    type: {
      _id: false,
      time: Timestamp,
      reason: String,
      message: String,
      request: Mixed, // api request that caused failure
    },
    default: undefined,
  },
  created: Timestamp,
  updated: Timestamp,
}, {uniqueTogether: ['provider', 'api', 'key', 'platform']})
export default ApiKey

/**
 * List Valid API Key Entries for given options
 *
 * @param {String} api - type (ex. 'places')
 * @param {String} [platform] - ex. 'web'
 * @param {String} provider - third party service provider for given API (ex. 'google')
 * @returns {Promise<Array<Object>>} list - of API Key entries if found, else empty list
 */
ApiKey.list = function ({api = DEFAULT.API_KIND, provider = DEFAULT.API_PROVIDER, ...otherFilters} = {}) {
  const resetTime = Date.now() - ONE_DAY
  return ApiKey.find({
    $and: [
      {api, provider, active: true, ...otherFilters},
      {
        $or: [
          {fail: undefined},
          {fail: {reason: ''}},
          {fail: {reason: 'OVER_QUERY_LIMIT', time: {$lt: resetTime}}},
        ]
      },
    ]
  })
}

/**
 * Get a Single Valid API Key Entry for given options
 * @note: see ApiKey.list for docs
 * @returns {Promise<Array<Object>|Undefined>} entry - of API Key if found, else undefined
 */
ApiKey.get = function ({api = DEFAULT.API_KIND, provider = DEFAULT.API_PROVIDER, ...otherFilters} = {}) {
  return ApiKey.list({api, provider, ...otherFilters}).limit(1).then(list => list[0])
}

/**
 * Get a Single Valid API Key for given options, or Throw Error on Failure
 * @see: ApiKey.get() for docs
 */
ApiKey.getKey = async function ({api, provider, ...otherFilters} = {}) {
  const {key} = (await ApiKey.get({api, provider, ...otherFilters})) || {}
  if (!key) throw new Error(`No valid API Key found for ${arguments}`)
  return key
}

/**
 * Update Failed API Key and Get Another Valid Key (safe for recursive calls)
 * @returns {String} key - new valid API key if found, else throws error
 */
ApiKey.swap = async function ({key, api, provider, reason, message, request, ...otherFilters}) {
  // noinspection JSCheckFunctionSignatures
  await ApiKey.updateOnFailure(...arguments)
  const newKey = await ApiKey.getKey({api, provider, ...otherFilters})
  warn(`Swapping API Key
  from ${key}
  to   ${newKey}`)
  return newKey
}

ApiKey.updateOnFailure = function ({key, api, provider, reason, message, request, ...otherFilters}) {
  const fail = {time: Date.now(), reason, message, request}
  return ApiKey.findOneAndUpdate({key, api, provider, ...otherFilters}, {fail}, {new: true})
}
