import React, { PureComponent } from 'react'
import { cn, PropTypes } from '../../../components'
import Icon from '../../../components/Icon'
import ScrollView from '../../../components/ScrollView'
import Text from '../../../components/Text'
import { type } from '../../../components/types'
import { withTimer } from '../../../components/utils'
import View from '../../../components/View'
import { isEqual, isFunction } from '../../../utils'

type.Node = PropTypes.object

function normalizeTabIndex (value, items) {
  const index = Math.max(+value || 0, 0)
  return index < items.length ? index : 0
}

function renderTab (tab) {
  if (React.isValidElement(tab)) return tab
  if (tab && typeof tab === 'object') {
    return <Text>{tab.icon && <Icon name={tab.icon}/>}{tab.text}</Text>
  }
  return <Text>{tab}</Text>
}

/**
 * Tabs Component with overridable self-managed state and overflow scrollbars.
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
    // Extra content to render after Tabs content
    children: PropTypes.any,
    className: PropTypes.string,
    classNameTabs: PropTypes.string,
    classNameContent: PropTypes.string,
    styleTabs: PropTypes.object,
    styleContent: PropTypes.object,
    currencyCode: PropTypes.string,

    // UI Render specific
    // Extra content to render inside Tabs
    childrenBeforeTabs: PropTypes.any,
    childrenAfterTabs: PropTypes.any,
  }

  state = {
    activeIndex: normalizeTabIndex(
      this.props.activeIndex != null ? this.props.activeIndex : this.props.defaultIndex,
      this.props.items
    ),
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
    const itemsChanged = !isEqual(items, this.props.items)
    if (itemsChanged) {
      this._tabs = this._contents = null
      // @Note: no `clearTimer()` here. The mapper rebuilds every item with a fresh `Render.bind(...)`
      // closure on each render, so `itemsChanged` is always true when driven by UI Render — cancelling
      // would swallow the click of anyone who re-renders inside the 50 ms transition window.
      // `setTab` re-validates the target index when the timer fires instead.
    }

    if (activeIndex != null) {
      const nextIndex = normalizeTabIndex(activeIndex, items)
      if (nextIndex !== this.state.activeIndex) {
        const canTransition = next.transitionUpdate === true && this.state.activeIndex < items.length
        this.setTab(nextIndex, canTransition)
      } else if (itemsChanged && this.state.transition) {
        this.setState({transition: false})
      }
    // Handle use case when parent changes layout and tab has less panels than previously set active index
    } else if (this.state.activeIndex >= items.length) {
      this.setState({activeIndex: 0, transition: false})
    } else if (itemsChanged && this.state.transition) {
      this.setState({transition: false})
    }
  }

  setTab = (activeIndex, transition = true) => {
    this.clearTimer()
    const updateTab = () => {
      // Re-validate against the items current at fire time — they may have shrunk while the
      // transition was pending, which is what the cancelled `clearTimer()` used to guard against.
      const index = normalizeTabIndex(activeIndex, this.props.items)
      this.setState({activeIndex: index, transition: false})
      if (this.props.onChange) this.props.onChange(index)
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
      vertical, buttoned, items, children, childrenBeforeTabs, childrenAfterTabs, centerTabs,
      className, classNameTabs, classNameContent, styleTabs, styleContent, currencyCode,
      activeIndex: _, defaultIndex: __, onChange: ___, transitionUpdate: ____,
      ...props
    } = this.props
    const {activeIndex, transition} = this.state
    const content = this.contents[activeIndex]

    return (
      // In Safari, the entire .tabs container scrolls, but in Chrome, only .tabs__content scrolls
      // the solution is to enforce `min-height: initial` for this wrapper in `classNameInner`
      <ScrollView // ScrollView is needed so inner content scroll does not overlap tabs, and has correct height
        className={cn('tabs fade-in', className, {buttoned})}
        classNameInner="max-height" // fix to allow child ScrollViews to take 100% of available height
        {...props}
      >
        <ScrollView row={!vertical} center={centerTabs}
                    className={cn('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}>
          {isFunction(childrenBeforeTabs) ? childrenBeforeTabs(this) : childrenBeforeTabs}
          {this.tabs.map((tab, i, tabs) => (
            <View key={i} className={cn('tabs__item', {active: activeIndex === i && tabs.length > 1})}
                  onClick={activeIndex !== i ? (() => this.setTab(i)) : undefined}>
              {renderTab(tab)}
            </View>
          ))}
          {isFunction(childrenAfterTabs) ? childrenAfterTabs(this) : childrenAfterTabs}
        </ScrollView>
        <ScrollView fill className={cn('tabs__content', {'fade-in': !transition}, classNameContent)}
                    style={styleContent}>
          {typeof content === 'object' ? content : (isFunction(content) ? content(this) : <Text>{content}</Text>)}
        </ScrollView>
        {isFunction(children) ? children(this) : children}
      </ScrollView>
    )
  }
}
