import { runTask } from 'modules-pack/saga/utils'
import { fetchFlow } from './utils'

/**
 * FETCH API WRAPPER ===========================================================
 * =============================================================================
 */

/**
 * Wrapper for fetch request with identical interface to Fetch API,
 * but using redux actions (via the `core/src/common/api` module).
 * This makes it easy to debug because requests are logged to console (if `core/src/common/logger` module is enabled).
 * @example:
 *    const {payload = {}, meta: {result} = {}} = await fetch(url, {params: {q: 'query'}})
 *
 * @param {String} url - to fetch
 * @param {String} [method] - RESTFul fetch method ['GET', 'POST', 'PATCH', 'DELETE'], default is 'GET'
 * @param {Object} [body] - payload to send with request
 * @param {Object} [params] - query string to append to url
 * @param {Object} [meta] - additional metadata to attach to the request
 * @returns {Promise<{payload, meta}>} action - result is always a Flux Standard Action with `meta.result`
 */
export default function fetch (url, {method, body, params, ...meta} = {}) {
  return runTask(fetchFlow, {url, method, payload: {body, params}, meta})
}
