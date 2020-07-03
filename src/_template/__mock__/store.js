import fake from 'faker'
import { createStore, stateAction } from 'modules-pack/redux'
import { MOCK } from 'modules-pack/variables'
import { SET } from 'utils-pack'
import { NAME } from '../constants'
import reducer from '../reducers'

/**
 * MOCK STORE DATA =============================================================
 * =============================================================================
 */

export function mockStore (...args) {
  fake.seed(MOCK.DATA_SEED)
  const store = createStore([{NAME, reducer}, ...args])

  /* Populate with data */
  mockStore.dispatch(stateAction(NAME, SET, {}, {}))

  return store
}

export default mockStore
