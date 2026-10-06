import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../../components'
import Icon from '../../components/Icon'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import { useTimers } from '../../components/utils'
import View from '../../components/View'
import { isEqual, isFunction } from '../../utils'

/** A tab's title, `{text, icon}` as an object; a JSX element renders as it is. */
type TitleObject = { text?: React.ReactNode, icon?: string }

/** A tab title: anything React renders, or `{text, icon}`. */
export type TabTitle = React.ReactNode | TitleObject

/** What function slots, content and children receive: one object for the component's lifetime, kept current. */
export type TabsHandle = {
  props: TabsProps
  state: TabsState
  tabs: TabTitle[]
  contents: TabContent[]
  setTab: (activeIndex: number, transition?: boolean, items?: TabItem[]) => void
}

/** A tab's content; a function is called with the handle. */
export type TabContent = React.ReactNode | ((handle: TabsHandle) => React.ReactNode)

/** Content around the tabs; a function is called with the handle. */
type TabsSlot = React.ReactNode | ((handle: TabsHandle) => React.ReactNode)

export type TabItem = {
  /**
   * The clickable title. Optional: tabs hidden with `classNameTabs` and driven by `activeIndex`
   * need none (the demo's Dynamic Layout), and meta.schema.json does not require one.
   */
  tab?: TabTitle
  content: TabContent
}

/** The named props are read here; the rest is passed to the outer `ScrollView`. */
export type TabsProps = {
  items: TabItem[]
  /** Opened tab index (controlled) */
  activeIndex?: number | string
  /** Opened tab index initially (uncontrolled) */
  defaultIndex?: number | string
  /** Callback when tab's activeIndex changes, receives new `activeIndex` as argument */
  onChange?: (activeIndex: number) => void
  /** Render tabs as vertical layout */
  vertical?: boolean
  /** Align tabs to center */
  centerTabs?: boolean
  /** Style tabs as buttons */
  buttoned?: boolean
  /** Whether to enable transition during force update via props */
  transitionUpdate?: boolean
  /** Extra content to render after Tabs content */
  children?: TabsSlot
  /** UI Render specific: extra content to render inside the tabs bar, before the tabs */
  childrenBeforeTabs?: TabsSlot
  /** UI Render specific: extra content to render inside the tabs bar, after the tabs */
  childrenAfterTabs?: TabsSlot
  className?: string
  classNameTabs?: string
  classNameContent?: string
  styleTabs?: React.CSSProperties
  styleContent?: React.CSSProperties
  /** Not read: kept out of the props the outer `ScrollView` receives */
  currencyCode?: string
  [key: string]: unknown
}

type TabsState = { activeIndex: number, transition: boolean }

function normalizeTabIndex (value: number | string | undefined, items: unknown[]) {
  // A cast: an absent index is `+undefined`, NaN, which `|| 0` turns into 0, as it did.
  const index = Math.max(+(value as number | string) || 0, 0)
  return index < items.length ? index : 0
}

function renderTab (tab: TabTitle | undefined) {
  if (React.isValidElement(tab)) return tab
  if (tab && typeof tab === 'object') {
    // A cast, not a guard: an object that is not an element is read as `{text, icon}`, as it was.
    const titled = tab as TitleObject
    return <Text>{titled.icon && <Icon name={titled.icon}/>}{titled.text}</Text>
  }
  return <Text>{tab}</Text>
}

const split = (items: TabItem[]) => ({tabs: items.map(({tab}) => tab), contents: items.map(({content}) => content)})

/**
 * The tab a key moves to, by the WAI-ARIA Tabs pattern: the arrows of the bar's own direction step
 * through the tabs and wrap around, and Home and End go to the first and the last. `null` for any other key.
 */
