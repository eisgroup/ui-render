import { SevenBoom as Response } from 'graphql-apollo-errors'
import { toJSON } from 'ui-utils-pack'
import Place from './models'

/**
 * VALIDATION HELPERS ==========================================================
 * =============================================================================
 */

/**
 * Validate if Payload has correct PlaceInput, and if it is, mutate Payload to have Place ID
 * @example:
 *    const error = await placeInputValidate(payload) // validate and mutate .place input to be ID
 *    if (error) return error
 *
 * @param {Object<place<id>>} payload - to check and mutate if necessary
 * @returns {Object<Error>|Undefined} error - if validation failed, else undefined if validation passed
 */
export async function placeInputValidate (payload) {
  if (payload.place) {
    try {
      const place = await Place.getOrCreate(payload.place)
      if (!(place instanceof Place)) { // noinspection ExceptionCaughtLocallyJS
        throw new Error(toJSON(place))
      }
      payload.place = place.id
    } catch (error) {
      return Response.badRequest(`Invalid place.id ${payload.place.id}, got ${error}`)
    }
  }
}
