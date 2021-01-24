/**
 * @jest-environment jsdom
 */
// (until figure out how to mock API timeout in Node.js)
import request from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { stateActionType } from 'modules-pack/redux/actions'
import { URL } from 'modules-pack/variables'
import { CREATE, DELETE, ERROR, GET, isFunction, isList, LIST, REQUEST, SUCCESS, TIMEOUT, toJSON } from 'utils-pack'
import mockStore from '../__mocks__/store'
import { apiActionTest, apiActionType } from '../actions'
import { ADD_ACTIONS_PENDING_NETWORK, API, NETWORK, NETWORK_ERROR_MESSAGES, } from '../constants'
import { urlWithParams } from '../middleware'

const mock = new MockAdapter(request)

describe(`${API} middleware`, () => {
  function testSuccessResponse
  ({serializer = null, payload = null, ACTION = GET, response = {id: 777}, status = 200, headers = {}}) {
    const initState = {}
    const store = mockStore(initState)
    const finalUrl = (payload && payload.params) ? urlWithParams(URL.API_TEST, payload.params) : URL.API_TEST
    mock.reset()
    mock.onAny(finalUrl).reply(
      status,
      isFunction(serializer) ? serializer(response) : response,
      headers
    )

    /* Verify REQUEST and SUCCESS actions were dispatched with correct payload */
    return store.dispatch(apiActionTest(URL.API_TEST, ACTION, payload, {authenticate: false, callRequest: true}))
      .then(() => {
        const calledActions = store.getActions()
        expect(calledActions.length).toBe(2)
        expect(calledActions[0].type).toEqual(apiActionType(URL.API_TEST, ACTION, REQUEST))
        expect(calledActions[0].payload.endpoint).toEqual(finalUrl)
        expect(calledActions[1].type).toEqual(apiActionType(URL.API_TEST, ACTION, SUCCESS))
        expect(calledActions[1].payload).toEqual(response)
      })
  }

  function testErrorResponse
  ({status, response, message = null, serializer = null, payload = null, ACTION = GET, headers = {}}) {
    const initState = {}
    const store = mockStore(initState)
    const finalUrl = (payload && payload.params) ? urlWithParams(URL.API_TEST, payload.params) : URL.API_TEST
    mock.reset()
    mock.onAny(finalUrl).reply(
      status,
      isFunction(serializer) ? serializer(response) : response,
      headers
    )

    /* Verify Error action */
    return store.dispatch(apiActionTest(URL.API_TEST, ACTION, payload, {authenticate: false}))
      .then(() => {
        const calledActions = store.getActions()
        expect(calledActions.length).toBe(1)
        expect(calledActions[0].type).toEqual(apiActionType(URL.API_TEST, ACTION, ERROR))
        status !== 200 && expect(calledActions[0].payload.status).toEqual(status)
        if (isList(response)) {
          expect(calledActions[0].payload.errors).toEqual(response)
        } else {
          expect(calledActions[0].payload.message).toEqual(message || response)
        }
      })
  }

  it(`${GET} without payload calls REQUEST and SUCCESS actions when response is JSON`, () => {
    return testSuccessResponse({ACTION: GET, serializer: toJSON})
  })
  it(`${GET} with params calls REQUEST and SUCCESS actions when response is JSON`, () => {
    return testSuccessResponse({ACTION: GET, serializer: toJSON, payload: {params: {limit: 7}}})
  })
  it(`${CREATE} with params and body calls REQUEST and SUCCESS actions on response`, () => {
    return testSuccessResponse({ACTION: CREATE, serializer: toJSON, payload: {params: {limit: 7}, body: {name: 'God'}}})
  })
  it(`${DELETE} with params and body calls REQUEST and SUCCESS actions on response`, () => {
    return testSuccessResponse({ACTION: CREATE, serializer: toJSON, payload: {params: {limit: 7}, body: {name: 'God'}}})
  })
  it(`${LIST} with params and body calls REQUEST and SUCCESS actions on response`, () => {
    return testSuccessResponse({ACTION: CREATE, serializer: toJSON, payload: {params: {limit: 7}, body: {name: 'God'}}})
  })
  it(`${GET} with JSON response and missing content type returns correct deserialized payload`, () => {
    return testSuccessResponse({ACTION: GET, serializer: toJSON})
  })
  it(`${GET} with JSON response content type of 'text/html' returns correct deserialized payload`, () => {
    return testSuccessResponse({ACTION: GET, serializer: toJSON, headers: {'content-type': 'text/html'}})
  })
  it(`${GET} with JSON response content type of 'text/javascript' returns correct deserialized payload`, () => {
    return testSuccessResponse({ACTION: GET, serializer: toJSON, headers: {'content-type': 'text/javascript'}})
  })
  it('returns meta data with headers and request data for successful response with params', () => {
    const initState = {}
    const store = mockStore(initState)
    const params = {limit: 2}
    const response = {id: 777}
    const responseFormat = 'application/json'
    mock.reset()
    mock.onAny(urlWithParams(URL.API_TEST, params)).reply(
      200,
      toJSON(response),
      {'content-type': responseFormat}
    )

    /* Verify response Headers and Request stats returned */
    return store.dispatch(apiActionTest(URL.API_TEST, GET, {params}, {authenticate: false}))
      .then(() => {
        const calledActions = store.getActions()
        expect(calledActions.length).toBe(1)
        expect(calledActions[0].type).toEqual(apiActionType(URL.API_TEST, GET, SUCCESS))
        expect(calledActions[0].meta).toHaveProperty('headers')
        expect(calledActions[0].meta.headers).toHaveProperty('contentType')
        expect(calledActions[0].meta.headers.contentType).toEqual(responseFormat)
        expect(calledActions[0].meta).toHaveProperty('request')
        expect(calledActions[0].meta.request).toHaveProperty('url')
        expect(calledActions[0].meta.request.url).toEqual(URL.API_TEST)
        expect(calledActions[0].meta.request).toHaveProperty('params')
        expect(calledActions[0].meta.request.params).toEqual(params)
        expect(calledActions[0].meta.request).toHaveProperty('start')
        expect(calledActions[0].meta.request).toHaveProperty('end')
        expect(calledActions[0].meta.request).toHaveProperty('latency')
      })
  })
  it('calls API -> ERROR for status 100 NUMBER response', () => {
    return testErrorResponse({status: 100, response: 1})
  })
  it('calls API -> ERROR for status 200 Error response', () => {
    const message = 'request failed'
    return testErrorResponse({status: 200, response: Promise.reject(new Error(message)), message})
  })
  it('calls API -> ERROR for status 300 JSON response', () => {
    const message = 'Request failed with status code 300'
    const response = {id: 777, message}
    return testErrorResponse({status: 300, response, serializer: toJSON, message})
  })
  it('calls API -> ERROR for status 404 STRING response', () => {
    return testErrorResponse({status: 404, response: 'Request failed with status code 404'})
  })
  it('calls API -> ERROR for status 500 ARRAY response', () => {
    return testErrorResponse({status: 500, response: [{code: '111', message: 'Request failed with 500 error'}]})
  })
  it('calls API -> TIMEOUT for no responses', () => {
    const initState = {}
    const store = mockStore(initState)
    mock.reset()
    mock.onAny(URL.API_TEST).reply(() => new Promise((resolve) => setTimeout(() => resolve([200, {}]), 100)))

    /* Verify REQUEST and TIMEOUT actions are dispatched */
    return store.dispatch(apiActionTest(URL.API_TEST, GET, null, {timeout: 1, authenticate: false, callRequest: true}))
      .then(() => {
        const calledActions = store.getActions()
        expect(calledActions.length).toBe(2)
        expect(calledActions[0].type).toEqual(apiActionType(URL.API_TEST, GET, REQUEST))
        expect(calledActions[1].type).toEqual(apiActionType(URL.API_TEST, GET, TIMEOUT))
        expect(calledActions[1].meta.result).toEqual(TIMEOUT)
      })
  })
  it('calls NETWORK -> ERROR when connection fails', () => {
    const initState = {}
    const store = mockStore(initState)
    const error = new Error(NETWORK_ERROR_MESSAGES[0])
    error.request = {}  // simulate network error
    mock.reset()
    mock.onAny(URL.API_TEST).reply(200, Promise.reject(error))

    /* Verify REQUEST and ERROR actions are dispatched */
    return store.dispatch(apiActionTest(URL.API_TEST, GET, null, {authenticate: false, callRequest: true}))
      .then(() => {
        const calledActions = store.getActions()
        expect(calledActions.length).toBe(3)
        expect(calledActions[0].type).toEqual(apiActionType(URL.API_TEST, GET, REQUEST))
        expect(calledActions[1].type).toEqual(stateActionType(ADD_ACTIONS_PENDING_NETWORK))
        expect(calledActions[2].type).toEqual(stateActionType(NETWORK, ERROR))
        expect(calledActions[2].payload).toEqual(error)
      })
  })
})
