import axios from 'axios' // 'axios' adds 13 KB to final js bundle size
import { cloneDeep, isNil, omitBy, startsWith } from 'lodash'
import { stateAction } from 'ui-modules-pack/redux/actions'
import qs from 'querystring'
import {
  ERROR,
  firstListValue,
  fromJSON,
  isFunction,
  isInString,
  isInStringAny,
  LOGOUT,
  REQUEST,
  SUCCESS,
  TIMEOUT,
  toJSON
} from 'ui-utils-pack'
import { createAction } from './actions'
import {
  ADD_ACTIONS_PENDING_AUTH,
  ADD_ACTIONS_PENDING_LOCATION,
  ADD_ACTIONS_PENDING_NETWORK,
  API,
  API_CALL,
  HTTP_401_UNAUTHORIZED,
  NETWORK,
  NETWORK_ERROR_MESSAGES,
  REQUEST_TIMEOUT,
} from './constants'
import { hasAuthActivated, hasLocationActivated } from './data' // import { auth, location } from './modules'
// import { auth, location } from './modules'
const auth = {}
const location = {}

/**
 * MIDDLEWARE ENHANCER =========================================================
 * Interceptors to preprocess actions dispatched by the store
 * =============================================================================
 */

// const httpsAgent = new (require('https')).Agent({keepAlive: true}) // comment out if used in browser only
const httpsAgent = undefined  // comment out if used in node.js
const useFetch = typeof axios === 'undefined'
const hasFetch = typeof fetch !== 'undefined'

/**
 * Api Middleware Class to Handle All Fetch Actions
 *
 * @FEATURES:
 *  - Auto-retrieve API Token and include in request headers if required
 *  - dispatch action to store actionsPendingAuth:
 *      a) if Token required but does not exist
 *      b) if fetch response status is HTTP_401_UNAUTHORIZED
 *  - dispatch action to store actionsPendingLocation if missing Location access
 *  - dispatch action to store actionsPendingNetwork if network connection fails
 *
 * @USAGE:
 *  - takes Flux Standard Action {type, payload, meta, [error]}
 *  - defaults to GET method if not defined in {payload}
 *  - authentication can be enabled with {meta: {authenticate: true}}
 *
 * @OPTIONS:
 * ```
 *    const examplePostAction = () => ({
 *      [API_CALL]: {
 *        type: ENDPOINT_POST_ACTION,  // -> computed action type from apiAction() creator
 *        payload: {
 *          id: 7,  // will be inserted to url automatically
 *          url: 'http://localhost/bar/7/foo',  // if provided will override dynamically generated url
 *          body: {  // payload body
 *            key: value,  // will be automatically serialized according to `Content-Type`
 *          },
 *          params: {  // parameters object that will be converted to query string by the apiMiddleware
 *            limit: 5,
 *            order_by: desc,
 *          },
 *        },
 *        meta: {
 *          url: {[PLACEHOLDER]: 'value'},  // placeholder values to be interpolated into request url
 *          authenticate: false,  // default - send requests without API Token
 *          credentials: 'same-origin',  // automatically send cookies for current domain
 *          headers: {
 *            'Content-Type': 'application/json',  // default
 *          },
 *          location: false,  // if true, request User's location (lat and lng coordinates), then add to query
 *          method: 'POST',  // if provided, will override fetch method created by apiAction()
 *          responseHandler: (response) => {},  // default is undefined - callback after response resolves
 *          related: ['ormModel'],  // list of related ORM Models to fetch (to be handled by Sagas)
 *          callRequest: false,  // if true, dispatch REQUEST action, default is false
 *          callError: true,  // if false, will not dispatch ERROR action, default is true
 *          timeout: 30000,  // milliseconds, default is REQUEST_TIMEOUT, will dispatch CANCEL action
 *        }
 *      }
 *    })
 * ```
 */
export class ApiMiddleware {
  configDefault = {
    addTokenToRequest: (token) => ({
      Authorization: `Bearer ${token}`  // -> override token from pending action resume
    }),
    headers: {
      // 'Accept': 'application/json', // axios auto adds correct header
      // To avoid calling OPTIONS, thus creating CORS problems, use 'application/x-www-form-urlencoded'
      // https://stackoverflow.com/questions/25727306/request-header-field-access-control-allow-headers-is-not-allowed-by-access-contr
      // 'Content-Type': 'application/x-www-form-urlencoded',
      // 'Content-Type': 'application/json', // do not specify header by default to avoid CORS problem
      // Keep-Alive header is only allowed using Fetch
      // ...useFetch && hasFetch && {'Keep-Alive': `timeout=${REQUEST_TIMEOUT}, max=1000`},
    },
    // credentials: 'include', // only works using Fetch
    REQUEST_TIMEOUT
  }

