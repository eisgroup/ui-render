import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Active } from 'ui-utils-pack'

/**
 * Icon - Pure Component
 *
 * @param {String} name - icon class name
 * @param {String} [className] - optional, will be appended with 'pointer' class when `onClick` given
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {*} props - other attributes to pass to Icon
 * @returns {Object} - React Component
 */
export function Icon ({
  name,
  className,
  large,
  small,
  ...props
}) {
  return (
    <i className={classNames(Active.iconClass, Active.iconClassPrefix + name, className, {
      large,
      small,
      pointer: props.onClick
    })}
       aria-hidden='true' {...props} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  large: PropTypes.bool,
  small: PropTypes.bool,
  className: PropTypes.string,
}

export default React.memo(Icon)
