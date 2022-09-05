import { ONE_MINUTE } from 'ui-utils-pack'
import { REQUEST_TIMEOUT_BACKOFF_DURATION } from '../variables'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'LOGGER'
export const MAX_CONSOLE_RECORDS = 1000
export const MAX_ERROR_RECORDS = 100
export const MAX_LATENCY_RECORDS = 100  // API/Socket/Task
export const MAX_IDLE_DURATION = ONE_MINUTE  // for API/Socket Stats
export const MIN_IDLE_ALERT_DURATION = REQUEST_TIMEOUT_BACKOFF_DURATION
export const STATS = 'STATS'
export const STATS_TYPE = {
  API: 'API',
  SOCKET: 'SOCKET',
  TASK: 'TASK'
}
export const STORAGE_KEY_REPORTS = `${NAME}_REPORTS`
