import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, useState } from 'react'
import AnimateHeight from './AnimateHeight'
import Icon from './Icon'
import Text from './Text'
import View from './View'

/**
 * Expandable Row - Pure Component.
 *
 * @param {String|Object} title - string or component to always show
 * @param {String} [id] - argument to pass to 'onClick' callback, uses `title` if not given
 * @param {String} [children] - content to render when expanded
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [expanded] - whether should render as expanded row
 * @param {Boolean} [hasIcon] - whether should render expand icon
 * @param {Boolean} [justify] - whether should render expand icon spread out from `title`
 * @param {Boolean} [active] - whether should render as active row
 * @param {String} [className] - optional, will be prepended to wrapper
 * @param {*} props - other attributes to pass to component
 * @returns {Object} - React Component
 */
export default function Expand
  ({
    id,
    title,
    expanded: isOpen = false,
    active = false,
    onClick,
    hasIcon = true,
    justify = false,
    children,
    className,
    ...props
  }) {
  const [expanded, setExpand] = useState(isOpen)
  const hasContent = !!children
  return (
    <View className={classNames('app__expand fade-in-down', className, {expanded, active})} {...props}>
      <Text
        className={classNames('row fill-width middle padding-small', {justify})}
        onClick={hasContent && (() => {
          setExpand(!expanded)
          onClick && onClick(this, id || String(title))
        })}
      >
        {justify && title}
        {hasContent && hasIcon && <Icon name={'chevron-' + (expanded ? 'down' : 'right')}/>}
        {!justify && title}
      </Text>
      {hasContent && <AnimateHeight expanded={expanded} className='margin-left'>{children}</AnimateHeight>}
    </View>
  )
}

Expand.propTypes = {
  title: PropTypes.any.isRequired,
  id: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  hasIcon: PropTypes.bool,
  justify: PropTypes.bool,
  onClick: PropTypes.func
}

Expand.Class = class extends Component {
  render () {
    return <Expand {...this.props} />
  }
}
