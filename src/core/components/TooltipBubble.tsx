import classNames from '../utils/classNames'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<span>` through ./domProps (see `ViewProps`). */
export type TooltipBubbleProps = {
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
 * TooltipBubble - Pure Component: the bubble itself, which CSS reveals while its parent is hovered or
 * focused, or at once with `show`. `Tooltip` places one by its trigger, and `Slider`, `Upload` and
 * `withFormSetup`'s validation text use it directly. It was named `Tooltip` until §9.9-H6.
 */
function TooltipBubble ({top, bottom, right, left, show, className, ...props}: TooltipBubbleProps) {
  return <span
    // DOM boundary (see ./domProps): the spread lands on a generic <span>, so both lists apply.
    className={classNames('tooltip no-wrap', {top, bottom, right, left, show}, className)}
    {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)} />
}

export default React.memo(TooltipBubble)
