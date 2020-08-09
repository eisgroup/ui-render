import { createSelector } from 'reselect'
import { formatNumber } from 'utils-pack/number'
import { logSelector } from './log'
import now from 'performance-now' // adds almost zero KB to bundle size because browsers have window.performance.now()
import { __DEV__ } from './_envs'

/**
 * Selector Decorator to turn all class static property functions into Memoized Functions
 *
 * @see: `createSelector` in reselect library for docs
 * @note: make sure to avoid arrow function when reusing selectors
 *
 * @example:
 *   // selectors.js
 *   @selector(NAME)
 *   export default class select {
 *
 *     static activeRoute = () => [
 *       (state) => get(state, `${NAME}.location.pathname`),
 *       (pathname) => pathname
 *     ]
 *
 *     // Reusing selectors
 *     static activeUri = function () {
 *        // noinspection JSPotentiallyInvalidUsageOfClassThis
 *        return [
 *          this.activeRoute,
 *          (route) => route.split('/').pop()
 *        ]
 *     }
 *   }
 * @param {String} NAME - module's namespace
 * @returns {Function} decorator - that transforms given class' static properties
 */
export default function selector (NAME) {
  let start, end
  return function (constructor) {
    for (const key in constructor) {
      const selectors = constructor[key]()
      const lastFunc = selectors.pop()
      constructor[key] = createSelector(
        ...selectors,
        function () {
          __DEV__ && (start = now())
          const result = lastFunc(...arguments)
          __DEV__ && (end = now()) && logSelector(`${NAME} ${key} [${formatNumber(end - start, {decimals: 3})} ms]`, result)
          return result
        }
      )
    }
  }
}

