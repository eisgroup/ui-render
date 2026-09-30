import classNames from '../utils/classNames'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<span>` through ./domProps (see `ViewProps`). */
export type TooltipProps = {
  /** Placement, each a css class of its own name */
  top?: boolean
  bottom?: boolean
  right?: boolean
  left?: boolean
  /** Shows the bubble at once, without its parent hovered or focused */
  show?: boolean
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * Tooltip - Pure Component
 */
export function Tooltip ({top, bottom, right, left, show, className, ...props}: TooltipProps) {
  return <span
    // DOM boundary (see ./domProps): the spread lands on a generic <span>, so both lists apply.
    className={classNames('tooltip no-wrap', {top, bottom, right, left, show}, className)}
    {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)} />
}

export default React.memo(Tooltip)
