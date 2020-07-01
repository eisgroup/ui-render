import classNames from 'classnames'
import { shortNumber } from 'dux-utils'
import PropTypes from 'prop-types'
import React from 'react'
import View from './View'

/**
 * Badge Counter - Pure Component.
 */
export default function Badge
  ({
     count,
     digits = 2,
     className,
     ...props
   }) {
  const counter = (digits && count > 9) ? shortNumber(count, digits) : count
  // noinspection JSConstructorReturnsPrimitive
  return counter ? <View className={classNames('badge', className)} {...props}>{counter}</View> : null
}

Badge.propTypes = {
  count: PropTypes.number.isRequired,
  digits: PropTypes.number,
  className: PropTypes.string,
}
