import PropTypes from 'prop-types'
import React from 'react'
import Icon from './Icon'
import View from './View'

/**
 * Logo
 *
 * @param {string} name - app name
 * @param {string} link - relative or absolute URL link. Will default to root of app
 * @returns {Object} - React element
 */
export function Logo ({
  name,
  link = '/'
}) {
  return (
    <View className='app__logo align-center' href={link}>
      <Icon name='logo'/> {name}
    </View>
  )
}

Logo.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string
}

export default React.memo(Logo)
