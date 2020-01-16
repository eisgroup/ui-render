import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { isFunction } from '../common/utils'
import { ANIMATION_DURATION } from '../common/variables'
import AnimateHeight from './AnimateHeight'
import Icon from './Icon'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

/**
 * Expandable Row - Pure Component.
 */
@withTimer
export default class Expand extends Component {
  static propTypes = {
    title: PropTypes.any.isRequired, // string or component to always show
    children: PropTypes.oneOfType([
      PropTypes.func,  // function to render content when expanded, receives `id` if given
      PropTypes.any,  // pre-rendered content (not recommended for performance reasons)
    ]),
    expanded: PropTypes.bool, // whether should render as expanded
    active: PropTypes.bool, // whether to add `active` css class
    hasIcon: PropTypes.bool, // whether should render expand icon
    justify: PropTypes.bool, // whether should render expand icon spread out from `title`
    onClick: PropTypes.func, // callback on click or Enter press (if `onKeyPress` not given)
    id: PropTypes.string, // argument to pass to 'onClick' callback, uses `title` if not given
    animateDuration: PropTypes.number, // milliseconds
    className: PropTypes.string,
  }

  static defaultProps = {
    animateDuration: ANIMATION_DURATION,
  }

  state = {
    expanded: this.props.expanded,
    changing: false,
  }

  get content () {
    if (this._content) return this._content
    const {children} = this.props
    return (this._content = isFunction(children) ? children() : children)
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (next.children !== this.props.children) this._content = null
  }

  handleToggleExpand = () => {
    // Expanding should be fast
    if (!this.state.expanded) {
      this.setState({changing: true}, () => {
        this.handleClick()
        this.setState({expanded: true, changing: false})
      })
    } else {
      // Collapsing has to wait for Animation
      this.setState({expanded: false, changing: true}, () => {
        this.handleClick()
        this.setTimeout(() => this.setState({changing: false}), this.props.animateDuration)
      })
    }
  }

  handleClick = () => {
    const {onClick, id, title} = this.props
    onClick && onClick(id || String(title))
  }

  render () {
    const {
      id,
      title,
      onClick,
      active = false,
      hasIcon = true,
      justify = false,
      animateDuration,
      className,
      children,
      expanded: _,
      ...props
    } = this.props
    const {expanded, changing} = this.state
    const hasContent = !!children
    const content = hasContent && (expanded || changing) && this.content
    return (
      <View className={classNames('app__expand fade-in-down', className, {expanded, active})} {...props}>
        <Text
          className={classNames('row fill-width middle padding-small', {justify})}
          onClick={hasContent && this.handleToggleExpand}
        >
          {justify && title}
          {hasContent && hasIcon &&
          <Icon name={'chevron-' + (expanded ? 'down' : 'right') + ' spin-90-deg' + (expanded ? '' : '-')}/>}
          {!justify && title}
        </Text>
        {hasContent &&
        <AnimateHeight expanded={expanded} duration={animateDuration} className='margin-left'>{content}</AnimateHeight>
        }
      </View>
    )
  }
}
