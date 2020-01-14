import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from './Spinner'
import Text from './Text'
import View from './View'

/**
 * Loading Overlay - Pure Component
 *
 * @param {Boolean} [isLoading] - whether to show this Component or not
 * @param {String} [size] - spinner size
 * @param {String} [className] - css class to add
 * @param {String} [iconClassName] - css class to add to spinner icon
 * @param {Boolean} [transparent] - whether to add 'transparent' css class
 * @param {*} [children] - optional content to render
 * @param {*} props - other attributes to pass to spinner
 * @returns {object} - React Component
 */
export default function Loading
  ({
     isLoading = true,
     size = 'larger',  // Enum
     className,
     iconClassName,
     transparent = false,
     children,
     ...props
   }) {
  return (isLoading &&
    <View className={classNames('app__loading', className, {transparent})}>
      <Spinner className={iconClassName} size={size} {...props} />
      {children && <Text className='h4 blink'>{children}</Text>}
    </View>
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool,
  size: PropTypes.any,
  className: PropTypes.string,
  iconClassName: PropTypes.string
}
