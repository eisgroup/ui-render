import React from 'react'
import { Popup as Pop } from 'semantic-ui-react'
import { isFunction } from '../utils'

/**
 * Tooltip Component using Semantic UI Popup
 */
export default function TooltipPop ({
  title,
  children,
  // Default parameter rather than `TooltipPop.defaultProps`: React 18.3 warns on defaultProps for
  // function components and React 19 removes the support.
  // Improves UX by avoiding an accidental popup when the user is already familiar with the UI.
  delay = 500,
  inverted,
  ...props
}) {
  // fix for Semantic UI issue https://github.com/Semantic-Org/Semantic-UI-React/pull/4029
  if (isFunction(title)) title = {children: title}
  return (
    <Pop inverted={inverted} trigger={children} content={title} mouseEnterDelay={delay} {...props}/>
  )
}

