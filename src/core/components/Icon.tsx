import classNames from '../utils/classNames'
import React from 'react'
import { Active } from '../utils'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<i>` through ./domProps (see `ViewProps`). */
export type IconProps = {
  /** Icon class name, appended to `Active.iconClassPrefix` */
  name: string
  /** Optional, will be appended with the `pointer` class when `onClick` is given */
  className?: string
  large?: boolean
  small?: boolean
  /** Forwarded to the `<i>` */
  onClick?: React.MouseEventHandler<HTMLElement>
  [key: string]: unknown
}

/**
 * Icon - Pure Component
 */
export function Icon ({
  name,
  className,
  large,
  small,
  ...props
}: IconProps) {
  return (
    <i className={classNames(Active.iconClass, Active.iconClassPrefix + name, className, {
      large,
      small,
      pointer: props.onClick
    })}
       // DOM boundary (see ./domProps): the spread lands on an <i>. `name` is already consumed above
       // to pick the icon class, so both lists apply.
       aria-hidden='true' {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)} />
  )
}

export default React.memo(Icon)
