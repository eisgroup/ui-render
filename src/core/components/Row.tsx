import classNames from '../utils/classNames'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'
import type { ViewProps } from './View'

/** What a `View` takes: both are a flex `<div>`. */
export type RowProps = ViewProps

/**
 * Row View - Pure Component.
 * With default `display: flex` style
 * (to be used as replacement for `<div></div>` and `<span></span>` for cross platform integration)
 *
 * @param {*} props - see `ViewProps`
 * @returns {Object} - React Component
 *
 * It took a second argument, a callback ref, for `RowRef`, a `forwardRef` of it nothing used: both went on
 * 2026-10-06. Through the default export's `React.memo` that argument only ever held legacy context.
 */
export function Row ({
  className,
  fill,
  reverse,
  rtl,
  ...props
}: RowProps) {
  // DOM boundary: this spread lands on a <div>. See ./domProps.ts.
  const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
  return <div className={classNames('flex--row', {fill, reverse, rtl, pointer: props.onClick}, className)} {...domProps} />
}

export default React.memo(Row)