  constructor (action, store, config = {}) {
    this.action = action  // Clone deep at implementation, to prevent mutation, without overhead
    this.apiAction = action[API_CALL]
    this.meta = this.apiAction.meta
    this.meta.request = {}
    this.store = store
    this.afterRequest = config.afterRequest
    this.afterResponse = config.afterResponse
    this.onError = config.onError
    this.onTimeout = config.onTimeout
    this.isFetch = hasFetch && (config.useFetch != null ? config.useFetch : useFetch)
    this.addTokenToRequest = config.addTokenToRequest || this.configDefault.addTokenToRequest
    this.REQUEST_TIMEOUT = this.meta.timeout || config.REQUEST_TIMEOUT || this.configDefault.REQUEST_TIMEOUT
  }

  get token () {
    if (!hasAuthActivated) throw new Error(`Please enable '${auth.NAME}' module for API token feature`)
    return auth.select.token(this.store.getState())
  }

  get shouldGetNewToken () {
    return (this.shouldAuthenticate && !this.token)
  }

  get shouldAuthenticate () {
    return this.meta.authenticate
  }

  get location () {
    if (!hasLocationActivated) throw new Error(`Please enable '${location.NAME}' module for API location feature`)
    return location.select.geoJSON(this.store.getState())
  }

  get shouldGetNewLocation () {
    // Location is required
    if (this.meta.location) {
      const {updated} = this.location
      return !(updated && ((Date.now() - updated) <= location.constants.LOCATION_LIFESPAN))
    }
    return false
  }

  call () {
    /* Token Expired / Does Not Exist */
    if (hasAuthActivated && this.shouldGetNewToken) {
      this.pendingAuth()
    }  // eslint-disable-line

    /* Location Expired / Does Not Exist */
    else if (hasLocationActivated && this.shouldGetNewLocation) {
      this.pendingLocation()
    }  // eslint-disable-line

    /* API Request */
    else {
      this.apiCall(this.apiAction, this.shouldAuthenticate && this.token)
    }
  }

  // REQUEST PROCESSING ----------------------------------------------------------
  // -----------------------------------------------------------------------------

  /* Single API request */
  apiCall (token = null) {
    const args = this.requestArgs(this.apiAction.payload, this.meta, token)
    const {responseHandler} = this.meta
    const responseProcessing = (this.isFetch ? this.responseProcessFetch : this.responseProcessAxios).bind(this)
    const timeout = this._setTimeout(this.apiAction)  // must be just before request call
    ;(this.isFetch ? fetch : axios.request)(...args)
      .then(response => {
        this._logTime('end')
        clearTimeout(timeout)
        return response
      })
      .then(responseHandler)  // if .responseHandler() provided in meta
      .then(responseProcessing)
      .then(this.requestComplete)  // Dispatch SUCCESS action with response as payload
      .catch(error => {
        this._logTime('end')
        clearTimeout(timeout)
        return this.requestError(error)
      })
    this._afterRequest()
    if (this.meta.callRequest) this.dispatch(createAction(this.apiAction, REQUEST))
  }

  /* Parse Action payload and meta for request arguments */
  requestArgs (payload, meta, token = null) {
    const {authenticate, location, credentials} = meta
    let {headers = {}, method = 'GET'} = meta
    let {url, body, params} = payload
    let data = body

    // Set Headers
    headers = {
      ...this.configDefault.headers,
      ...token && authenticate && this.addTokenToRequest(token),
      ...headers
    }

    // For form upload, let it detect content type automatically and add proper string
    if (headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type']
    }

    // Add location to query string or body payload
    if (location && hasLocationActivated) {
      if (method === 'GET') {
        if (params && params.constructor !== Object) {
          throw new Error(`${API} ${location.NAME} expects 'params' to be an Object, got '${typeof params}'`)
        }
        params = {...params, ...this.location}
      } else {
        if (body && body.constructor !== Object) {
          throw new Error(`${API} ${location.NAME} expects 'body' to be an Object, got '${typeof body}'`)
        }
        body = {...body, ...this.location}
      }
    }

    // Serialize request body if necessary
    if (body && body.constructor === Object) {
      if (!headers['Content-Type'] || headers['Content-Type'] === 'application/json') {
        data = toJSON(body)
      } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        data = qs.stringify(body)
      }
    }

