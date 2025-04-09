import { createSelector } from 'reselect'

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
 *          (state) => get(state, `${this.NAME}.location.id`),
 *          (route, id) => route.split('/').pop()
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
      selectors.forEach((selector, i) => selector || console.error(`${lastFunc.name} is missing selector ${i + 1}!`))
      constructor[key] = createSelector(
        ...selectors,
        function () {
          return lastFunc(...arguments)
        }
      )
    }
    constructor.NAME = NAME // can be accessed as instance `this.NAME` within selectors
  }
}

