import { SET, stateAction } from '../../common/actions'
import { fetchResponseProcessing } from '../../common/api/utils/helpers'
import { LANGUAGE_BY } from '../../common/data'
import { call, put, selectState, spawn } from '../../common/saga/utils'
import { DEFAULT } from '../../common/variables'
import { NAME } from './constants'
import select from './selectors'

/**
 * ASYNC TASKS =================================================================
 * Actions Orchestration - for subscribing, managing and dispatching actions.
 * =============================================================================
 */

/**
 * All Tasks in this module get initiated here
 */
export default function * init () {
  yield spawn(setLanguageFlow)
}

/**
 * WATCH TASKS (Action Subscriptions) ------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * PERPETUAL TASKS (Action Initialisations) ------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * FLOW TASKS (Action Management) ----------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Set Language base on User Country if no language preference has been set
 */
function * setLanguageFlow () {
  const language = yield selectState(select.language)
  if (language) return
  let country = yield call(getUserCountry)
  if (!country || typeof country !== 'string' || country.length > 3) return
  country = country.toUpperCase()
  yield put(stateAction(NAME, SET, {country, language: LANGUAGE_BY[country] || DEFAULT.LANGUAGE}))
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Request User Country via external API if no Country has been set
 */
function * getUserCountry () {
  const result = yield selectState(select.country)
  if (result) return result
  const response = yield call(fetch, '//ip-api.com/json')
  const info = yield call(fetchResponseProcessing, response)
  const {countryCode: country} = info || {}
  return country
}
