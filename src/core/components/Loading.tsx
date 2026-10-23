import classNames from '../utils/classNames'
import React from 'react'
import Spinner from './Spinner'
import type { SpinnerProps } from './Spinner'
import Text from './Text'
import View from './View'
import type { Translate } from '../utils/_envs'
import type { PhraseMessage } from '../utils/phrases'

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
  /** Optional content to render, which its `Text` translates with `translate` */
  children?: React.ReactNode | PhraseMessage
  /** What translates `children`; the `Text`'s own default without one */
  translate?: Translate
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
  translate,
  ...props
}: LoadingProps) {
  return (loading &&
    <View className={classNames('app__loading', className, {transparent})}>
      <Spinner className={iconClassName} size={size} {...props} />
      {children && <Text className='h4 blink' translate={translate}>{children}</Text>}
    </View>
  )
}

export default React.memo(Loading)
