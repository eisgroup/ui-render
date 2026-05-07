import classNames from '../utils/classNames'
import React, { useContext } from 'react'
import { Active } from '../utils'
import { ISO_8601_COMPLETE_DATE } from '../modules/variables'
import { ConfigContext } from '../contexts'
import moment from 'moment'

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
    } else if (typeof children === 'number') {
        component = children.toString()
    } else if (typeof children === 'boolean') {
        component = children ? 'Yes' : 'No'
    } else if (typeof children === 'string') {
        if (ISO_8601_COMPLETE_DATE.test(children)) {
            component = moment(children).format(dateFormat)
        }
    }
    return (
        <span className={classNames('text', { fill, reverse, rtl, pointer: props.onClick }, className)} {...props}>
            {(typeof children === 'string') ? translate(component) : component}
        </span>
    )
}

export default React.memo(Text)
