import { fromJSON } from 'ui-utils-pack'

/**
 * API HELPERS =================================================================
 * =============================================================================
 */

/**
 * Process Fetch Response
 * @example:
 *  const promiseResult = fetch(url).then(fetchResponseProcessing)
 *
 * @param {Object} response - from chained fetch().then((response) => {...})
 * @returns {*} - JSON object on success, or rejected Promise with Error object
 */
export function fetchResponseProcessing (response) {
  /* Successful response */
  if (response.ok) return response.json()
  return response.text().then((data) => Promise.reject(fromJSON(data)))
}
