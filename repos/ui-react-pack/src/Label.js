import PropTypes from 'prop-types'
import React from 'react'

/**
 * Label - Pure Component.
 * Abstraction layer for React Web
 *
 * @param {*} children - optional, content to be wrapped inside `<label>{children}</label>`
 * @param {*} props - other attributes to pass to `<label></label>`
 * @returns {Object}
 */
export function Label ({
  children,
  translate,
  ...props
}) {
  const child = (typeof children === 'string' && typeof translate === 'function') ? translate(children) : children
  return <label {...props}>{child}</label>
}

Label.propTypes = {
  children: PropTypes.any
}

export default React.memo(Label)
