import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { isFunction } from 'utils-pack'
import Icon from './Icon'
import ScrollView from './ScrollView'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

/**
 * Tabs - Self Contained Container.
 */
@withTimer
export default class Tabs extends PureComponent {
  static propTypes = {
    // Tab Titles - clickable buttons
    tabs: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object, // JSX
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        icon: PropTypes.string,
      })
    ])).isRequired, // tabs
    // Tab Contents - matching index of `tabs`
    panels: PropTypes.arrayOf(PropTypes.any).isRequired,
    // Opened tab index (controlled)
    activeIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // Opened tab index initially (uncontrolled)
    defaultIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // Callback when tab's activeIndex changes, receives new `activeIndex` as argument
    onChange: PropTypes.func,
    // Render tabs as vertical layout
    vertical: PropTypes.bool,
    // Align tabs to center
    centerTabs: PropTypes.bool,
    // Style tabs as buttons
    buttoned: PropTypes.bool,
    // Extra content to render inside Tabs
    children: PropTypes.any,
    className: PropTypes.string,
    classNameTabs: PropTypes.string,
    classNamePanels: PropTypes.string,
    styleTabs: PropTypes.object,
    stylePanels: PropTypes.object,
  }

  state = {
    activeIndex: Math.max(+(this.props.activeIndex || this.props.defaultIndex) || 0, 0),
    transition: false
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {activeIndex, panels} = next
    if (activeIndex != null && +activeIndex !== this.state.activeIndex) this.handleClickTab(+activeIndex)

    // Handle use case when parent changes layout and tab has less panels than previously set active index
    if (this.state.activeIndex >= panels.length) this.setState({activeIndex: 0})
  }

  handleClickTab = (index) => {
    this.setState({transition: true})
    this.setTimeout(() => {
      this.setState({activeIndex: index, transition: false})
      if (this.props.onChange) this.props.onChange(index)
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }

  render () {
    const {
      vertical, buttoned, tabs, panels, children, centerTabs,
      className, classNameTabs, classNamePanels, styleTabs, stylePanels,
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
                    className={classNames('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}>
          {tabs.map((tab, i) => (
            <View key={i} className={classNames('tabs__item', {active: activeIndex === i && tabs.length > 1})}
                  onClick={activeIndex !== i && (() => this.handleClickTab(i))}>
              {typeof tab === 'object'
                ? (tab.icon ? <Text><Icon name={tab.icon}/>{tab.text}</Text> : tab)
                : <Text>{tab}</Text>
              }
            </View>
          ))}
        </ScrollView>
        <ScrollView fill className={classNames('tabs__content', {'fade-in': !transition}, classNamePanels)}
                    style={stylePanels}>
          {typeof content === 'object' ? content : (isFunction(content) ? content() : <Text>{content}</Text>)}
        </ScrollView>
        {isFunction(children) ? children(activeIndex) : children}
      </ScrollView>
    )
  }
}
