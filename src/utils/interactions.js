/**
 * Set Cursor to given type
 * @see: https://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
 * @param {String} name - one of cursor strings
 */

export function cursorSet (name) {
  if (typeof window !== 'undefined') document.body.style.cursor = name
}

/**
 * Reset Cursor to default state
 */
export function cursorUnset () {
  if (typeof window !== 'undefined') document.body.style.cursor = null
}

/**
 * Create Inline SVG data for use as CSS value
 * @note: the `#` string inside svg data will be converted to `%23`
 *
 * @param {String} svgString - svg file data as base64 string
 * @param {Number} [x] - coordinate of the hot spot, default is 0
 * @param {Number} [y] - coordinate of the hot spot, default is 0
 * @return {string} url - as inline css value (example: for use as cursor)
 */
export function inlineSvg (svgString, x = 0, y = 0) {
  return `url('data:image/svg+xml;utf8,${svgString.replace(/#/g, '%23')}') ${x} ${y}, auto`
}

/**
 * Get Pointer Event Position Offset from Target Element
 * @param {Event|PointerEvent|MouseEvent} event - pointer event
 * @param {Object<left, top>} rectangle - from event.target.getBoundingClientRect()
 * @return {{x: number, y: number}} offset - coordinates relative to event.target
 */
export function offsetFrom (event, rectangle) {
  return {x: event.clientX - rectangle.left, y: event.clientY - rectangle.top}
}

/**
 * Sync React Component state with new props
 * @example:
 *    UNSAFE_componentWillReceiveProps (next, _) {
 *      const {id} = this.props
 *      if (syncState({id}, next, this)) return
 *    }
 *
 * @param {Object} current - props
 * @param {Object} next - props
 * @param {Component|PureComponent} instance - React component
 * @param {Function} [callback] - after state update
 * @return {Boolean} true - if state was synced
 */
export function syncState (current, next, instance, callback) {
  const update = {}
  for (const key in current) {
    if (next[key] !== current[key]) update[key] = next[key]
  }
  if (Object.keys(update).length) {
    instance.setState(update, callback)
    return true
  }
}
