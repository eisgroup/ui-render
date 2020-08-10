import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Text from './Text'

/**
 * Color Swatch - Pure Component.
 */
export default function ColorSwatch ({
  code,
  small,
  large,
  className,
}) {
  const style = {backgroundColor: `rgb(${code})`}
  if (String(code) === '255,255,255') style.border = '1px solid rgba(127,127,127,0.5)'
  return <Text className={classNames('color__swatch', className, {small, large})} style={style}/>
}

ColorSwatch.propTypes = {
  code: PropTypes.oneOfType([ // rgb value
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.number)
  ]).isRequired,
  small: PropTypes.bool,
  large: PropTypes.bool,
  className: PropTypes.string,
}

export default React.memo(ColorSwatch)
