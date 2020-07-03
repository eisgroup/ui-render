import { isString, SET, toLowerCase } from 'utils-pack'
import { fetchResponseProcessing } from '../api/utils/helpers'
import { stateAction } from '../redux/actions'
import { call, put, selectState, spawn } from '../saga/utils'
import { DEFAULT } from '../variables'
import { LANGUAGE_CODE_BY_COUNTRY } from '../variables/data'
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
  const {country} = yield call(getUserGeolocation)
  if (!country || typeof country !== 'string' || country.length > 3) return
  yield put(stateAction(NAME, SET, {country, language: LANGUAGE_CODE_BY_COUNTRY[country] || DEFAULT.LANGUAGE}))
}

/**
 * HELPER TASKS (Action Dispatches) --------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Request User Geolocation via external API if no Country has been set
 */
function * getUserGeolocation () {
  const result = {}
  result.country = yield selectState(select.country)
  if (result.country) return result
  const response = yield call(fetch, 'https://ipapi.co/json')
  const info = yield call(fetchResponseProcessing, response)
  const {country_code: country, languages} = info || {}
  if (isString(country)) result.country = country.toUpperCase()
  if (isString(languages)) result.language = toLowerCase(languages).split(',').shift()
  return result
}
