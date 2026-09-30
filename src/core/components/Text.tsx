import classNames from '../utils/classNames'
import React, { useContext } from 'react'
import { Active } from '../utils'
import type { Translate } from '../utils/_envs'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'
import { ISO_8601_COMPLETE_DATE } from '../utils'
import { ConfigContext } from '../contexts'
import moment from 'moment'

/** The named props are read here; the rest is spread onto the `<span>` through ./domProps (see `ViewProps`). */
export type TextProps = {
    /** Optional css class name */
    className?: string
    /** Forwarded to the `<span>`; its presence adds the `pointer` class */
    onClick?: React.MouseEventHandler<HTMLSpanElement>
    /** Whether to make the view fill up available height and width */
    fill?: boolean
    /** Whether to reverse order of rendering */
    reverse?: boolean
    /** Whether to use right to left direction */
    rtl?: boolean
    /**
     * A string is translated, and an ISO 8601 date string is first formatted with the configured
     * `dateFormat`. A number renders as its string, a boolean as 'Yes'/'No', and an element is
     * cloned with `translate`.
     */
    children?: React.ReactNode
    translate?: Translate
    [key: string]: unknown
}

/** The part of ConfigContext this component reads. */
type DateConfig = { dateFormat?: string }

/**
 * Text View - Pure Component.
 * (to be used as replacement for `<span></span>` for cross platform integration)
 */
export function Text ({
    className,
    fill,
    reverse,
    rtl,
    children,
    translate = Active.translate,
    ...props
}: TextProps) {
    // A cast, not a guard: `ConfigContext` has no default value, so outside a provider this destructure
    // throws, as it did in JavaScript. The library root (`AppProvider`) always renders one.
    const { dateFormat } = useContext(ConfigContext) as DateConfig

    let component: React.ReactNode = children
    if (React.isValidElement<{ translate?: Translate }>(children)) {
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
    // DOM boundary: this spread lands on a <span>, and `Text` is where every value renderer
    // ends up (renders.js renderFloat -> <Text {...options}>), so the whole render-method
    // options bag arrives here. Nothing engine-internal and no field-only attribute belongs
    // on a span — add new engine props to ./domProps.js, not as another `foo: _` above.
    const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
    return (
        <span className={classNames('text', { fill, reverse, rtl, pointer: props.onClick }, className)} {...domProps}>
            {(typeof children === 'string') ? translate(component) : component}
        </span>
    )
}

export default React.memo(Text)
