import classNames from '../utils/classNames'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * The named props are read here; the rest is spread onto the `<div>` through ./domProps. The engine hands
 * this whole meta nodes, so the set is open, and `unknown` because the rest is forwarded, never inspected.
 */
export type ViewProps = {
    /** Optional css class */
    className?: string
    /** Forwarded to the `<div>`; its presence adds the `pointer` class */
    onClick?: React.MouseEventHandler<HTMLDivElement>
    /** Whether to make the view fill up available height and width */
    fill?: boolean
    /** Whether to reverse order of rendering */
    reverse?: boolean
    /** Whether to use right to left direction */
    rtl?: boolean
    children?: React.ReactNode
    [key: string]: unknown
}

/**
 * View - Pure Component.
 * @todo: test rendering without React.memo on large scene to see which is faster.
 * With default `display: flex` style
 * (to be used as replacement for `<div></div>` and `<span></span>` for cross platform integration)
 *
 * @Note: this does NOT forward refs. The export is `React.memo(View)`, which calls this with props only,
 *  so up to React 18 a `ref` never arrives — `<View ref={…}>` is silently inert and React warns about it.
 *  React 19 made `ref` an ordinary prop, so there it rides the rest bag onto the `<div>`. If a caller
 *  ever needs the underlying element, wrap with `React.forwardRef` and forward onto the div deliberately,
 *  with a test; do not reinstate a parameter the export cannot fill.
 */
export function View ({
    className,
    fill,
    reverse,
    rtl,
    ...props
}: ViewProps) {
    // DOM boundary: this spread lands on a <div>. `Expand`, `PieChart` and the layout views
    // all funnel their props through here, which is why `index`, `label`, `name` and
    // `_comment` used to become attributes. `Expand` keeps reading `this.props.index` for its
    // onClick payload — the strip is at the edge only. See ./domProps.js.
    const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
    return <div
        className={classNames('flex--col', { fill, reverse, rtl, pointer: props.onClick }, className)} {...domProps}/>
}

export default React.memo(View)
