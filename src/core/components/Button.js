import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Loading from './Loading'
import { onPressHoc } from './utils'
import { Active } from 'ui-utils-pack'

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
 * @param {Object} [sound] - new Audio(URL) sound file
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
  sound,
  className,
  translate = Active.translate,
  ...props
}) {

  return (
    <button
      className={classNames('button', size, className, {circle, square, active, loading})}
      disabled={disabled || loading}
      type={type}
      onClick={onPressHoc(onClick, sound)}
      {...props}
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
