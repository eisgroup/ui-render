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
    title: PropTypes.any, // string or component to always show
    children: PropTypes.oneOfType([
      PropTypes.func,  // function to render content when expanded, receives `id` if given
      PropTypes.any,  // pre-rendered content (not recommended for performance reasons)
    ]),
    renderTitle: PropTypes.func, // function to render title
    expanded: PropTypes.bool, // whether should render as expanded
    active: PropTypes.bool, // whether to add `active` css class
    justify: PropTypes.bool, // whether should render expand icon spread out from `title`
    iconOpened: PropTypes.string, // name of icon for expanded state
    iconClosed: PropTypes.string, // name of icon for collapsed state
    onClick: PropTypes.func, // callback on click or Enter press (if `onKeyPress` not given)
    id: PropTypes.string, // argument to pass to 'onClick' callback, uses `title` if not given
    duration: PropTypes.number, // milliseconds for the animation
    className: PropTypes.string,
  }

  static defaultProps = {
    duration: ANIMATION_DURATION,
    iconOpened: 'chevron-down',
    iconClosed: 'chevron-right',
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
    if (next.expanded !== this.props.expanded) this.update(next.expanded)
  }

  handleToggleExpand = () => {
    this.update(!this.state.expanded)
  }

  update = (expand = !this.state.expanded) => {
    // New prop may match with current state
    if (expand === this.state.expanded) return

    // Expanding should be fast
    if (expand) {
      this.setState({expanded: false, changing: true}, () => {
        this.handleClick()
        this.setState({expanded: true, changing: false})
      })
    } else {
      // Collapsing has to wait for Animation
      this.setState({expanded: false, changing: true}, () => {
        this.handleClick()
        this.setTimeout(() => this.setState({changing: false}), this.props.duration)
      })
    }
  }

  handleClick = () => {
    const {onClick, id, title} = this.props
    onClick && onClick(id || String(title))
  }

  renderTitle = () => {
    const {title, renderTitle, justify = false, children, iconOpened, iconClosed} = this.props
    if (title == null && !renderTitle) return null
    const {expanded} = this.state
    const hasContent = children != null
    const Title = renderTitle ? renderTitle(title) : title
    return (
      <Text
        className={classNames('row fill-width middle padding-small', {justify})}
        onClick={hasContent && this.handleToggleExpand}
      >
        {justify && Title}
        {hasContent && iconOpened && iconClosed &&
        <Icon name={(expanded ? iconOpened : iconClosed) + ' spin-90-deg' + (expanded ? '' : '-')}/>}
        {!justify && Title}
      </Text>
    )
  }

  render () {
    const {
      id,
      title,
      onClick,
      active,
      duration,
      className,
      children,
      expanded: _,
      justify: __,
      iconClosed: ___,
      iconOpened: ____,
      renderTitle: _____,
      ...props
    } = this.props
    const {expanded, changing} = this.state
    const hasContent = children != null
    const content = hasContent && (expanded || changing) && this.content
    return (
      <View className={classNames('app__expand', className, {expanded, active})} {...props}>
        {this.renderTitle()}
        {hasContent &&
        <AnimateHeight expanded={expanded} duration={duration} className='expand__content'>{content}</AnimateHeight>
        }
      </View>
    )
  }
}
