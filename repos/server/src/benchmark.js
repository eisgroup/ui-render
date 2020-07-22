import { apiAction } from 'core/src/common/api/actions'
import { GET } from 'core/src/common/constants'
import { bench } from 'core/src/common/utils'
import { API_TEST_URL } from 'core/src/common/variables'
import User from 'modules-pack/user/models'
import store from './store'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

/**
 * ACTIONS ---------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
/* ~ (0.750 ms with 2 loops) 0.150 ms per action run in Node.js with 1,000 iterations */
bench.skip({name: 'server', type: 'action', loop: 2}, store.dispatch, {type: 'test', payload: {id: 7}, meta: {}})

/* ~ 0.250 ms per action run in Node.js with 20 iterations */
bench.skip({name: 'server', type: 'apiAction', loop: 20}, store.dispatch, apiAction(API_TEST_URL, GET))

/**
 * SELECTORS -------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
// bench.skip({name: 'symbolsInCommonWithExchanges', type: 'selector', log: 'length'},
//   selectExchange.symbolsInCommonWithExchanges, state)

/**
 * SAGAS -----------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
// benchA.skip({name: sagaFlow.name, log: 'payload'}, runTask, sagaFlow)

/**
 * MODELS ---------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
bench.skip(
  {name: 'User.findById', type: 'model', loop: 10000},
  async (id) => await User.findById(id),
  '5a6e8ce162e9430ce72f65c3'
)
