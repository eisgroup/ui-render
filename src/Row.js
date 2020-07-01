import classNames from 'classnames'
import React, { Component } from 'react'
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
 * @returns {Object} - React Component
 */
export default function Row
({
  className,
  fill,
  reverse,
  rtl,
  sound,
  expanded: _, // not used, remove to prevent warnings
  ...props
}) {
  props = accessibilitySupport(props, sound)
  return (
    <div className={classNames('flex--row', {fill, reverse, rtl, pointer: props.onClick}, className)} {...props} />
  )
}

Row.Class = class extends Component {
  render () {
    return <Row {...this.props} />
  }
}