    // Add parameters to endpoint
    // Note: original payload.url cannot be mutated for resume actions
    payload.endpoint = params ? urlWithParams(url, params) : url

    // Update ACTION meta data
    this.meta.headers = headers
    this.meta.request.url = url
    if (params) this.meta.request.params = params
    if (body) this.meta.request.body = body

    return [
      payload.endpoint,
      omitBy({
        method,
        [this.isFetch ? 'body' : 'data']: data,
        credentials,
        headers,
        httpsAgent,
        timeout: this.REQUEST_TIMEOUT
      }, isNil)  // remove null/undefined
    ]
  }

  /* Parse Response from `fetch` */
  responseProcessFetch (response) {
    this._setHeaders(response)
    const {contentType} = this.meta.headers
    if (
      !contentType ||
      startsWith(contentType, 'application/json') ||
      startsWith(contentType, 'text/html') ||
      startsWith(contentType, 'text/javascript')
    ) return response.json()
    return response
  }

  /* Parse Response from `axios` */
  responseProcessAxios (response) {
    this._setHeaders(response)

    // Deserialize JSON string if 'Content-Type'
    // a) is not specified
    // c) starts with 'text/html'
    // d) starts with 'text/javascript'
    const {contentType} = this.meta.headers
    if (
      response.data.constructor === String &&
      (
        !contentType ||
        startsWith(contentType, 'text/html') ||
        startsWith(contentType, 'text/javascript')
      )
    ) return fromJSON(response.data)
    return response.data
  }

  // LOGGING ---------------------------------------------------------------------
  // -----------------------------------------------------------------------------

  /* Called just before REQUEST */
  _setTimeout (action) {  // Return timeout separately to enable multiple request timeouts
    this._logTime('start')
    return setTimeout(() => {
      // Note: dispatching CANCEL action is for UI only,
      // because if 'fetch' used it will continue to resolve since 'fetch cannot be canceled.
      // So do not add action to pending, because it may resolve after.
      // If using 'axios' with 'http', request will be canceled after given timeout.
      this._logTime('end')
      this.requestTimeout(action)
    }, this.REQUEST_TIMEOUT)
  }

  /* Called after RESPONSE */
  _setHeaders (response) {
    let contentType, token
    if (this.isFetch) {
      contentType = response.headers.get('Content-Type')
      token = response.headers.get('Authorization')
    } else {
      const {headers: {'content-type': c, 'authorization': t} = {}} = response
      contentType = c
      token = t
    }

    this.meta.headers = {
      contentType,
      ...token && {token: token.replace('Bearer ', '')}
    }
  }

  /* Add Performance Stats to API Action Meta data */
  _logTime (type) {
    if (type === 'start') {
      this.meta.request.start = Date.now()
    }
    if (type === 'end') {
      const end = Date.now()
      this.meta.request.end = end
      this.meta.request.latency = end - this.meta.request.start
    }
  }

  /* Fire Config Callback (immediately after firing API request, but before response) */
  _afterRequest () {
    if (isFunction(this.afterRequest)) this.afterRequest(this.apiAction)
  }

  /* Fire Config Callback (just after dispatching API response action of any kind) */
  _afterResponse (action) {
    if (isFunction(this.afterResponse)) this.afterResponse(action)
  }

  /* Fire Config Callback */
  _onError (error) {
    if (isFunction(this.onError)) this.onError(this.apiAction, error)
  }

  /* Fire Config Callback */
  _onTimeout () {
    if (isFunction(this.onTimeout)) this.onTimeout(this.apiAction)
  }

  // REDUX ACTION DISPATCHES -----------------------------------------------------
  // -----------------------------------------------------------------------------

  requestComplete = (response) => {
    this.dispatch(createAction({...this.apiAction, payload: response}, SUCCESS))
  }

  requestError (error) {
    if (this.meta.callError === false) return  // Terminate early
    this._onError(error)
    let payload = error

    /* The request was made and the server responded with a status code that falls out of the range of 2xx */
    if (error.response) {
      this._setHeaders(error.response)
      const {data = {}} = error.response
      switch (data.constructor) {
        case Object:
          payload = data
          break
        case Array:
          payload = {errors: data}
          break
        case String:
          const isHtml = isInString(data, '<!DOCTYPE html>')
          payload = {message: isHtml ? (firstListValue(data.match(/<h1>(.*)<\/h1>/i)) || '<!DOCTYPE html>...') : data}
          break
        default:
          payload = {message: data}
      }

      // Actions Pending Authentication
      if (error.response.status === HTTP_401_UNAUTHORIZED && hasAuthActivated) {
        this.pendingAuth()  // -> need to LOGOUT here because it's definitely invalid Token.
        payload.type = LOGOUT  // let Sagas handle LOGOUT dispatch
      }

      payload.status = error.response.status
    } // eslint-disable-line

    /* The request was made but no response was received */
    else if (error.request) {
      // Actions Pending Internet
      if (isInStringAny(error.message, ...NETWORK_ERROR_MESSAGES)) {
        return this.pendingNetwork(error)  // Terminate early -> dispatch NETWORK ERROR
      }
    }

    /* Dispatch API Call ERROR Action */
    this.dispatch(createAction({...this.apiAction, payload}, ERROR))
  }

  requestTimeout (action) {
    this._onTimeout()
    this.meta.callError = false  // -> prevent error from dispatching action later
    this.dispatch(createAction(action, TIMEOUT))
  }

  pendingAuth () {
    // Store action to resume when LOGIN SUCCESS
    this.dispatch(stateAction(ADD_ACTIONS_PENDING_AUTH, [cloneDeep(this.action)]))
  }

  pendingLocation () {
    // Store action to resume when LOCATION UPDATED
    this.dispatch(stateAction(ADD_ACTIONS_PENDING_LOCATION, [cloneDeep(this.action)]))
  }

  pendingNetwork (error) {
    // Store action to resume when NETWORK CONNECTED
    this.dispatch(stateAction(ADD_ACTIONS_PENDING_NETWORK, [cloneDeep(this.action)]))
    this.dispatch(stateAction(NETWORK, ERROR, error))
  }

  dispatch (action) {
    this.store.dispatch(action)
    this._afterResponse(action)
  }
}

