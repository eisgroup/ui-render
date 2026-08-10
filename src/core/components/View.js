import classNames from '../utils/classNames'
import React from 'react'

/**
 * View - Pure Component.
 * @todo: test rendering without React.memo on large scene to see which is faster.
 * With default `display: flex` style
 * (to be used as replacement for `<div></div>` and `<span></span>` for cross platform integration)
 *
 * @param {string} [className] - optional css class
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 *
 * @Note: this does NOT forward refs. The export is `React.memo(View)`, which calls this with props only,
 *  so a `ref` can never arrive — `<View ref={…}>` is silently inert and React warns about it. If a caller
 *  ever needs the underlying element, wrap with `React.forwardRef` and forward onto the div deliberately,
 *  with a test; do not reinstate a parameter the export cannot fill.
 */
export function View ({
    className,
    fill,
    reverse,
    rtl,
    expanded: _, // not used, remove to prevent warnings
    translate: _2,
    onDataChanged: _3,
    ...props
}) {
    return <div
        className={classNames('flex--col', { fill, reverse, rtl, pointer: props.onClick }, className)} {...props}/>
}

export default React.memo(View)
