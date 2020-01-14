import React from 'react'
import View from './View'

/**
 * Space - Pure Component
 */
export default function Space ({small, large, ...props}) {
  return <View className={'space' + (small ? '-small' : (large ? '-large' : ''))} {...props}/>
}
