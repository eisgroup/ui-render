import classNames from '../utils/classNames'
import React from 'react'
import Spinner from './Spinner'
import type { SpinnerProps } from './Spinner'
import Text from './Text'
import View from './View'

/** The named props are read here; the rest is passed to the spinner. */
export type LoadingProps = {
  /** Whether to show this Component or not */
  loading?: boolean
  /** Spinner size */
  size?: SpinnerProps['size']
  /** Css class to add */
  className?: string
  /** Css class to add to spinner icon */
  iconClassName?: string
  /** Whether to add 'transparent' css class */
  transparent?: boolean
  /** Optional content to render */
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * Loading Overlay - Pure Component
 */
export function Loading ({
  loading = true,
  size = 'larger',  // Enum
  className,
  iconClassName,
  transparent = false,
  children,
  ...props
}: LoadingProps) {
  return (loading &&
    <View className={classNames('app__loading', className, {transparent})}>
      <Spinner className={iconClassName} size={size} {...props} />
      {children && <Text className='h4 blink'>{children}</Text>}
    </View>
  )
}

export default React.memo(Loading)
