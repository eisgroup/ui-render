import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { isEqual, isFunction } from 'utils-pack'
import Icon from './Icon'
import ScrollView from './ScrollView'
import Text from './Text'
import { type } from './types'
import { withTimer } from './utils'
import View from './View'

/**
 * Tabs - Self Contained Container.
 */
@withTimer
export default class Tabs extends PureComponent {
  static propTypes = {
    items: type.ListOf(type.Of({
      // Tab Title - clickable buttons
      tab: type.OneOf(
        type.String,
        type.Number,
        type.Node, // JSX
        type.Of({
          text: PropTypes.string.isRequired,
          icon: PropTypes.string,
        })
      ).isRequired,
      // Tab Content
      content: type.Any.isRequired,
    })).isRequired,
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
    // Whether to enable transition during force update via props
    transitionUpdate: PropTypes.bool,
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

  get tabs () {
    return this._tabs || (this._tabs = this.props.items.map(({tab}) => tab))
  }

  get contents () {
    return this._contents || (this._contents = this.props.items.map(({content}) => content))
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {activeIndex, items} = next
    if (!isEqual(items, this.props.items)) this._tabs = this._contents = null
    if (activeIndex != null && +activeIndex !== this.state.activeIndex) this.setTab(+activeIndex, next.transitionUpdate)

    // Handle use case when parent changes layout and tab has less panels than previously set active index
    if (this.state.activeIndex >= items.length) this.setState({activeIndex: 0})
  }

  setTab = (activeIndex, transition = true) => {
    const updateTab = () => {
      this.setState({activeIndex, transition: false})
      if (this.props.onChange) this.props.onChange(activeIndex)
    }
    if (transition) {
      this.setState({transition: true})
      this.setTimeout(updateTab, 50) // 50 ms is needed to allow full rendering so css transition can take effect
    } else {
      updateTab()
    }
  }

  render () {
    const {
      vertical, buttoned, items, children, centerTabs,
      className, classNameTabs, classNamePanels, styleTabs, stylePanels,
      activeIndex: _, defaultIndex: __, onChange: ___, transitionUpdate: ____,
      ...props
    } = this.props
    const {activeIndex, transition} = this.state
    const content = this.contents[activeIndex]
    return (
      <ScrollView
        className={classNames('tabs fade-in', className, {buttoned})}
        classNameInner="max-height" // fix to allow child ScrollViews to take 100% of available height
        {...props}
      >
        <ScrollView row={!vertical} center={centerTabs}
                    className={classNames('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}>
          {this.tabs.map((tab, i, tabs) => (
            <View key={i} className={classNames('tabs__item', {active: activeIndex === i && tabs.length > 1})}
                  onClick={activeIndex !== i && (() => this.setTab(i))}>
              {typeof tab === 'object'
                ? (tab.icon ? <Text><Icon name={tab.icon}/>{tab.text}</Text> : tab)
                : <Text>{tab}</Text>
              }
            </View>
          ))}
        </ScrollView>
        <ScrollView fill className={classNames('tabs__content', {'fade-in': !transition}, classNamePanels)}
                    style={stylePanels}>
          {typeof content === 'object' ? content : (isFunction(content) ? content(this) : <Text>{content}</Text>)}
        </ScrollView>
        {isFunction(children) ? children(this) : children}
      </ScrollView>
    )
  }
}
