import PropTypes from 'prop-types'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

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
  // DOM boundary: <label> takes neither `name` nor a `label` attribute, and the mapper's
  // LABEL view spreads a whole meta node here. See ./domProps.js.
  return <label {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}>{child}</label>
}

Label.propTypes = {
  children: PropTypes.any
}

export default React.memo(Label)
