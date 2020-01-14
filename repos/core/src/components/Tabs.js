import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { isFunction } from '../common/utils'
import Icon from './Icon'
import ScrollView from './ScrollView'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

/**
 * Tabs - Self Contained Container.
 */
@withTimer
export default class Tabs extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object, // JSX
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        icon: PropTypes.string,
      })
    ])).isRequired, // tabs
    panels: PropTypes.arrayOf(PropTypes.any).isRequired, // content
    activeIndex: PropTypes.number,  // opened tab index
    defaultIndex: PropTypes.number, // opened tab index
    onChange: PropTypes.func, // callback when tab's activeIndex changes, receives new `activeIndex` as argument
    vertical: PropTypes.bool, // render tabs as vertical layout
    centerTabs: PropTypes.bool, // align tabs to center
    buttoned: PropTypes.bool, // style tabs as buttons
    className: PropTypes.string,
    children: PropTypes.any, // extra content to render inside Tabs
  }

  state = {
    activeIndex: this.props.activeIndex || this.props.defaultIndex || 0,
    transition: false
  }

  handleClickTab = (index) => {
    this.setState({transition: true})
    this.setTimeout(() => {
      this.setState({activeIndex: index, transition: false})
      if (this.props.onChange) this.props.onChange(index)
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {activeIndex, panels} = next
    if (activeIndex != null && activeIndex !== this.state.activeIndex) this.handleClickTab(activeIndex)

    // Handle use case when parent changes layout and tab has less panels than previously set active index
    if (this.state.activeIndex >= panels.length) this.setState({activeIndex: 0})
  }

  render () {
    const {
      vertical, buttoned, className, items, panels, children, tabsClassName, centerTabs,
      activeIndex: _, defaultIndex: __, onChange: ___,
      ...props
    } = this.props
    const {activeIndex, transition} = this.state
    const content = panels[activeIndex]
    return (
      <ScrollView
        className={classNames('tabs fade-in', className, {buttoned})}
        classNameInner='max-height' // fix to allow child ScrollViews to take 100% of available height
        {...props}
      >
        <ScrollView row={!vertical} center={centerTabs}
                    className={classNames('tabs__items no-scrollbar', tabsClassName)}>
          {items.map((tab, i) => (
            <View key={i} className={classNames('tabs__item', {active: activeIndex === i})}
                  onClick={activeIndex !== i && (() => this.handleClickTab(i))}>
              {typeof tab === 'object'
                ? (tab.icon ? <Text><Icon name={tab.icon}/>{tab.text}</Text> : tab)
                : <Text>{tab}</Text>
              }
            </View>
          ))}
        </ScrollView>
        <ScrollView fill className={classNames('tabs__content', {'fade-in': !transition})}>
          {typeof content === 'object' ? content : (isFunction(content) ? content() : <Text>{content}</Text>)}
        </ScrollView>
        {children}
      </ScrollView>
    )
  }
}
