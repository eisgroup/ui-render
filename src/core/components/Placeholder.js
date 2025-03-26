import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Emoji from './Emoji'
import Text from './Text'
import View from './View'

/**
 * Placeholder - Pure Component.
 */
export function Placeholder ({className, ...props}) {
  return <View
    fill
    className={classNames('bg-texture-faded full-screen middle center fade-in-up padding-largest', className)}
    {...props}
  />
}

Placeholder.propTypes = {
  children: PropTypes.any.isRequired
}

Placeholder.Searching = function ({title, ...props}) {
  return (
    <Placeholder {...props}>
      <Text className='h2 center'>{title}</Text>
      <View className='signal-pulse large margin-v'>
        <View className='position-center blink'><Emoji large>😎</Emoji></View>
      </View>
      <View className='margin-v'>
        <Text className='center large margin-v-small'>{'Nothing found,'}</Text>
        <Text className='center large margin-bottom'>{'check back in later...'}</Text>
      </View>
    </Placeholder>
  )
}

Placeholder.Searching.propTypes = {
  title: PropTypes.any.isRequired
}

export default React.memo(Placeholder)
