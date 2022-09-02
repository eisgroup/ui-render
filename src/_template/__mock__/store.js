import fake from 'faker'
import { createStore, stateAction } from 'modules-pack/redux'
import { MOCK } from 'modules-pack/variables'
import { SET } from 'ui-utils-pack'
import { _TEMPLATE } from '../constants'
import reducer from '../reducers'

/**
 * MOCK STORE DATA =============================================================
 * =============================================================================
 */

export function mockStore (...args) {
  fake.seed(MOCK.DATA_SEED)
  const store = createStore([{_TEMPLATE, reducer}, ...args])

  /* Populate with data */
  mockStore.dispatch(stateAction(_TEMPLATE, SET, {}, {}))

  return store
}

export default mockStore
