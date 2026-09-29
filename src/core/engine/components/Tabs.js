import React, { useEffect, useRef, useState } from 'react'
import { cn, PropTypes } from '../../components'
import Icon from '../../components/Icon'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import { type } from '../../components/types'
import { useTimers } from '../../components/utils'
import View from '../../components/View'
import { isEqual, isFunction } from '../../utils'

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

const split = items => ({tabs: items.map(({tab}) => tab), contents: items.map(({content}) => content)})

/**
 * Tabs Component with overridable self-managed state and overflow scrollbars.
 *
 * A FUNCTION COMPONENT since §9.3 step 6, and the last of the `@withTimer` classes. Its
 * `UNSAFE_componentWillReceiveProps` ran on every parent render, and still does, detected by a new
 * props object:
 *  - a controlled `activeIndex` that differs from the active tab wins: at once, or after the 50 ms
 *    transition when `transitionUpdate` is set. Its state is set during render; what the lifecycle
 *    also did — start the transition's timer, or report the change at once — happens in an effect,
 *    a commit later, since render must not;
 *  - it also supersedes a click still in its transition. The class cleared that timer; here the
 *    click notices when it fires and drops itself, which keeps render free of side effects;
 *  - uncontrolled, an active index the items no longer have goes back to the first tab;
 *  - items that changed by value refresh the cached tabs and contents, and end the transition's
 *    faded state, but not a pending click. Under UI Render that is every render, since the mapper
 *    rebuilds the items each time.
 * One thing changed, and a test pins it. The lifecycle compared a controlled `activeIndex` with the
 * COMMITTED active tab, so a parent that followed a click by passing that tab back as its
 * `activeIndex` was told about the click twice. Compared with the current state, it is told once.
 *
 * Function slots, content and children receive what the class passed as `this`: one object for the
 * component's lifetime, kept current, with `props`, `state`, `tabs`, `contents` and `setTab`.
 * Not memoised, although the class was a PureComponent: `React.memo` would skip a parent render with
 * equal props, and the lifecycle ran even then.
 */
export default function Tabs (props) {
  const {
    vertical, buttoned, items, children, childrenBeforeTabs, childrenAfterTabs, centerTabs,
    className, classNameTabs, classNameContent, styleTabs, styleContent, currencyCode,
    activeIndex: activeIndexProp, defaultIndex, onChange: _, transitionUpdate,
    ...rest
  } = props
  const [state, setState] = useState(() => ({
    activeIndex: normalizeTabIndex(activeIndexProp != null ? activeIndexProp : defaultIndex, items),
    transition: false,
  }))
  const update = patch => setState(current => ({...current, ...patch}))
  const timers = useTimers()

  // The tabs and contents, rebuilt only when the items change by value, as the class's getters were.
  const cache = useRef(null)
  if (cache.current === null) cache.current = split(items)

  // What a controlled `activeIndex` still owes once the render below has applied it: the
  // transition's timer, or the report of an immediate change. `overrides` counts the times it has
  // taken precedence, which is how a click in its transition finds out that it lost.
  const [propsSeen, setPropsSeen] = useState(props)
  const [overrides, setOverrides] = useState(0)
  const [owed, setOwed] = useState(null)
  if (props !== propsSeen) {
    setPropsSeen(props)
    const itemsChanged = !isEqual(items, propsSeen.items)
    if (itemsChanged) cache.current = split(items)
    if (activeIndexProp != null) {
      const target = normalizeTabIndex(activeIndexProp, items)
      if (target !== state.activeIndex) {
        const transition = transitionUpdate === true && state.activeIndex < items.length
        setOverrides(overrides + 1)
        update(transition ? {transition: true} : {activeIndex: target, transition: false})
        setOwed({target, transition})
      } else if (itemsChanged && state.transition) {
        update({transition: false})
      }
    // Handle use case when parent changes layout and tab has less panels than previously set active index
    } else if (state.activeIndex >= items.length) {
      update({activeIndex: 0, transition: false})
    } else if (itemsChanged && state.transition) {
      update({transition: false})
    }
  }

  // What a timer reads when it fires: the latest props, as `this.props` was, and the overrides so far.
  const latest = useRef(null)
  latest.current = {props, overrides}
  const report = (activeIndex) => {
    const {onChange} = latest.current.props
    if (onChange) onChange(activeIndex)
  }
  const updateTab = (activeIndex) => {
    update({activeIndex, transition: false})
    report(activeIndex)
  }
  // The tab changes after the transition, normalised against the items current at fire time.
  const scheduleTab = (activeIndex) => {
    timers.clear()
    const overridesAtStart = latest.current.overrides
    timers.setTimeout(() => {
      const {props: {items: currentItems}, overrides: currentOverrides} = latest.current
      if (currentOverrides === overridesAtStart) updateTab(normalizeTabIndex(activeIndex, currentItems))
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }
  const setTab = (activeIndex, transition = true, items = latest.current.props.items) => {
    if (transition) {
      update({transition: true})
      scheduleTab(activeIndex)
    } else {
      timers.clear()
      updateTab(normalizeTabIndex(activeIndex, items))
    }
  }
  useEffect(() => {
    if (!owed) return
    if (owed.transition) scheduleTab(owed.target)
    else report(owed.target)
    // Once per controlled change, so `owed` alone. The helpers are recreated every render, and
    // listing them would run this again on every render; they read the latest props themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owed])

  const {tabs, contents} = cache.current
  const handle = useRef(null)
  if (handle.current === null) handle.current = {}
  Object.assign(handle.current, {props, state, tabs, contents, setTab})

  const {activeIndex, transition} = state
  const content = contents[activeIndex]
  return (
    // In Safari, the entire .tabs container scrolls, but in Chrome, only .tabs__content scrolls
    // the solution is to enforce `min-height: initial` for this wrapper in `classNameInner`
    <ScrollView // ScrollView is needed so inner content scroll does not overlap tabs, and has correct height
      className={cn('tabs fade-in', className, {buttoned})}
      classNameInner="max-height" // fix to allow child ScrollViews to take 100% of available height
      {...rest}
    >
      <ScrollView row={!vertical} center={centerTabs}
                  className={cn('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}>
        {isFunction(childrenBeforeTabs) ? childrenBeforeTabs(handle.current) : childrenBeforeTabs}
        {tabs.map((tab, i, allTabs) => (
          <View key={i} className={cn('tabs__item', {active: activeIndex === i && allTabs.length > 1})}
                onClick={activeIndex !== i ? (() => setTab(i)) : undefined}>
            {renderTab(tab)}
          </View>
        ))}
        {isFunction(childrenAfterTabs) ? childrenAfterTabs(handle.current) : childrenAfterTabs}
      </ScrollView>
      <ScrollView fill className={cn('tabs__content', {'fade-in': !transition}, classNameContent)}
                  style={styleContent}>
        {typeof content === 'object' ? content : (isFunction(content) ? content(handle.current) : <Text>{content}</Text>)}
      </ScrollView>
      {isFunction(children) ? children(handle.current) : children}
    </ScrollView>
  )
}

Tabs.propTypes = {
  items: type.ListOf(type.Of({
    // Tab Title - clickable buttons. Optional: tabs hidden with `classNameTabs` and driven by
    // `activeIndex` need none (the demo's Dynamic Layout), and meta.schema.json does not require one.
    tab: type.OneOf(
      type.String,
      type.Number,
      type.Node, // JSX
      type.Of({
        text: PropTypes.string.isRequired,
        icon: PropTypes.string,
      })
    ),
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