export function tabTarget (key: string, current: number, count: number, vertical?: boolean): number | null {
  if (key === (vertical ? 'ArrowDown' : 'ArrowRight')) return (current + 1) % count
  if (key === (vertical ? 'ArrowUp' : 'ArrowLeft')) return (current - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

/** A tab's title as text, for naming its panel; `undefined` when the title is not plain text. */
const titleText = (tab: TabTitle | undefined) => {
  if (typeof tab === 'string' || typeof tab === 'number') return String(tab)
  if (tab && typeof tab === 'object' && !React.isValidElement(tab)) {
    const {text} = tab as TitleObject
    if (typeof text === 'string' || typeof text === 'number') return String(text)
  }
  return undefined
}

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
 * THE KEYBOARD, since 2026-10-06, by the WAI-ARIA Tabs pattern. The bar is a `tablist`, each title a
 * `tab` with `aria-selected`, and the content a `tabpanel`, named by its tab's title when that is text.
 * Only the active tab is in the tab order; the arrows of the bar's direction, Home and End move focus
 * to another tab and select it, after the same 50 ms transition a click has. There are no ids to tie a
 * tab to its panel: a counter would make every snapshot depend on the order things mount in.
 *
 * Function slots, content and children receive what the class passed as `this`: one object for the
 * component's lifetime, kept current, with `props`, `state`, `tabs`, `contents` and `setTab`.
 * Not memoised, although the class was a PureComponent: `React.memo` would skip a parent render with
 * equal props, and the lifecycle ran even then.
 */
export default function Tabs (props: TabsProps) {
  const {
    vertical, buttoned, items, children, childrenBeforeTabs, childrenAfterTabs, centerTabs,
    className, classNameTabs, classNameContent, styleTabs, styleContent, currencyCode,
    activeIndex: activeIndexProp, defaultIndex, onChange: _, transitionUpdate,
    ...rest
  } = props
  const [state, setState] = useState<TabsState>(() => ({
    activeIndex: normalizeTabIndex(activeIndexProp != null ? activeIndexProp : defaultIndex, items),
    transition: false,
  }))
  const update = (patch: Partial<TabsState>) => setState(current => ({...current, ...patch}))
  const timers = useTimers()

  // The tabs and contents, rebuilt only when the items change by value, as the class's getters were.
  const cache = useRef<ReturnType<typeof split> | null>(null)
  if (cache.current === null) cache.current = split(items)

  // What a controlled `activeIndex` still owes once the render below has applied it: the
  // transition's timer, or the report of an immediate change. `overrides` counts the times it has
  // taken precedence, which is how a click in its transition finds out that it lost.
  const [propsSeen, setPropsSeen] = useState(props)
  const [overrides, setOverrides] = useState(0)
  const [owed, setOwed] = useState<{ target: number, transition: boolean } | null>(null)
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
  // Read through non-null assertions: every render assigns it before any handler or timer runs.
  const latest = useRef<{ props: TabsProps, overrides: number } | null>(null)
  latest.current = {props, overrides}
  const report = (activeIndex: number) => {
    const {onChange} = latest.current!.props
    if (onChange) onChange(activeIndex)
  }
  const updateTab = (activeIndex: number) => {
    update({activeIndex, transition: false})
    report(activeIndex)
  }
  // The tab changes after the transition, normalised against the items current at fire time.
  const scheduleTab = (activeIndex: number) => {
    timers.clear()
    const overridesAtStart = latest.current!.overrides
    timers.setTimeout(() => {
      const {props: {items: currentItems}, overrides: currentOverrides} = latest.current!
      if (currentOverrides === overridesAtStart) updateTab(normalizeTabIndex(activeIndex, currentItems))
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }
  const setTab = (activeIndex: number, transition = true, items = latest.current!.props.items) => {
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
  const handle = useRef<TabsHandle | null>(null)
  // A cast, not a guard: the `Object.assign` below fills it, before anything reads it.
  if (handle.current === null) handle.current = {} as TabsHandle
  Object.assign(handle.current, {props, state, tabs, contents, setTab})

  const {activeIndex, transition} = state
  const content = contents[activeIndex]
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (index !== activeIndex) setTab(index)
      return
    }
    const target = tabTarget(event.key, index, tabs.length, vertical)
    if (target == null) return
    event.preventDefault()
    // Focus moves at once; the tab it lands on is selected after its transition, as a click selects it.
    const list = event.currentTarget.closest('[role="tablist"]')
    const tab = list && list.querySelectorAll<HTMLElement>('[role="tab"]')[target]
    if (tab) tab.focus()
    if (target !== activeIndex) setTab(target)
  }
  return (
    // In Safari, the entire .tabs container scrolls, but in Chrome, only .tabs__content scrolls
    // the solution is to enforce `min-height: initial` for this wrapper in `classNameInner`
    <ScrollView // ScrollView is needed so inner content scroll does not overlap tabs, and has correct height
      className={cn('tabs fade-in', className, {buttoned})}
      classNameInner="max-height" // fix to allow child ScrollViews to take 100% of available height
      {...rest}
    >
      <ScrollView row={!vertical} center={centerTabs}
                  className={cn('tabs__items no-scrollbar', classNameTabs)} style={styleTabs}
                  role="tablist" aria-orientation={vertical ? 'vertical' : undefined}>
        {isFunction(childrenBeforeTabs) ? childrenBeforeTabs(handle.current) : childrenBeforeTabs}
        {tabs.map((tab, i, allTabs) => (
          <View key={i} className={cn('tabs__item', {active: activeIndex === i && allTabs.length > 1})}
                role="tab" aria-selected={activeIndex === i} tabIndex={activeIndex === i ? 0 : -1}
                onClick={activeIndex !== i ? (() => setTab(i)) : undefined}
                onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => onTabKeyDown(event, i)}>
            {renderTab(tab)}
          </View>
        ))}
        {isFunction(childrenAfterTabs) ? childrenAfterTabs(handle.current) : childrenAfterTabs}
      </ScrollView>
      <ScrollView fill className={cn('tabs__content', {'fade-in': !transition}, classNameContent)}
                  style={styleContent} role="tabpanel" aria-label={titleText(tabs[activeIndex])}>
        {typeof content === 'object' ? content : (isFunction(content) ? content(handle.current) : <Text>{content}</Text>)}
      </ScrollView>
      {isFunction(children) ? children(handle.current) : children}
    </ScrollView>
  )
}
