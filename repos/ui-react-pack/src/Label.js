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
  ...props
}) {
  return <label {...props}>{children}</label>
}

Label.propTypes = {
  children: PropTypes.any
}

export default React.memo(Label)
