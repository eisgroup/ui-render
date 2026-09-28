import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isFunction } from '../utils'
import Icon from './Icon'
import ScrollView from './ScrollView'
import Text from './Text'
import { type } from './types'
import { useTimers } from './utils'
import View from './View'

/**
 * Tabs with overridable self-managed state and overflow scrollbars, with NO engine coupling.
 *
 * Renamed from `Tabs` on 2026-09-22 (§9.9-H6). There were two files called `Tabs.js` and no way to
 * tell from a grep which one ships: this one, and `pages/main/components/Tabs.js`. They are not
 * interchangeable — the engine's copy is the older of the two and has kept evolving, adding
 * `normalizeTabIndex`, `renderTab`, `currencyCode` injection and a third argument to `setTab`, about
 * 99 lines of difference. It is the one `mapper.js` registers for `view: 'Tabs'`.
 *
 * THIS file reaches nothing from the library entry. Its only importer is the demo's `NavTabs.jsx`.
 * The name says what distinguishes it — no engine coupling — rather than where it happens to be
 * used, because by its props it is a perfectly general tabs component and could be used anywhere.
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a `@withTimer` PureComponent whose
 * `UNSAFE_componentWillReceiveProps` ran on every parent render. That still happens, detected by a
 * new props object:
 *  - a controlled `activeIndex` that differs from the active tab is applied as the lifecycle applied
 *    it, through `setTab` with `transitionUpdate`. The state it sets is set during render; what it
 *    also did — start the 50 ms transition timer, or report the change at once — happens in an
 *    effect, a commit later, since render must not;
 *  - an active index the items no longer have goes back to the first tab.
 * One thing changed, and a test pins it. The lifecycle compared the prop with the COMMITTED active
 * tab, so a parent that followed a click with that tab as its `activeIndex` — the demo's `NavTabs`
 * does, by navigating — started a second transition and was told about the click twice, and the demo
 * pushed every tab's URL onto the history twice. Compared with the current state, it is told once.
 *
 * Function content and children receive what the class passed as `this`: one object for the
 * component's lifetime, kept current, with `props`, `state`, `tabs`, `contents` and `setTab`.
 * Not memoised, although the class was a PureComponent: `React.memo` would skip a parent render with
 * equal props, and the lifecycle ran even then.
 */
export default function StandaloneTabs (props) {
  const {
    vertical, buttoned, items, children, centerTabs,
    className, classNameTabs, classNameContent, styleTabs, styleContent,
    activeIndex: activeIndexProp, defaultIndex, onChange: _, transitionUpdate,
    ...rest
  } = props
  const [state, setState] = useState(() => ({
    activeIndex: Math.max(+(activeIndexProp || defaultIndex) || 0, 0),
    transition: false,
  }))
  const update = patch => setState(current => ({...current, ...patch}))
  const timers = useTimers()

  // What a transition's timer reads when it fires: the latest props, as `this.props` was.
  const latest = useRef(null)
  latest.current = props
  const report = (activeIndex) => {
    const {onChange} = latest.current
    if (onChange) onChange(activeIndex)
  }
  const updateTab = (activeIndex) => {
    update({activeIndex, transition: false})
    report(activeIndex)
  }
  const setTab = (activeIndex, transition = true) => {
    if (transition) {
      update({transition: true})
      timers.setTimeout(() => updateTab(activeIndex), 50) // 50 ms is needed to allow full rendering so css transition can take effect
    } else {
      updateTab(activeIndex)
    }
  }

  // A controlled `activeIndex` the render below applied, and what is still owed for it: the
  // transition's timer, or the report of an immediate change.
  const [propsSeen, setPropsSeen] = useState(props)
  const [owed, setOwed] = useState(null)
  if (props !== propsSeen) {
    setPropsSeen(props)
    if (activeIndexProp != null && +activeIndexProp !== state.activeIndex) {
      const target = +activeIndexProp
      const transition = transitionUpdate === undefined ? true : transitionUpdate
      update(transition ? {transition: true} : {activeIndex: target, transition: false})
      setOwed({target, transition})
    }

    // Handle use case when parent changes layout and tab has less panels than previously set active index
    if (state.activeIndex >= items.length) update({activeIndex: 0})
  }
  useEffect(() => {
    if (!owed) return
    if (owed.transition) timers.setTimeout(() => updateTab(owed.target), 50)
    else report(owed.target)
    // Once per controlled change, so `owed` alone. `updateTab` is recreated every render, and listing
    // it would run this again on every render; it reads the latest props itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owed])

  const tabs = useMemo(() => items.map(({tab}) => tab), [items])
  const contents = useMemo(() => items.map(({content}) => content), [items])

  const handle = useRef(null)
  if (handle.current === null) handle.current = {}
  Object.assign(handle.current, {props, state, tabs, contents, setTab})

  const {activeIndex, transition} = state
  const content = contents[activeIndex]
  return (
    // In Safari, the entire .tabs container scrolls, but in Chrome, only .tabs__content scrolls
    // the solution is to enforce `min-height: initial` for this wrapper in `classNameInner`
    <ScrollView // ScrollView is needed so inner content scroll does not overlap tabs, and has correct height
      className={classNames('tabs fade-in', className, {buttoned})}
      classNameInner="max-height" // fix to allow child ScrollViews to take 100% of available height
      {...rest}
    >
      <ScrollView row={!vertical} center={centerTabs}
                  className={classNames('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}>
        {tabs.map((tab, i, allTabs) => (
          <View key={i} className={classNames('tabs__item', {active: activeIndex === i && allTabs.length > 1})}
                onClick={activeIndex !== i ? (() => setTab(i)) : undefined}>
            {typeof tab === 'object'
              ? (tab.icon ? <Text><Icon name={tab.icon}/>{tab.text}</Text> : tab)
              : <Text>{tab}</Text>
            }
          </View>
        ))}
      </ScrollView>
      <ScrollView fill className={classNames('tabs__content', {'fade-in': !transition}, classNameContent)}
                  style={styleContent}>
        {typeof content === 'object' ? content : (isFunction(content) ? content(handle.current) : <Text>{content}</Text>)}
      </ScrollView>
      {isFunction(children) ? children(handle.current) : children}
    </ScrollView>
  )
}

StandaloneTabs.propTypes = {
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
  classNameContent: PropTypes.string,
  styleTabs: PropTypes.object,
  styleContent: PropTypes.object,
}
