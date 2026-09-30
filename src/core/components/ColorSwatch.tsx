import cn from '../utils/classNames'
import PropTypes from 'prop-types'
import React from 'react'
import Text from './Text'

/** The named props are read here; the rest is passed to the `Text` it renders. */
export type ColorSwatchProps = {
  /** RGB Value: 'r,g,b', or [r, g, b] */
  value: string | number[]
  small?: boolean
  large?: boolean
  className?: string
  /** Merged over the swatch's background color */
  style?: React.CSSProperties
  [key: string]: unknown
}

/**
 * Color Swatch - Pure Component.
 */
export function ColorSwatch ({
  value,
  small,
  large,
  className,
  style,
  ...props
}: ColorSwatchProps) {
  const color = String(value || '')
  if (color) style = {backgroundColor: `rgb(${color})`, ...style}
  return <Text
    className={cn('color__swatch', className, {small, large, white: color === '255,255,255', black: color === '0,0,0'})}
    style={style}
    {...props}
  />
}

ColorSwatch.propTypes = {
  /** RGB Value */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.number)
  ]).isRequired,
  small: PropTypes.bool,
  large: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default React.memo(ColorSwatch)
