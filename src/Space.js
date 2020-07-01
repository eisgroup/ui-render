import classNames from 'classnames'
import React from 'react'
import View from './View'

/**
 * Space - Pure Component
 */
export default function Space ({small, large, className, ...props}) {
  return <View className={classNames('space' + (small ? '-small' : (large ? '-large' : '')), className)} {...props}/>
}
