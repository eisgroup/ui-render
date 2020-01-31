import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Icon from './Icon'
import Text from './Text'
import View from './View'

/**
 * Avatar - Component.
 *
 * @param {String} name - name
 * @param {String} [status] - online status, one of ['online', 'dueling', 'paused', 'stopped']
 * @param {Boolean} [hideName] - whether to hide the name underneath
 * @param {Boolean} [small] - whether to add 'small' css class
 * @param {Boolean} [large] - whether to add 'large' css class
 * @param {Boolean} [larger] - whether to add 'larger' css class
 * @param {Boolean} [secure] - whether to disable images
 * @param {Function} [onClick] - function to call
 * @param {String} [src] - image URL
 * @param {String} [className] - css class name to apply
 * @param {Object} [style] - css props
 * @param {Object} [children] - extra content to render inside avatar
 * @returns {Object} - React component
 */
export default function Avatar
  ({
    name = '',
    status = '',
    hideName = true,
    src = '',
    secure,
    small,
    large,
    larger,
    className,
    onClick,
    style,
    children,
  }) {
  const hasImage = src && !secure
  return (
    <View
      className={classNames('app__avatar', status, className, {
        small,
        large,
        larger,
        interact: onClick,
        fetching: hasImage,
      })}
      onClick={onClick}
      style={style}>
      <View className='app__avatar__inner'>
        <View className='app__avatar__image align-center'
              style={hasImage ? {backgroundImage: `url('${encodeURI(src)}')`} : undefined}
        >
          {hasImage
            ? <Text className='sr-only'>{name}</Text> // for screen readers
            : <Text className='placeholder'>{name.charAt(0).toUpperCase() || <Icon name='user'/>}</Text>
          }
        </View>
      </View>
      {!hideName && <Text className='text small primary margin-top'>{name}</Text>}
      {children}
    </View>
  )
}

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  hideName: PropTypes.bool,
  small: PropTypes.bool,
  large: PropTypes.bool,
  larger: PropTypes.bool,
  secure: PropTypes.bool,
  src: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.any,
}
