import { DEFAULT } from 'modules-pack/variables/defaults'
import ApiKey from './models'

/**
 * ABSTRACT API CLASS ==========================================================
 * To be extended by third party services, like googlePlaces.js
 * =============================================================================
 */

export default class ApiService {
  // ---------------------------------------------------------------------------
  // This section is to be overridden by the extending class
  // ---------------------------------------------------------------------------
  api = DEFAULT.API_KIND
  provider = DEFAULT.API_PROVIDER
  platform = DEFAULT.API_PLATFORM
  service = {api: this.api, provider: this.provider, platform: this.platform}
  // ---------------------------------------------------------------------------
  // The extending class should set this.key on init by using this.addKeys()
  // or retrieve it just before making fetch
  // ---------------------------------------------------------------------------

  addKeys = (keys, platform = this.platform) => {
    this.key = keys[0]
    return ApiKey.bulkWrite(keys.map(key => {
      const entry = {...this.service, platform, key}
      return ({
        updateOne: {
          filter: {...entry}, // this object gets mutated
          update: entry,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      })
    }))
  }

  getKey = async (platform = this.platform) => {
    if (!this.key) this.key = await ApiKey.getKey({...this.service, platform})
    return this.key
  }

  swapKey = async ({reason, message, request}) => {
    this.key = await ApiKey.swap({...this.service, key: this.key, reason, message, request})
    return this.key
  }
}
