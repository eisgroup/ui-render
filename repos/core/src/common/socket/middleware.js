import { stringify } from 'querystring'
import { CLOSE, CONNECTED, DISCONNECTED, ERROR, MESSAGE } from '../constants'
import { isEqual } from '../utils'
import Connection from './_Connection'
import { createAction } from './actions'
import { SOCKET_CALL, SOCKET_CLOSE_EVENT } from './constants'

// =============================================================================
// SOCKET MIDDLEWARE
// =============================================================================

/**
 * Create Socket Middleware
 *
 * @example:
 *    createSocketMiddleware({
 *      endpoint: 'wss://example.com'  // socket to connect on startup
 *    })
 *
 * @param {Object} config - socket settings
 * @return {function(*=)} - middleware for use in Redux createStore()
 */
export function createSocketMiddleware (config = {}) {
  return store => {
    const middleware = new SocketMiddleware(store, config)
    return next => action => {
      if (typeof action[SOCKET_CALL] === 'undefined') return next(action)
      middleware.call(action)
    }
  }
}

export class SocketMiddleware {
  constructor (store, config = {}) {
    this.store = store
    this.config = config
    this.sockets = {}

    /* Add Default Endpoint */
    if (this.config.endpoint) this.add(this.config.endpoint)
  }

  /**
   * Get/Create/Close Socket Connection for given Endpoint and Send Message
   */
  call (action) {
    action = action[SOCKET_CALL]
    const { payload, meta: { socket, params } = {} } = action
    if (payload === CLOSE) {
      if (params) {
        /* Close specific Socket with given params */
        this.close(socket, params)
      } else {
        /* Close all Sockets for the endpoint when no params given */
        this.close(socket)
      }
    } else {
      /* Create new connection if parameters change */
      let connection = this.get(socket, params)
      if (!connection || !isEqual(connection.params, params)) connection = this.add(action)
      connection.send(payload)
    }
  }

  /**
   * Create Socket Connection
   *
   * @param {Object} action - Flux Standard Action
   * @return {Connection} - socket instance for given endpoint
   */
  add (action) {
    /* Store Connection with parameter as identifiers */
    const { meta: { socket, params } = {} } = action
    const connectionId = endpointWithParams(socket, params)
    this.sockets[connectionId] = new Connection(socket, params, this.config)
      .subscribe({
        onOpen: (event) => {
          this.store.dispatch(createAction(action, CONNECTED, event))
        },
        onClose: (event) => {
          this.store.dispatch(createAction(action, DISCONNECTED, event))
        },
        onError: (error) => {
          this.store.dispatch(createAction(action, ERROR, error))
        },
        onMessage: (data) => {
          this.store.dispatch(createAction(action, MESSAGE, data))
        }
      })

    return this.sockets[connectionId]
  }

  /**
   * Get Socket Connection
   *
   * @return {Connection} - socket instance for given endpoint and parameters
   */
  get (endpoint, params) {
    return this.sockets[endpointWithParams(endpoint, params)]
  }

  /**
   * Close Socket Connection/s
   */
  close (endpoint, params) {
    if (params) {
      /* Close specific Connection with given Parameters */
      const id = endpointWithParams(endpoint, params)
      const connection = this.sockets[id]
      if (connection) {
        connection.close(...SOCKET_CLOSE_EVENT)
        delete this.sockets[id]
      }
    } else {
      /* Close All Connections for given Endpoint */
      Object.keys(this.sockets)
        .filter(id => id.split('#')[0] === endpoint)
        .forEach(id => {
          this.sockets[id].close(...SOCKET_CLOSE_EVENT)
          delete this.sockets[id]
        })
    }
  }
}

/**
 * Add params to Endpoint and return Endpoint with query string added as #
 *
 * @param {string} endpoint - to add query string to
 * @param {Object|string} [params] - to turn into query string
 * @return {string} - endpoint with params as query string added
 */
export function endpointWithParams (endpoint, params = '') {
  return endpoint + (endpoint.indexOf('#') >= 0 ? '&' : '#') +
    (params.constructor === Object ? stringify(params) : params)
}
