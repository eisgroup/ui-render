import classNames from '../utils/classNames'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isFunction } from '../utils'
import AnimateHeight from './AnimateHeight'
import Icon from './Icon'
import { STYLE } from './styles'
import Text from './Text'
import View from './View'

/** What `onClick` is told on every change: the new state, and which `Expand` it was. */
export type ExpandChange = { expanded: boolean, index?: string | number, key?: string | number, value: string }

/** The named props are read here; the rest is passed to the `View` it renders. */
export type ExpandProps = {
  /** Argument to pass to 'onClick' callback as `key`, and the element's `id` */
  id?: string | number
  /** String or component to always show */
  title?: React.ReactNode
  /** Callback on every change, a commit after it */
  onClick?: (change: ExpandChange) => void
  /** Whether to add `active` css class */
  active?: boolean
  /** Milliseconds for the animation */
  duration?: number
  className?: string
  classNameLabel?: string
  classNameItems?: string
  /** A function to render content when expanded, receiving `id`; or pre-rendered content (not recommended) */
  children?: React.ReactNode | ((id?: string | number) => React.ReactNode)
  /** Whether should render as expanded; a changed value moves the state to it, and `undefined` toggles */
  expanded?: boolean
  /** Whether should render expand icon spread out from `title` */
  justify?: boolean
  /** Name of icon for collapsed state */
  iconClosed?: string
  /** Name of icon for expanded state */
  iconOpened?: string
  /** Function to render title */
  renderLabel?: (title: React.ReactNode) => React.ReactNode
  /** Argument to pass to 'onClick' callback as `index` */
  index?: string | number
  [key: string]: unknown
}

type ExpandState = {
  expanded: boolean | undefined
  changing: boolean
  change: { expanded: boolean } | null
  seen: boolean | undefined
}

/**
 * The state a change to `expand` moves to. Expanding shows the content at once; collapsing keeps it
 * mounted (`changing`) until the animation is over. Each change is a new `change` object, which is
 * what the effect reporting it runs on.
 */
function toggled (state: ExpandState, expand: boolean): ExpandState {
  if (expand === state.expanded) return state
  const change = {expanded: !!expand}
  return expand
    ? {...state, expanded: true, changing: false, change}
    : {...state, expanded: false, changing: true, change}
}

/**
 * Expandable Row.
 *
 * A FUNCTION COMPONENT since §9.3 step 6, memoised like the `@withTimer` PureComponent it was. Its
 * `UNSAFE_componentWillReceiveProps` compared two values, `children` and `expanded`, so a parent
 * render with equal props had nothing to do.
 *  - A changed `expanded` prop moves the state to it during render, where the lifecycle moved it.
 *    `undefined` toggles, as the default argument of the class's `update()` did.
 *  - What a change also does — report to `onClick`, and end a collapse after `duration` — happens in
 *    an effect, a commit later, since render must not. The class did it in a `setState` callback.
 *  - Function children are called once per `children`, with `id`, on the first render that shows
 *    them, as the class's `content` getter cached them. StrictMode's development double render of
 *    a mount calls them twice.
 * Two things changed, and tests pin both:
 *  - The lifecycle compared a changed `expanded` with the COMMITTED state. A parent that follows a
 *    report by passing the new state back as `expanded`, as TableView's `handleItemExpand` and the
 *    demo's Examples page do, was told about every expansion twice, and the demo pushed its URL onto
 *    the history twice. Compared with the current state, it is told once.
 *  - The next change cancels a pending collapse's timer. The class kept it, so collapsing, expanding
 *    and collapsing again within `duration` unmounted the content before the second animation was
 *    over.
 */
function Expand (props: ExpandProps) {
  const {
    id,
    title,
    onClick,
    active,
    duration = STYLE.ANIMATION_DURATION,
    className,
    classNameLabel,
    classNameItems,
    children,
    expanded: expandedProp,
    justify,
    iconClosed = 'chevron-right',
    iconOpened = 'chevron-down',
    renderLabel,
    ...rest
  } = props
  const [state, setState] = useState<ExpandState>(() => ({
    expanded: expandedProp,
    changing: false,
    change: null,
    seen: expandedProp,
  }))
  if (!Object.is(expandedProp, state.seen)) {
    setState(current => ({
      ...toggled(current, expandedProp === undefined ? !current.expanded : expandedProp),
      seen: expandedProp,
    }))
  }

  // The effect below runs once per change, and reads what it reports, and the collapse's
  // `duration`, from the latest commit, as the class read `this.props`. Assigned by an effect
  // declared before it, since effects run in order, rather than during the render.
  const latest = useRef<{ report: (expanded: boolean) => void, duration: number } | null>(null)
  useEffect(() => {
    latest.current = {
      report: expanded => onClick && onClick({expanded, index: props.index, key: id, value: String(title)}),
      duration,
    }
  })
  const {change} = state
  useEffect(() => {
    if (!change) return
    // Assertions, not guards: the effect above assigns `latest` after every commit, before this one runs.
    latest.current!.report(change.expanded)
    if (change.expanded) return
    const timer = setTimeout(() => setState(current => ({...current, changing: false})), latest.current!.duration)
    return () => clearTimeout(timer)
  }, [change])

  const handleToggleExpand = useCallback(() => {
    setState(current => toggled(current, !current.expanded))
  }, [])

  const {expanded, changing} = state
  const hasContent = children != null
  const shown = hasContent && (expanded || changing)
  // Built once it is shown, and kept while it stays shown and `children` and `id` are the same, so a
  // render function is not called on every render. Collapsed, the content is unmounted, so nothing is
  // lost by building it again. A ref held it until 2026-10-08, keyed on `children` alone.
  const built = useMemo(() => (shown ? (isFunction(children) ? children(id) : children) : null), [shown, children, id])
  const content = shown && built

  let label: React.ReactNode = null
  if (title != null || renderLabel) {
    const Title = renderLabel ? renderLabel(title) : title
    label = (
      // The label toggles with no children too: the content can be rendered elsewhere, as
      // TableView renders a row's. It is the button of the WAI-ARIA disclosure pattern since
      // 2026-10-06: in the tab order, and Enter and Space toggle it as a click does.
      <Text
        className={classNames('row fill-width middle padding-small', {justify}, classNameLabel)}
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        // `expanded` starts `undefined` when the prop is unset, and a collapsed disclosure must say `false`.
        aria-expanded={!!expanded}
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          handleToggleExpand()
        }}
      >
        {justify && Title}
        {iconOpened && iconClosed &&
        <Icon name={(expanded ? iconOpened : iconClosed) + ' spin-90-deg' + (expanded ? '' : '-')}/>}
        {!justify && Title}
      </Text>
    )
  }
  return (
    // `id` is optional in meta, and String(undefined) is the string "undefined" -- which used to
    // be emitted as a real attribute, duplicated across every Expand without an id, so a
    // `<label for>` could only ever resolve to the first one.
    <View className={classNames('app__expand', className, {expanded, active})}
          id={id == null ? undefined : String(id)} {...rest}>
      {label}
      {hasContent &&
      <AnimateHeight expanded={expanded} duration={duration}
                     className={classNames('expand__content', classNameItems)}>
        {content}
      </AnimateHeight>
      }
    </View>
  )
}

export default React.memo(Expand)
