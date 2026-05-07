import classNames from 'ui-utils-pack/classNames'
import React from 'react'
import { STYLE } from './styles'

/**
 * Wrapper component that animates height changes between collapsed (0) and expanded (auto).
 * Uses the CSS grid `grid-template-rows: 0fr → 1fr` trick so that animating to `auto` works
 * without measuring child height.
 *
 * @param {boolean} expanded - used to change height for animation
 * @param {number} [duration] - The duration of the animation in milliseconds
 * @param {String} [className] - css class names to add
 * @param {*} [props] - Other attributes to pass to the container
 * @returns {Object} - React element
 */
export function AnimateHeight ({
  expanded,
  duration = STYLE.ANIMATION_DURATION,
  className,
  children,
  style,
  ...props
}) {
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
