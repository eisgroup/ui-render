import { get } from 'lodash-es'
import now from 'performance-now'
import { __BACKEND__, __CLIENT__, __DEV__, __TEST__, Active } from './_envs.js'
import { WARN } from './constants.js'
import { isFunction } from './function.js'
import { formatNumber } from './number.js'
import { isInString } from './string.js'

/**
 * LOGGING FUNCTIONS ===========================================================
 * =============================================================================
 */

/**
 * Benchmark provided function with optional logging of its output
 *
 * @example
 *    bench({type: SET, loop: 10000}, performStorage, SET, 'id', [13])
 *    >>> performStorage() ▶ SET took 1,912.790 ms for 10,000 iterations, 0.191 ms each
 *
 * @param {string} [type] - name of benchmark type (i.e. `selector`, `query`, etc.)
 * @param {Function|string|boolean} [log] - wrapper function or property path of the result to log,
 *    use `true` to log result itself
 * @param {string} [name] - the benched function name
 * @param {number} [loop] - number of iterations to run the function
 * @param {Function} func - to benchmark
 * @param {*} args - arguments to pass to the function
 * @return {*} - result as processed by given `log` argument, if any
 */
export function bench ({type, log, name, loop}, func, ...args) {
  let result = []
  const start = now()
  if (loop) {
    for (let i = 0; i < loop; i++) {
      result.push(func(...args))
    }
  } else {
    result = func(...args)
  }
  const duration = now() - start

  result = (log != null) ? (isFunction(log) ? log(result) : get(result, log, result)) : null

  logBenchmark({
    name: name || func.name,
    type,
    duration,
    loop,
    result,
  })

  return result
}

bench.skip = new Function('')  // eslint-disable-line

/**
 * Asynchronous Benchmark Version
 * @Note: see bench() method for documentation
 */
export async function benchA ({type, log, name, loop}, func, ...args) {
  let result = []
  const start = now()
  if (loop) {
    for (let i = 0; i < loop; i++) {
      result.push(await func(...args))
    }
  } else {
    result = await func(...args)
  }
  const duration = now() - start

  result = (log != null) ? (isFunction(log) ? log(result) : get(result, log, result)) : null

  logBenchmark({
    name: name || func.name,
    type,
    duration,
    loop,
    result,
  })

  return result
}

benchA.skip = new Function('')  // eslint-disable-line

/**
 * Console log proxy method which provides a way to prepend the log with the first param
 * and also pass colors via the ...args array. Only runs in dev.
 *
 * @requires __DEV__
 * @param {string} first - string to prepend to the log message
 * @param {*} [args] - optionally pass additional arguments to log
 * @return void
 */
export function log (first, ...args) {
  if (!__DEV__) return
  // Client or no Chalk logger
  if (__CLIENT__ || (!Active.log || !Active.log.keyword)) {
    console.log((typeof first === 'string' && isInString(args[0] || '', 'color:')) ? `%c${first}` : first, ...args)
  }

  // Backend with Chalk logger
  else {
    const color = isInString(args[0] || '', 'color:') ? args.shift().split(': ')[1].toLowerCase() : ''
    console.log((typeof first === 'string' && color) ? Active.log.keyword(color)(first) : first, ...args)
  }
}

/**
 * Console log proxy method to show Benchmark stats
 *
 * @param {string} name - the calling function name
 * @param {string} [type] - the calling function type
 * @param {number} duration - milliseconds it took to execute
 * @param {number} [loop] - execution iterations
 * @param {*} result - execution result
 * @return void
 */
export function logBenchmark ({name, type = '', duration, loop = null, result = null}) {
  const task = `\n${name}()`
  const took = `▶ ${type} took`
  const ms = `${formatNumber(duration, {decimals: 3})} ms`
  const iteration = !loop ? '' : `for ${formatNumber(loop)} iterations, `
  const time = `${formatNumber(duration / loop, {decimals: 3})} ms`
  const each = 'each'
  const output = (result != null) ? ['\n>>>', result] : []
  if (Active.log) {
    console.log(
      Active.log.green(task),
      Active.log.keyword('cyan')(took),
      Active.log.keyword('orange')(ms),
      Active.log.keyword('cyan')(iteration),
      Active.log.keyword('orange')(time),
      each,
      ...output,
    )
  } else {
    console.log(
      `%c${task} %c${took} %c${ms} %c${iteration} %c${time}`,
      'color: Green', 'color: Teal', 'color: Orange', 'color: Teal', 'color: Orange', 'each',
      ...output
    )
  }
}

