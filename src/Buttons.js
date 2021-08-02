import classNames from 'classnames'
import React from 'react'
import { tooltipProps } from 'utils/components'
import Button from './Button'
import Icon from './Icon'
import Row from './Row'
import Text from './Text'
import TooltipPop from './TooltipPop'
import { type } from './types'
import View from './View'

/**
 * Group of Buttons, similar to Tabs in Buttoned Style with support for Tooltips
 *
 * Note:
 *  - To have two TooltipPops over a button (one for dropdown menu, another as tooltip),
 *    attach the extra tooltip to <span class="position-fill"/> inside button,
 *    this way we do not change HTML markup for buttons (to style border radius),
 *    and dropdown matches exact button position (only extra tooltip has border offset).
 *
 *  - To have nested dropdown menu buttons, use `dropdownPopup` props for `tooltip` prop
 */
export function Buttons ({items, className, vertical, children, ...props}) {
  const Container = vertical ? View : Row
  return (
    /* add `middle` or `center` class so buttons do not take full height/width */
    <Container className={classNames('buttons', {vertical}, className)} {...props}>
      {items.map(({icon, children, tooltip, tooltipInner, active, className, ...btn}, i) => {
        const button = <Button key={icon || i} className={classNames(className, {active})} {...btn}>
          {icon && <Icon name={icon}/>}{children}
          {tooltipInner &&
          <TooltipPop {...tooltipProps(tooltipInner)}><Text className="position-fill" tabIndex={-1}/></TooltipPop>}
        </Button>

        return tooltip
          ? <TooltipPop
            key={icon || i} {...tooltipProps(tooltip, vertical && {position: 'right center'})}>{button}</TooltipPop>
          : button
      })}
      {children}
    </Container>
  )
}

Buttons.propTypes = {
  // List of each Button props
  items: type.ListOf(type.Of({
    icon: type.String,
    children: type.Any,
    active: type.Boolean,
    tooltip: type.PrimitiveOrObject,
    // second tooltip for <span/> inside each button
    tooltipInner: type.PrimitiveOrObject,
    // ...other <Button/> props
  })).isRequired,
  // Whether to render Buttons vertically
  vertical: type.Boolean,
  // Extra inner content to render after buttons
  children: type.Any,
  // ...other Container props
}

export default React.memo(Buttons)
