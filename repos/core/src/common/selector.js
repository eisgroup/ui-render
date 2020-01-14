import { createSelector } from 'reselect'
import { logSelector } from './utils'
import { __DEV__ } from './variables'

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
  return function (constructor) {
    for (const key in constructor) {
      const selectors = constructor[key]()
      const lastFunc = selectors.pop()
      constructor[key] = createSelector(
        ...selectors,
        function () {
          // __DEV__ && console.time(`${NAME} ${key}`)
          const result = lastFunc(...arguments)
          // __DEV__ && console.timeEnd(`${NAME} ${key}`)
          __DEV__ && logSelector(`${NAME} ${key}`, result)
          return result
        }
      )
    }
  }
}

