import classNames from '../utils/classNames'
import React from 'react'
import { isFunction } from '../utils'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'
import type { ViewProps } from './View'

/** What a `View` takes: both are a flex `<div>`. */
export type RowProps = ViewProps

/** The only ref `RowRef` attaches: a callback, called with the `<div>`. */
export type RowCallbackRef = (element: HTMLDivElement | null) => void

/**
 * Row View - Pure Component.
 * With default `display: flex` style
 * (to be used as replacement for `<div></div>` and `<span></span>` for cross platform integration)
 *
 * @param {*} props - see `ViewProps`
 * @param {*} [ref] - callback(element) when component mounts. Only a function is attached: through the default
 *  export's `React.memo` this holds React's legacy context (a frozen `{}` up to React 18), so objects are dropped.
 * @returns {Object} - React Component
 */
export function Row ({
  className,
  fill,
  reverse,
  rtl,
  ...props
}: RowProps, ref?: unknown) {
  // DOM boundary: this spread lands on a <div>. See ./domProps.js — `ref` is attached after
  // the filter because omitProps may return the (rest) object unchanged.
  const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS) as Record<string, unknown> // typed `Object` by its JSDoc
  if (isFunction(ref)) domProps.ref = ref
  return <div className={classNames('flex--row', {fill, reverse, rtl, pointer: props.onClick}, className)} {...domProps} />
}

export const RowRef = React.forwardRef(Row) as React.ForwardRefExoticComponent<RowProps & { ref?: RowCallbackRef }>
export default React.memo(Row)
