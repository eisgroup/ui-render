import { isFunction } from 'ui-utils-pack'

/**
 * REACT.JS HELPERS ============================================================
 * =============================================================================
 */

/**
 * Check if given Component is a Class
 * @param {Class|Function} Component - React component
 * @returns {Boolean} true - if it is
 */
export function isClass (Component) {
  return !!Component.prototype && isFunction(Component.prototype.render)
}

/**
 * Get the Original React Class from the Component wrapped by decorator/s
 * @param {Class|Function} Component - the wrapped React Component
 * @returns {Class|Boolean} Class - the original class component if found, else, false
 */
export function getOriginalClass (Component) {
  return (isClass(Component) && Component) || (isClass(Component.Class) && Component.Class)
}
