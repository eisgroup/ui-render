import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { accessibilitySupport } from './utils'

/**
 * Icon - Pure Component
 *
 * @param {String} name - icon class name
 * @param {String} [className] - optional, will be appended with 'pointer' class when `onClick` given
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} props - other attributes to pass to Icon
 * @returns {Object} - React Component
 */
export default function Icon
({
   name,
   className,
   large,
   small,
   sound,
   ...props
 }) {
  props = accessibilitySupport(props, sound)
  return (
    <i className={classNames('icon', name, className, { large, small, pointer: props.onClick })}
       aria-hidden='true' {...props} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  sound: PropTypes.object,
  large: PropTypes.bool,
  small: PropTypes.bool,
  className: PropTypes.string,
}

Icon.Class = class extends Component {
  render () {
    return <Icon {...this.props} />
  }
}
