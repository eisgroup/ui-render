import classNames from 'classnames'
import React from 'react'
import ReactAnimateHeight from 'react-animate-height'
import { ANIMATION_DURATION } from '../common/variables'

/**
 * Wrapper component that animates height changes
 *
 * @uses react-animate-height
 * @see {@link https://github.com/Stanko/react-animate-height} for further information
 * @example:
 *  <AnimateHeight expanded={this.state.isOpen[item.id]}>
 *    <Item {...item} />
 *  </AnimateHeight>
 *
 * @param {boolean} expanded - used to change height for animation
 * @param {number} [duration] - The duration of the animation
 * @param {String} [className] - css class names to add
 * @param {*} [props] - Other attributes to pass to the container
 * @returns {Object} - React element
 */
export default function AnimateHeight
  ({
     expanded,
     duration = ANIMATION_DURATION,
     className,
     ...props
   }) {
  return <ReactAnimateHeight
    className={classNames('position-relative', className)}
    duration={duration} height={expanded ? 'auto' : 0}
    {...props}
  />
}
