import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Loading from './Loading'
import { onPressHoc } from './utils'

/**
 * Button - Pure Component.
 *
 * @param {Function} [onClick] - button click callback
 * @param {String} [size] - button size, one of ['small', 'base', 'large']
 * @param {String} [type=button] - button type eg. button, submit
 * @param {String} [className] - optional, will be prepended with `button `
 * @param {Boolean} [disabled] - optional, whether the button is disabled
 * @param {Boolean} [loading] - optional, show spinner instead of children
 * @param {Boolean} [circle] - whether to add `circle` css class with even padding
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} [children] - optional, content to be wrapped inside button `<button>{children}</button>`
 * @param {*} [props] - other attributes to pass
 * @returns {Object} - React component
 */
export default function Button
  ({
    onClick,
    disabled = false,
    loading = false,
    circle,
    children,
    size,
    type = 'button',
    sound,
    className,
    ...props
  }) {

  return (
    <button
      className={classNames('button', size, className, {circle, loading})}
      disabled={disabled || loading}
      type={type}
      onClick={onPressHoc(onClick, sound)}
      {...props}
    >
      {children}
      {loading && <Loading isLoading/>}
    </button>
  )
}

Button.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any
}

Button.Class = class extends Component {
  render () {
    return <Button {...this.props} />
  }
}
