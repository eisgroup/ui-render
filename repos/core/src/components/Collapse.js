import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { removeNilValues } from '../common/utils'
import Icon from './Icon'
import Row from './Row'
import View from './View'

/**
 * Collapse / Expand - Self Contained Container.
 * @example:
 *   <Collapse
 *     toggleRender={isOpen => <Icon name={isOpen ? 'minus' : 'plus'}/>}
 *     contentRender={isOpen => (isOpen && <Text>Expanded content</Text>)}
 *   />
 *    <Collapse
 *      toggleRender={isOpen => <Icon name={isOpen ? 'minus' : 'plus'}/>}
 *      contentOpened={<Text>Expanded content</Text>}
 *      contentClosed={<Text>Closed content</Text>}
 *    />
 */
export default class Collapse extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    horizontal: PropTypes.bool,
    minSize: PropTypes.string, // min-height or min-width css property when collapsed, default is `0`
    maxSize: PropTypes.string, // max-height or max-width css property when expanded, default is `100%`
    toggleClass: PropTypes.string, // css class names
    toggleRender: PropTypes.func, // toggle render function, receives `isOpen` as argument
    toggleOpened: PropTypes.any, // toggle content to render in expanded state
    toggleClosed: PropTypes.any, // toggle content to render in collapsed state
    contentClass: PropTypes.string, // css class names
    contentRender: PropTypes.func, // content render function, receives `isOpen` as argument
    contentOpened: PropTypes.any, // content to render in expanded state, if `render()` not given
    contentClosed: PropTypes.any, // content to render in collapsed state, if `render()` not given
    className: PropTypes.string, // css class names
    style: PropTypes.object, // css styles
    children: PropTypes.any, // additional content to render inside component
  }

  static defaultProps = {
    toggleOpened: <Icon name='chevron-down'/>,
    toggleClosed: <Icon name='chevron-right'/>,
  }

  state = {
    isOpen: false,
    size: '0',
  }

  handleToggle = () => {
    const {isOpen} = this.state
    const {minSize, maxSize, contentClosed} = this.props
    const size = !isOpen ? (maxSize || '100%') : (minSize || (contentClosed ? 'min-content' : '0'))
    this.setState({ isOpen: !isOpen, size })
  }

  setOpenState = ({ isOpen, minSize, maxSize, contentClosed } = this.props) => {
    if (minSize == null && contentClosed) minSize = 'min-content'
    if (
      (isOpen !== null && isOpen !== this.state.isOpen) ||
      (!this.state.isOpen && minSize !== null && minSize !== this.state.size) ||
      (this.state.isOpen && maxSize !== null && maxSize !== this.state.size)
    ) this.setState(removeNilValues({ isOpen, size: isOpen ? maxSize : minSize }))
  }

  UNSAFE_componentWillMount () {
    this.setOpenState()
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.setOpenState(nextProps)
  }

  render () {
    const {
      toggleRender, toggleOpened, toggleClosed,
      contentRender, contentOpened, contentClosed,
      horizontal, className, style, toggleClass, contentClass, children,
    } = this.props
    const {isOpen, size} = this.state
    const toggle = toggleRender ? toggleRender(isOpen) : (isOpen ? toggleOpened : toggleClosed)
    const content = contentRender ? contentRender(isOpen) : (isOpen ? contentOpened : contentClosed)
    const contentStyle = {[horizontal ? 'maxWidth' : 'maxHeight']: size}
    const Container = horizontal ? Row : View
    return (
      <Container className={classNames('app__collapse', className, {horizontal})} style={style}>
        <View className={classNames('app__collapse__toggle', toggleClass)} onClick={this.handleToggle}>{toggle}</View>
        <View className={classNames('app__collapse__content', contentClass)} style={contentStyle}>{content}</View>
        {children}
      </Container>
    )
  }
}
