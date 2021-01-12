import React from 'react'
import { renderFloat } from './renders'
import { type } from './types'

/**
 * Localised Float or Integer Number
 * (with option to round to fixed Fraction length or truncate without rounding)
 */
export function Float ({value, decimals, ...props}) {
  return renderFloat(value, decimals, props)
}

Float.propTypes = {
  value: type.NumberOrString,
  decimals: type.Number,
  truncated: type.Boolean,
}

export default React.memo(Float)
