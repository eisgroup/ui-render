import classNames from 'classnames'
import React from 'react'
import { isFunction } from 'ui-utils-pack'

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
 * @param {*} [ref] - callback(element) when component mounts, or from React.createRef()
 * @returns {Object} - React Component
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
}, ref) {
    return <div
        className={classNames('flex--col', { fill, reverse, rtl, pointer: props.onClick }, className)} {...props}/>
}

export default React.memo(View)
