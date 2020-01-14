import fake from 'faker'
import { stateAction } from '../../common/actions'
import { SET } from '../../common/constants'
import createStore from '../../common/redux/createStore'
import { MOCK } from '../../common/variables'
import { NAME } from '../constants'
import reducer from '../reducers'

/**
 * MOCK STORE DATA =============================================================
 * =============================================================================
 */

export function mockStore (...args) {
  fake.seed(MOCK.DATA_SEED)
  const store = createStore([{ NAME, reducer }, ...args])

  /* Populate with data */
  mockStore.dispatch(stateAction(NAME, SET, {}, {}))

  return store
}

export default mockStore