/**
 * Create API Middleware to Register Actions dispatched using apiAction() from apiActions.js
 *
 * @example:
 api/index.js:
 ```
 import api from './common/api';
 import analytics from './common/analytics';
 ...
 middleware: createApiMiddleware({
    afterRequest: (apiAction) => {},  // -> callback to fire immediately after API request (before response)
    afterResponse: (apiAction) => {},  // -> callback to fire just after dispatching API response action
    onError: (apiAction, error) => {},  // -> do something with error
    onTimeout: (apiAction) => {},  // -> do something when request times out
    REQUEST_TIMEOUT: 20000,  // -> set default timeout to be 20 seconds
    useFetch: true,  // -> whether to use fetch for requesting API
    addTokenToRequest: (headers, token) => ({
      ...headers,
      Authorization: `Token ${token}`,  // -> default Authorization headers is `Bearer ...`
    }),
  })
 ```
 * @param {Object} config - default api configurations
 * @returns {function(*=): function(*): function(*=)}
 */
export function createApiMiddleware (config = {}) {
  return store => next => action => {
    if (typeof action[API_CALL] === 'undefined') return next(action)
    const middleware = new ApiMiddleware(action, store, config)

    // /* React Native */
    // /* Abort API CALL when APP is not Active */
    // if (AppState.currentState !== 'active') {
    //   setTimeout(() => {  // try one more time 7 seconds later in case it was transitioning
    //     if (AppState.currentState !== 'active') {
    //       return log(`${API_CALL} -> Aborted because AppState is`, 'color: Red', AppState.currentState);
    //     } else {
    //       apiMiddleware.call();
    //     }
    //   }, 7000);
    //   return;
    // }

    middleware.call()
  }
}

/**
 * Add params to URL and return URL with query string added
 *
 * @param {string} url - to add query string to
 * @param {Object|string} params - to turn into query string
 * @return {string} - url with params as query string added
 */
export function urlWithParams (url, params) {
  const questionIndex = url.indexOf('?')
  const prefix = (questionIndex > -1 ? (questionIndex === url.length - 1 ? '' : '&') : '?')
  return url + prefix + (params.constructor === Object ? qs.stringify(params) : params)
}

export default createApiMiddleware()
