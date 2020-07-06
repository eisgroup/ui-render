import { fork } from 'redux-saga/effects'
import {
  Active,
  DISCONNECTED,
  ERROR,
  first,
  GET,
  last,
  ONE_SECOND,
  performStorage,
  REPORT,
  SET,
  TIMEOUT,
  toList,
  toListValuesTotal,
  warn
} from 'utils-pack'
import { stateActionType } from '../redux'
import {
  MAX_ERROR_RECORDS,
  MAX_IDLE_DURATION,
  MAX_LATENCY_RECORDS,
  MIN_IDLE_ALERT_DURATION,
  STATS_TYPE,
  STORAGE_KEY_REPORTS
} from './constants'

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

export function actionTypeColor (type) {
  const lastWord = (type.match(/(?:[^a-zA-Z0-9])([a-zA-Z0-9]+)$/) || [])[1]
  switch (lastWord) {
    case ERROR:
      return 'red'

    case TIMEOUT:
    case DISCONNECTED:
      return 'yellow'

    default:
      return 'cyan'
  }
}

export function latencyColor (milliseconds) {
  if (milliseconds < 500) return 'yellow'
  if (milliseconds < 1000) return 'blue'
  if (milliseconds < 1500) return 'magenta'
  return 'red'
}

export class Log {
  static _statsBy = {}  // id
  static _statsByService = {}  // VPS instance names

  static get errors () {
    return (performStorage(GET, STORAGE_KEY_REPORTS) || {}).errors || []
  }

  static set errors (errors) {
    performStorage(SET, STORAGE_KEY_REPORTS, {errors})
  }

  /**
   * Get Updated Stats for all logged types
   *
   * @return {Array} - list of objects containing stats ready for report
   */
  static get stats () {
    const results = []
    for (const id in Log._statsBy) {
      const data = Log._statsBy[id]
      if (data.type === STATS_TYPE.API || data.type === STATS_TYPE.SOCKET) results.push(Log.requestStats(id))
      if (data.type === STATS_TYPE.TASK) results.push(Log.taskStats(id))
    }
    return results.concat(...Object.values(Log._statsByService))
  }

  /**
   * Get List of Connected Services
   */
  static get services () {
    return Object.keys(Log._statsByService)
  }

  /**
   * Log Stats Report from other Services to query later with Log.stats getter
   *
   * @param {Object} action - API result action from report
   */
  static saveStats (action) {
    const {payload: {items = []} = {}, meta: {service} = {}} = action
    if (!service && !items) return warn(`Log.${Log.saveStats.name} expects payload 'items' and meta 'service'`)
    Log._statsByService[service] = items
  }

  /**
   * Remove Log Stats for given list of Service names
   *
   * @param {Array|String} services - list of services to remove
   */
  static servicePrune (services) {
    toList(services).forEach(service => {
      const id = `${Active.SERVICE}_${service}_${STATS_TYPE.SOCKET}`
      delete Log._statsByService[service]
      delete Log._statsBy[id]
    })
  }

  /**
   * Record Error Action in Storage and Broadcast to Subscribers
   *
   * @param {Object} action - Error stateAction
   */
  static handleError (action) {
    const errors = Log.errors
    errors.unshift(action)

    if (errors.length > MAX_ERROR_RECORDS) errors.length = MAX_ERROR_RECORDS

    try {
      // Update Error Log
      Log.errors = errors

      // Broadcast New Error Report
      Active.pubsub.publish(stateActionType(ERROR, REPORT), {errorReports: [action]})
    } catch (err) {
      try {
        // Action payload from API can be an Error object
        action.payload = action.payload.toString()

        // Update Error Log
        Log.errors = errors

        // Broadcast New Error Report
        Active.pubsub.publish(stateActionType(ERROR, REPORT), {errorReports: [action]})
      } catch (err) {
        warn('Cannot Convert to JSON!!!', action)
      }
    }
  }

  /**
   * Log API action to query stats later
   *
   * @param {Object} action - API action result
   * @param {String} metaKey - meta data key property to use as Stats name
   */
  static api (action, metaKey) {
    setTimeout(() => {  // avoid affecting performance by postponing logging
      const {meta: {[metaKey]: name, request: {latency, end} = {}} = {}} = action || {}
      if (!name || !latency) return
      const record = {latency, timestamp: end || Date.now()}
      Log.request(name, record, STATS_TYPE.API)
    }, ONE_SECOND)
  }

  /**
   * Remove Log Stats for given list of API names
   *
   * @param {Array|String} metaKeys - list of meta data key property to use as Stats name
   */
  static apiPrune (metaKeys) {
    toList(metaKeys).forEach(name => {
      const id = `${Active.SERVICE}_${name}_${STATS_TYPE.API}`
      delete Log._statsBy[id]
    })
  }

