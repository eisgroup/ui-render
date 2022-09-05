import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import View from './View'

/**
 * Spinner - Pure Component
 *
 * @param {string} size - spinner size
 * @param {string} color - spinner color
 * @param {string} className - optional, will be prepended with spinner classes
 * @param {*} props - other attributes to pass to spinner
 * @returns {object} - React Component
 */
export function Spinner ({
  size = 'base',  // Enum
  color = 'primary',  // Enum
  className,
  ...props
}) {
  return <View className={classNames('app__spinner', size, color, className)} {...props} />
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['largest', 'larger', 'large', 'base', 'small', 'smaller', 'smallest']),
  color: PropTypes.oneOf(['primary', 'secondary', 'text', 'inverse', 'white', 'black']),
  className: PropTypes.string
}

export default React.memo(Spinner)
