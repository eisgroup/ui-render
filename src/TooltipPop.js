import React from 'react'
import { Popup as Pop } from 'semantic-ui-react'

/**
 * Tooltip Component using Semantic UI Popup
 */
export default function TooltipPop ({
  title,
  children,
  ...props
}) {
  return (
    <Pop trigger={children} content={title} {...props}/>
  )
}