/**
 * Console log proxy for Component props mapping from State with standardised colors and format.
 * Only runs in dev.
 *
 * @requires __DEV__
 * @param {string} NAME - View Template's name
 * @param {*} value - Mapping result to log
 * @return void
 */
export function logMapping (NAME, value) {
  if (!__DEV__) return
  log(`MAPPING -> ${NAME}`, 'color: Green', __CLIENT__ ? value : '')
}

/**
 * React Component Log Render Decorator
 * @example:
 *    @logRender
 *    class Homepage extends Component {...}
 *    >>> ♦♦♦♦♦♦♦ RENDER Homepage ♦♦♦♦♦♦♦
 *
 * @param {Object} constructor - class
 */
export function logRender (constructor) {
  const original = constructor.prototype.render

  constructor.prototype.render = function () {
    if (__DEV__) {
      const name = constructor.name
      const start = now()
      const result = original.apply(this, arguments)
      const duration = now() - start
      const colors = ['color: Teal']
      let time = `${formatNumber(duration, {decimals: 3})} ms`
      // Render is considered slow if it reaches near one frame in 60 FPS
      if (__CLIENT__ && duration >= 15) {
        time = '%c' + time + '%c'
        colors.push('color: Red', 'color: Teal')
      }
      log(`♦♦♦♦♦♦♦ RENDER ${name} [${time}] ♦♦♦♦♦♦♦`, ...colors)
      return result
    }
    return original.apply(this, arguments)
  }
}

/**
 * Console log proxy for memoized Selectors with standardised colors and format.
 * Only runs in dev.
 *
 * @requires __DEV__
 * @param {string} NAME - Selector function name
 * @param {*} value - Selector value to log
 * @param {*} [args] - other arguments to pass
 * @return void
 */
export function logSelector (NAME, value, ...args) {
  if (!__DEV__) return
  log(`SELECT -> ${NAME}`, 'color: Orange', ...args, __CLIENT__ ? value : '')
}

/**
 * Console log proxy for non-cached state Queries with standardised colors and format.
 * Only runs in dev.
 *
 * @requires __DEV__
 * @param {string} NAME - Query function name
 * @param {*} value - value to log
 * @return void
 */
export function logQuery (NAME, value) {
  if (!__DEV__) return
  log(`QUERY -> ${NAME}`, 'color: DarkOrange', __CLIENT__ ? value : '')
}

/**
 * Console log proxy for async Tasks with standardised colors and format.
 * Only runs in dev.
 *
 * @requires __DEV__
 * @param {string} NAME - Task function name
 * @param {*} value - Task value to log
 * @return void
 */
export function logTask (NAME, value = '') {
  if (!__DEV__) return
  log(`TASK -> ${NAME}`, 'color: BlueViolet', __CLIENT__ ? value : '')
}

/**
 * Console log proxy for Tests with standardised colors and format.
 * Only runs in test.
 *
 * @requires __TEST__
 * @return void
 */
export function logTest (...args) {
  if (!__TEST__) return
  console.log(...args)
}

/**
 * Clear Console Log
 */
export function logClear () {
  if (!__DEV__) return
  if (typeof process !== 'undefined') {
    process.stdout.write('\u001b[2J')
    process.stdout.write('\u001b[1;1H')
    process.stdout.write('\u001b[3J')
    return
  }
  console.clear()
}

/**
 * Console warn proxy method. Only runs in dev.
 *
 * @requires __DEV__
 * @param {*} args - the arguments to log
 * @return void
 */
export function warn (...args) {
  // eslint-disable-next-line no-console
  if (!__DEV__) return
  if (__CLIENT__) {
    console.warn('✋ ', ...args)
  } else {
    console.warn('✋ ', ...args)
  }
}

/**
 * Ensure file is loaded in correct platform
 */
export function assertFrontend () {
  if (__BACKEND__ && !__TEST__) throw new Error(`${WARN} WARNING! Backend file loaded in Frontend!!!`)
}

/**
 * Ensure file is loaded in correct platform
 */
export function assertBackend () {
  if (__CLIENT__ && !__TEST__) throw new Error(`${WARN} WARNING! Frontend file loaded in Backend!!!`)
}
