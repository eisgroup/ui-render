import { toJSON } from '../../utils'

/**
 * Mock Fetch Response
 *
 * @example:
 * ```
 *  mockFetchResponse({id: 777});  // -> mock successful fetch response with HTTP 200 Ok status
 *  mockFetchResponse(new Error('Network request failed'));  // -> mock failed to fetch request
 * ```
 * @param {Object|Error|TypeError} response - body or Error object
 * @param {Number} [status] - HTTP response status, default is 200
 * @param {Object} [headers] - response Headers, by default has { `Content-type`: `application/json` }
 * @returns {void}
 */
export default function mockFetchResponse (response, status = 200, headers = {}) {
  const format = headers['Content-type'] || 'application/json'
  if (response instanceof Error || response instanceof TypeError) {
    window.fetch = jest.fn().mockImplementation(() => Promise.reject(response))
  } else {
    const fetchResponse = new window.Response(
      (format === 'application/json') ? toJSON(response) : response,
      {
        status,
        headers: {
          'Content-type': format,
          ...headers
        }
      }
    )

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(fetchResponse))
  }
}