  /**
   * Log API/Socket action to query stats later
   *
   * @param {String} name - Stats name
   * @param {Object} record - {latency, timestamp}
   * @param {String} type - Stats type
   */
  static request (name, record, type) {
    const id = `${Active.SERVICE}_${name}_${type}`
    let result = Log._statsBy[id]

    // Create New Log
    if (!result) {
      Log._statsBy[id] = {
        id,
        name,
        type,
        service: Active.SERVICE,
        latencies: [record]
      }
    }  // eslint-disable-line

    // Update Existing Log
    else {
      if (result.latencies.unshift(record) > MAX_LATENCY_RECORDS) result.latencies.length = MAX_LATENCY_RECORDS
    }
  }

  /**
   * Generate API/Socket Stats by ID
   *
   * @param {String} id - as generated by Log.api/socket()
   * @return {Object} stats - ready for report
   */
  static requestStats (id) {
    const {latencies, ...props} = Log._statsBy[id]
    const result = props
    const now = Date.now()
    result.latency = Math.round(toListValuesTotal(latencies, 'latency') / latencies.length)
    result.start = last(latencies).timestamp
    result.requested = first(latencies).timestamp  // last requested
    result.updated = now
    result.idle = now - result.requested
    result.active = result.idle < MAX_IDLE_DURATION
    if (result.idle > MIN_IDLE_ALERT_DURATION) result.stopped = result.requested
    return result
  }

  /**
   * Log Socket action to query stats later
   *
   * @param {Object} payload - decoded message received from Socket action
   * @param {Object} [meta] - Socket action meta data
   */
  static socket (payload, meta) {
    const now = Date.now()
    setTimeout(() => {  // avoid affecting performance by postponing logging
      let {id: name, start} = payload || {}
      if (!name || !start) return  // do not warn here because initial messages are not signed
      const {request: {end, latency} = {}} = meta || {}
      const record = (latency && end) ? {latency, timestamp: end} : {latency: now - start, timestamp: now}
      Log.request(name, record, STATS_TYPE.SOCKET)
    }, ONE_SECOND)
  }

  /**
   * Wrapper Saga to log Generator or Normal Function execution time
   * Note: this wrapper costs about 0.1 milliseconds
   *
   * @param {Function} func - generator or normal function to call
   * @param {String} [args] - other arguments to pass to given function
   * @return {*} result - from calling given function
   */
  static * saga (func, ...args) {
    const start = Date.now()
    const task = yield fork(func, ...args)
    return yield task.done
      .then(result => {
        Log.task(task, {start, done: Date.now()})
        return result
      })
      .catch(error => error)
  }

  /**
   * Log Task to query stats later
   *
   * @param {Object} task - redux-saga Task object
   * @param {Number} [start] - task start time
   * @param {Number} [done] - task done time
   * @param {String} [parentId] - task ID of the saga that called this task
   */
  static task (task, {start = Date.now(), done = null, parentId = null} = {}) {
    setTimeout(() => {  // avoid affecting performance by postponing logging
      const name = task.name
      const record = done ? {latency: done - start, timestamp: done} : null
      const id = `${parentId ? '_' + parentId : Active.SERVICE}_${name}`
      let result = Log._statsBy[id]

      // Create New Log
      if (!result) {
        Log._statsBy[id] = {
          id,
          name,
          type: STATS_TYPE.TASK,
          service: Active.SERVICE,
          start,
          ...done && {
            done,
            result: task.result(),
            latencies: [record]
          },
          task
        }
      }  // eslint-disable-line

      // Update Existing Log
      else {
        result.task = task
        if (done) {
          result.done = done
          result.result = task.result()
          const updateLatencies = result.latencies && record && result.latencies.unshift(record) > MAX_LATENCY_RECORDS
          if (updateLatencies) result.latencies.length = MAX_LATENCY_RECORDS
        }
      }
    }, ONE_SECOND)
  }

  /**
   * Log Task End to query latency stats later
   *
   * @param {Object} task - redux-saga Task object
   * @param {Number} [done] - task done time
   * @param {String} [parentId] - task ID of the saga that called this task
   */
  static taskEnd (task, {parentId = null, done = Date.now()}) {
    setTimeout(() => {  // avoid affecting performance by postponing logging
      const name = task.name
      const id = `${parentId ? '_' + parentId : Active.SERVICE}_${name}`
      const result = Log._statsBy[id]
      if (!result) return warn(`Log.${Log.taskEnd.name} found no task named '${task.name}'`)
      result.done = done
      result.result = task.result()
      result.latency = done - result.start
    }, ONE_SECOND)
  }

  /**
   * Generate Task Stats by ID
   *
   * @param {String} id - as generated by Log.task()
   * @return {Object} stats - ready for report
   */
  static taskStats (id) {
    const stats = Log._statsBy[id]
    const {task} = stats
    const now = Date.now()
    stats.updated = now
    stats.active = task.isRunning()
    stats.error = task.error()
    if (task.isCancelled() || stats.error) {
      if (!stats.stopped) stats.stopped = now
    } else {
      delete stats.stopped
    }
    if (!stats.done && !stats.active && !stats.stopped && !stats.error) {
      stats.done = now
      stats.result = task.result()
    }
    const {task: extract, latencies, ...result} = stats
    if (latencies) result.latency = Math.round(toListValuesTotal(latencies, 'latency') / latencies.length)
    return result
  }
}
