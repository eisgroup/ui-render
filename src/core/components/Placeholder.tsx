import classNames from '../utils/classNames'
import React from 'react'
import View from './View'

/** The named props are read here; the rest is passed to the `View` it renders. */
export type PlaceholderProps = { className?: string, children: React.ReactNode, [key: string]: unknown }

/**
 * Placeholder - Pure Component.
 */
function Placeholder ({className, ...props}: PlaceholderProps) {
  return <View
    fill
    className={classNames('bg-texture-faded full-screen middle center fade-in-up padding-largest', className)}
    {...props}
  />
}

export default React.memo(Placeholder)
