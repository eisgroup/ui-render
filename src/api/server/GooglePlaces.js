import { hasListValue, requireEnv, SUCCESS, toJSON, warn } from 'utils-pack'
import { API_PLACES, API_PLATFORM_WEB, API_PROVIDER_GOOGLE } from '../constants'
import { fetch } from '../fetch'
import ApiService from './service'

/**
 * THIRD PARTY SERVICES ========================================================
 * Wrapper Classes around third party APIs, to encapsulate away integration
 * =============================================================================
 */

class GooglePlaces extends ApiService {
  BASE_URL = 'https://maps.googleapis.com/maps/api'
  PLACE_URL = this.BASE_URL + '/place'
  PLACE_DETAILS_URL = this.PLACE_URL + '/details/json?'
  PLACE_PHOTOS_URL = this.PLACE_URL + '/photo?'
  PLACE_ID = 'ChIJGaSPc1pKtUYRHzFSa1B9NHw'  // for test - Red Square, Moscow, Russia
  api = API_PLACES
  provider = API_PROVIDER_GOOGLE
  platform = API_PLATFORM_WEB // because requesting from backend server
  service = {api: this.api, provider: this.provider, platform: this.platform}

  retryCountById = {} // key/value pairs of request count used for retries

  constructor () {
    super()
    /* Load API Keys from .env and save to database */
    const apiKeys = 'API_KEYS_GOOGLE_PLACES_WEB'
    const {[apiKeys]: keys} = requireEnv({[apiKeys]: 'Array of Google Places API Keys'})
    if (!hasListValue(keys)) throw new Error(`Invalid ${apiKeys} ${keys}`)
    this.addKeys(keys).catch(console.error)
  }

  fetchDetails = async (placeId, {sessiontoken, key = this.key, fields} = {}) => {
    if (!key) key = await this.getKey()
    if (fields) fields = fields.join(',')
    return fetch(this.PLACE_DETAILS_URL, {params: {key, place_id: placeId, sessiontoken, fields}})
  }

  /**
   * Check if currently used API Key is valid by testing sample place Id, if not, print out error in the console
   */
  isValid = async (key = this.key) => {
    const response = await this.fetchDetails(this.PLACE_ID, {key})
    const {payload = {}, meta: {result} = {}} = response
    if (result === SUCCESS && payload.status === 'OK' && (payload.result || {}).place_id === this.PLACE_ID) return true
    warn(`API Key ${key} is not valid, got response\n`, response)
    return false
  }

  /**
   * Request Google Place Details
   *
   * @param {String} placeId - to get details for
   * @param {String} [sessionToken] - passed from Client to reduce billing cost
   * @param {Array<String>} [fields] - to select in response
   * @returns {Promise<Place|Error>} result - of place details, or throws error if not found
   */
  async getDetails (placeId = this.PLACE_ID, {sessionToken, fields} = {}) {
    const {payload = {}, meta = {}} = await this.fetchDetails(placeId, {sessionToken, fields})

    // Process Response
    if (meta.result === SUCCESS) {
      const {result, status, error_message} = payload
      // See: https://developers.google.com/places/web-service/details
      switch (status) {
        case 'OK':
          return result
        case 'NOT_FOUND':
        case 'ZERO_RESULTS':
        case 'INVALID_REQUEST':
          throw new Error(toJSON({status, error_message}))
        case 'UNKNOWN_ERROR': // indicates a server-side error; trying again may be successful.
          this.retryCountById[this.key] = (this.retryCountById[this.key] || 0) + 1
          if (this.retryCountById[this.key] < 7) return this.getDetails(placeId, {sessionToken, fields}) // retry given request
          this.retryCountById[this.key] = 0 // reset count and let switch case fall through to swap API key
        default:
          // Retry recursively after swapping API key
          await this.isValid(this.key) // used for debugging
          await this.swapKey({reason: status, message: error_message, request: meta})
          return this.getDetails(placeId, {sessionToken, fields})
      }
    }

    // Throw Error on all other cases
    const name = `${this.constructor.name}.${this.getDetails.name}()`
    warn(`${name} result is ${meta.result} with payload:`, payload)
    throw new Error(`Request Failed`)
  }
}

export default new GooglePlaces()
