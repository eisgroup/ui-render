/**
 * Async validator functions
 */

/**
 * Details used by the async validation saga to handle the async validation
 *
 * @typedef {Object} AsyncValidatorDescriptor
 * @property {string} url - The API validator endpoint
 * @property {Object} payload - Any extra data to send to the endpoint
 * @property {string} validateFailMessage - A message to show user if validation doesn't pass
 * @property {string} [field] - The field the validation is being performed on
 */

/**
 * Creates a descriptor used by the form sagas to handle the async validation
 *
 * @example
 *  asyncValidatorDescriptor({
 *    url: URL_VALIDATE_NAME,
 *    payload: {
 *      type: 'ether',
 *      name: 'crystal',
 *    },
 *    validateFailMessage: 'Invalid celestial name',
 *  })
 *
 * @param {string} url - The API validator endpoint
 * @param {Object} payload - Any extra data to send to the endpoint
 * @param {string} validateFailMessage - A message to show user if validation doesn't pass
 * @returns {AsyncValidatorDescriptor} - Details used by the async validation
 * saga to handle the async validation
 */
function asyncValidatorDescriptor ({url, payload, validateFailMessage}) {  // eslint-disable-line
  return {url, payload, validateFailMessage}
}
