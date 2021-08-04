import React from 'react'
import { Popup as Pop } from 'semantic-ui-react'
import { isFunction } from 'utils-pack'

/**
 * Tooltip Component using Semantic UI Popup
 */
export default function TooltipPop ({
  title,
  children,
  delay = 500, // improve UX by avoiding accidental popup when use is already familiar with the UI
  inverted = true,
  ...props
}) {
  // fix for Semantic UI issue https://github.com/Semantic-Org/Semantic-UI-React/pull/4029
  if (isFunction(title)) title = {children: title}
  return (
    <Pop inverted={inverted} trigger={children} content={title} mouseEnterDelay={delay} {...props}/>
  )
}
