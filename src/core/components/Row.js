import classNames from '../utils/classNames'
import React from 'react'
import { isFunction } from '../utils'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

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
 * @param {*} props - other attributes to pass to `<div></div>`
 * @param {*} [ref] - callback(element) when component mounts, or from React.createRef()
 * @returns {Object} - React Component
 */
export function Row ({
  className,
  fill,
  reverse,
  rtl,
  ...props
}, ref) {
  // DOM boundary: this spread lands on a <div>. See ./domProps.js — `ref` is attached after
  // the filter because omitProps may return the (rest) object unchanged.
  const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
  if (isFunction(ref)) domProps.ref = ref
  return <div className={classNames('flex--row', {fill, reverse, rtl, pointer: props.onClick}, className)} {...domProps} />
}

export const RowRef = React.forwardRef(Row)
export default React.memo(Row)
