import React from 'react'
import { renderFloat } from './renders'
import { type } from './types'

/**
 * Localised Float or Integer Number
 * (with option to round to fixed Fraction length or truncate without rounding)
 */
export function FloatNumber ({value, decimals, ...props}) {
  return renderFloat(value, decimals, props)
}

FloatNumber.propTypes = {
  // Localised Number to render
  value: type.NumberOrString,
  // Number of fraction digits to keep
  decimals: type.Number,
  // Disable fraction part faded styling
  faded: type.Boolean,
  // Truncate fraction without rounding
  truncated: type.Boolean,
}

export default React.memo(FloatNumber)
