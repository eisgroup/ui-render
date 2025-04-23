import classNames from 'classnames'
import React from 'react'
import { isFunction } from 'ui-utils-pack'
import { accessibilitySupport } from './utils'

/**
 * Row View - Pure Component.
 * With default `display: flex` style
 * (to be used as replacement for `<div></div>` and `<span></span>` for cross platform integration)
 *
 * @param {string} [className] - optional css class
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} props - other attributes to pass to `<div></div>`
 * @param {*} [ref] - callback(element) when component mounts, or from React.createRef()
 * @returns {Object} - React Component
 */
export function Row ({
  className,
  fill,
  reverse,
  rtl,
  sound,
  expanded: _, // not used, remove to prevent warnings
  ...props
}, ref) {
  props = accessibilitySupport(props, sound)
  if (isFunction(ref)) props.ref = ref
  return <div className={classNames('flex--row', {fill, reverse, rtl, pointer: props.onClick}, className)} {...props} />
}

export const RowRef = React.forwardRef(Row)
export default React.memo(Row)
