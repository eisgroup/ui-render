import cn from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Text from './Text'

/**
 * Color Swatch - Pure Component.
 */
function ColorSwatch ({
  code,
  small,
  large,
  className,
  style,
  ...props
}) {
  const color = String(code)
  return <Text
    className={cn('color__swatch', className, {small, large, white: color === '255,255,255', black: color === '0,0,0'})}
    style={{backgroundColor: `rgb(${color})`, ...style}}
    {...props}
  />
}

ColorSwatch.propTypes = {
  /** RGB Value */
  code: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.number)
  ]).isRequired,
  small: PropTypes.bool,
  large: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default React.memo(ColorSwatch)
