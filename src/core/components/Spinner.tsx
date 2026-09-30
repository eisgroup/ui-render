import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React from 'react'
import View from './View'

/** The named props are read here; the rest is passed to the `View` it renders. */
export type SpinnerProps = {
  /** Spinner size */
  size?: 'largest' | 'larger' | 'large' | 'base' | 'small' | 'smaller' | 'smallest'
  /** Spinner color */
  color?: 'primary' | 'secondary' | 'text' | 'inverse' | 'white' | 'black'
  /** Optional, will be prepended with spinner classes */
  className?: string
  [key: string]: unknown
}

/**
 * Spinner - Pure Component
 */
export function Spinner ({
  size = 'base',  // Enum
  color = 'primary',  // Enum
  className,
  ...props
}: SpinnerProps) {
  return <View className={classNames('app__spinner', size, color, className)} {...props} />
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['largest', 'larger', 'large', 'base', 'small', 'smaller', 'smallest']),
  color: PropTypes.oneOf(['primary', 'secondary', 'text', 'inverse', 'white', 'black']),
  className: PropTypes.string
}

export default React.memo(Spinner)
