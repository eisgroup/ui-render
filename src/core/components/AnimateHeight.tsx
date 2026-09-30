import classNames from '../utils/classNames'
import React from 'react'
import { STYLE } from './styles'

/** The named props are read here; the rest is spread onto the container, unfiltered (see ./domProps). */
export type AnimateHeightProps = {
  /** Used to change height for animation; absent is collapsed */
  expanded?: boolean
  /** The duration of the animation in milliseconds */
  duration?: number
  /** Css class names to add */
  className?: string
  children?: React.ReactNode
  /** Merged over the animation's own style */
  style?: React.CSSProperties
  [key: string]: unknown
}

/**
 * Wrapper component that animates height changes between collapsed (0) and expanded (auto).
 * Uses the CSS grid `grid-template-rows: 0fr → 1fr` trick so that animating to `auto` works
 * without measuring child height.
 *
 * @returns {Object} - React element
 */
export function AnimateHeight ({
  expanded,
  duration = STYLE.ANIMATION_DURATION,
  className,
  children,
  style,
  ...props
}: AnimateHeightProps) {
  return (
    <div
      className={classNames('position-relative', className)}
      style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: `grid-template-rows ${duration}ms ease`,
        ...style,
      }}
      {...props}
    >
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

export default React.memo(AnimateHeight)
