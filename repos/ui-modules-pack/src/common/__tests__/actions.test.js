import { ALL_ACTIONS, ALL_RESULTS, CANCEL, ERROR, GET, RECEIVED, SUCCESS, TIMEOUT, WORKER } from 'ui-utils-pack'
import { actionFromType, isError, stateAction, stateActionType, subscribeToResults } from '../../redux/actions'
import createStore from '../../redux/createStore'
import { call } from '../../saga/utils'
import common from '../index'

test(`${isError.name}() returns true when action.type ends with ${ERROR}`, () => {
  expect(isError(stateAction(WORKER, ERROR))).toBe(true)
  expect(isError(stateAction(WORKER, SUCCESS))).toBe(false)
})

test(`${actionFromType.name}() extracts ACTION constant from type`, () => {
  expect(actionFromType(stateActionType(WORKER, GET))).toBe(GET)
  expect(actionFromType(stateActionType(WORKER, ERROR))).toBe(ERROR)
  expect(actionFromType(stateActionType(WORKER, GET, ERROR))).toBe(GET)
})

describe(`${stateAction.name}() returns correct Action objects`, () => {
  const payload = {id: 7}
  const meta = {type: 'test'}

  ALL_ACTIONS.forEach((ACTION) => {
    it(`works for Case 1: All arguments given`, () => {
      ALL_RESULTS.forEach((RESULT) => {
        const action = stateAction('TEST', ACTION, RESULT, payload, meta)
        expect(action.type).toEqual(stateActionType('TEST', ACTION, RESULT))
        expect(action.payload).toEqual(payload)
        expect(action.meta).toEqual(meta)
      })
    })

    it(`works for Case 2: '${ACTION}' given, but no 'RESULT'`, () => {
      const action = stateAction('TEST', ACTION, payload, meta)
      expect(action.type).toEqual(stateActionType('TEST', ACTION))
      expect(action.payload).toEqual(payload)
      expect(action.meta).toEqual(meta)
    })
  })

  ALL_RESULTS.forEach((RESULT) => {
    it(`works for Case 3: 'ACTION' not given, but '${RESULT}' given`, () => {
      const action = stateAction('TEST', RESULT, payload, meta)
      expect(action.type).toEqual(stateActionType('TEST', RESULT))
      expect(action.payload).toEqual(payload)
      expect(action.meta).toEqual(meta)
    })
  })

  it(`works for Case 4: 'ACTION' and 'RESULT' not given`, () => {
    const action = stateAction('TEST', payload, meta)
    expect(action.type).toEqual(stateActionType('TEST'))
    expect(action.payload).toEqual(payload)
    expect(action.meta).toEqual(meta)
  })
})

describe(`${subscribeToResults.name}() triggers on matching Actions`, () => {
  const expected = {action: {}}
  const meta = {id: 7}
  const store = createStore(common.concat({saga}))

  function * saga () {
    while (true) {
      expected.action = yield call(subscribeToResults, WORKER, GET, meta)
    }
  }

  function testAction (RESULT) {
    it(`returns meta.result '${RESULT}' when matching action dispatched`, () => {
      expected.action = {}
      store.dispatch(stateAction(WORKER, GET))
      expect(expected.action).toEqual({})
      store.dispatch(stateAction(WORKER, GET, RESULT))
      expect(expected.action).toEqual({})
      RESULT === RECEIVED && store.dispatch(stateAction(WORKER, GET, null, meta))
      RESULT !== RECEIVED && store.dispatch(stateAction(WORKER, GET, RESULT, null, meta))
      expect(expected.action).toHaveProperty('payload')
      expect(expected.action).toHaveProperty('meta')
      expect(expected.action.meta).toHaveProperty('result')
      expect(expected.action.meta.result).toEqual(RESULT)
    })
  }

  testAction(RECEIVED)
  testAction(SUCCESS)
  testAction(ERROR)
  testAction(CANCEL)
  testAction(TIMEOUT)
  // VOID case: at the time of writing redux-saga 'delay' effect does not work with 'lolex' forward timer
})
