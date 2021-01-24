import GooglePlaces from 'modules-pack/api/server/GooglePlaces'
import { Address, createModel, Files, index, Name, Point, required, URL } from 'modules-pack/utils/mongoose'
import { hasListValue, isInList, ONE_MONTH, toUpperCase } from 'utils-pack'
import { toTimestamp } from 'utils-pack/time'
import { PLACE_MODEL } from '../constants'

/**
 * MONGODB DATABASE MODELS =====================================================
 * =============================================================================
 */

// Model Definition
const Place = createModel(PLACE_MODEL, {
  _id: String, // place ID provided by third party service (i.e. 'google')
  location: {...Point, required, index},
  address: {...Address, required},
  name: Name,
  city: Name,
  country: Name,
  icon: URL,
  provider: {type: String, default: 'google'},
  photos: Files,
})
export default Place

/**
 * Retrieve or Create Place Details for given Place ID
 * @returns {Promise<Place|Error>} instance - found/created Place document, or throws error
 */
Place.getOrCreate = async function ({
  id,
  sessionToken,
  provider = 'google',
  cache = ONE_MONTH,
  withPhotos = false
} = {}) {
  if (provider !== 'google') throw Error(`provider '${provider}' is not supported.`)
  let result = await Place.findById(id)

  // Retrieve (no update is required)
  if (result instanceof Place && toTimestamp(result.updated) >= Date.now() - cache) return result

  // Update/Creation is Required
  const {geometry: {location}, formatted_address, name, icon, address_components} = await GooglePlaces.getDetails(id, {
    sessionToken,
    fields: ['name', 'formatted_address', 'place_id', 'geometry', 'address_component', 'icon']
  })
  const place = {
    _id: id,
    location,
    address: formatted_address,
    name,
    ...addressFrom(address_components),
    icon,
    provider,
  }

  // Update
  if (result instanceof Place) {
    Object.assign(result, place)
    result.updated = new Date()
    return result.save()
  }

  // Create
  return Place.create(place)
}

/**
 * Get Structured Address data from Google Place Details API response
 *
 * @param {Array} address_components - from response
 * @returns {Object<city, country>} - country is two letter ISO code
 */
function addressFrom (address_components) {
  if (!hasListValue(address_components)) return {}
  let city
  let {'short_name': country} = address_components.find(a => isInList(a.types, 'country')) || {}
  country = toUpperCase(country)
  switch (country) {
    case 'SE':
    case 'UK':
      city = address_components.find(a => isInList(a.types, 'postal_town')) || {}
      break
    default:
      city = address_components.find(a => isInList(a.types, 'locality')) || {}
  }
  city = city.short_name
  if (!city) city = (address_components.find(a => isInList(a.types, 'sublocality_level_1')) || {}).short_name
  return {city: toUpperCase(city), country: toUpperCase(country)}
}
