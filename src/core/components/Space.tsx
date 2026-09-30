import classNames from '../utils/classNames'
import React from 'react'
import View from './View'

/** `small`/`large` pick `space-small`/`space-large`; the rest goes to the `View`. */
export type SpaceProps = { small?: boolean, large?: boolean, className?: string, [key: string]: unknown }

/**
 * Space - Pure Component
 */
export function Space ({small, large, className, ...props}: SpaceProps) {
  return <View className={classNames('space' + (small ? '-small' : (large ? '-large' : '')), className)} {...props}/>
}

export default React.memo(Space)
