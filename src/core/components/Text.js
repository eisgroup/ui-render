import classNames from 'classnames'
import React from 'react'
import { Active } from 'ui-utils-pack'

/**
 * Text View - Pure Component.
 * (to be used as replacement for `<span></span>` for cross platform integration)
 *
 * @param {string} [className] - optional css class name
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export function Text ({
  className,
  fill,
  reverse,
  rtl,
  expanded: _, // not used, remove to prevent warnings
  children,
  translate = Active.translate,
  ...props
}) {
  return (
    <span className={classNames('text', {fill, reverse, rtl, pointer: props.onClick}, className)} {...props}>
      {(typeof children === 'string') ? translate(children) : children}
    </span>
  )
}

export default React.memo(Text)
