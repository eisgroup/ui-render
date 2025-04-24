import classNames from 'classnames'
import React, { useContext } from 'react'
import { Active } from 'ui-utils-pack'
import { ISO_8601_COMPLETE_DATE } from 'ui-modules-pack/variables'
import { ConfigContext } from '../contexts'
import dayjs from 'dayjs'

/**
 * Text View - Pure Component.
 * (to be used as replacement for `<span></span>` for cross platform integration)
 *
 * @param {string} [className] - optional css class name
 * @param {Function} [onClick] - callback to fire on click or Enter press (if `onKeyPress` not given)
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export function Text ({
    className,
    fill,
    reverse,
    rtl,
    expanded: _, // not used, remove to prevent warnings
    children,
    translate = Active.translate,
    ...props
}) {
    const { dateFormat } = useContext(ConfigContext)

    let component = children
    if (React.isValidElement(children)) {
        component = React.cloneElement(children, { translate })
    } else if (typeof children === 'object') {
        component = children
    } else if (children && typeof children === 'number') {
        component = children.toString()
    } else if (children && typeof children === 'boolean') {
        component = children ? 'Yes' : 'No'
    } else if (typeof children === 'string') {
        if (ISO_8601_COMPLETE_DATE.test(children)) {
            component = dayjs(children).format(dateFormat)
        }
    }
    return (
        <span className={classNames('text', { fill, reverse, rtl, pointer: props.onClick }, className)} {...props}>
            {(typeof children === 'string') ? translate(component) : component}
        </span>
    )
}

export default React.memo(Text)
