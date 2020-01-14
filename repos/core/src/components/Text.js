import classNames from 'classnames'
import React, { Component } from 'react'
import { accessibilitySupport } from './utils'

/**
 * Text View - Pure Component.
 * (to be used as replacement for `<span></span>` for cross platform integration)
 *
 * @param {string} [className] - optional css class name
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export default function Text
({
   className,
   fill,
   reverse,
   rtl,
   sound,
   ...props
 }) {
  props = accessibilitySupport(props, sound)
  return (
    <span className={classNames('text', {fill, reverse, rtl, pointer: props.onClick}, className)} {...props} />
  )
}

Text.Class = class extends Component {
  render () {
    return <Text {...this.props} />
  }
}
