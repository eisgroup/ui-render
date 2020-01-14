import moment from 'moment'
import { __IOS__ } from '../../../variables'

/**
 * Get User Location
 *
 * @example:
 - in Saga:
 const location = yield call(getLocation)
 - elsewhere:
 async () => console.log(await getLocation())
 *
 * @return {Object} Promise whether location retrieval is successful or rejected
 */
export function getLocation () {
  return new Promise((resolve, reject) => {
    const options = [
      (location) => resolve({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        updated: moment().clone()  // -> timestamp is very unreliable, use moment()
      }),

      (error) => reject(error)
    ]

    if (__IOS__) {
      options.push({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      })
    }

    navigator.geolocation.getCurrentPosition(...options)
  })
}
