import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React from 'react'
import Loading from './Loading'
import { Active } from '../utils'
import { ENGINE_PROPS, omitProps } from './domProps'

/**
 * Button - Pure Component.
 *
 * @param {Function} [onClick] - button click callback
 * @param {String} [size] - button size, one of ['small', 'base', 'large']
 * @param {String} [type=button] - button type eg. button, submit
 * @param {String} [className] - optional, will be prepended with `button `
 * @param {Boolean} [disabled] - optional, whether the button is disabled
 * @param {Boolean} [loading] - optional, show spinner instead of children
 * @param {Boolean} [active] - whether to add `active` css class=
 * @param {Boolean} [circle] - whether to add `circle` css class with even padding
 * @param {Boolean} [square] - whether to add `square` css class with even padding
 * @param {*} [children] - optional, content to be wrapped inside button `<button>{children}</button>`
 * @param {*} [props] - other attributes to pass
 * @returns {Object} - React component
 */
export function Button ({
  onClick,
  disabled = false,
  loading = false,
  active,
  circle,
  square,
  children,
  size,
  type = 'button',
  className,
  translate = Active.translate,
  ...props
}) {
  // DOM boundary: ENGINE_PROPS only. `name` is a real attribute on <button> (form
  // submission), so FIELD_ONLY_PROPS is deliberately NOT applied — see ./domProps.js.
  // This is what keeps a raw meta node's `view` off the button LocalDraftTableRow builds.
  const domProps = omitProps(props, ENGINE_PROPS)

  return (
    <button
      className={classNames('button', size, className, {circle, square, active, loading})}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      {...domProps}
    >
      {(typeof children === 'string') ? translate(children) : children}
      {loading && <Loading loading/>}
    </button>
  )
}

Button.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any
}

export default React.memo(Button)
