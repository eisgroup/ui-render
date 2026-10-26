import classNames from '../utils/classNames'
import React, { useContext } from 'react'
import { Active } from '../utils'
import type { Translate } from '../utils/_envs'
import { isPhraseMessage, phrase } from '../utils/phrases'
import type { PhraseMessage } from '../utils/phrases'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'
import { ISO_8601_COMPLETE_DATE, withDecimalSeparator } from '../utils'
import { ConfigContext, TranslateContext } from '../contexts'
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
     * `dateFormat`. A number renders as its string, with the configured `locale`'s decimal separator,
     * a boolean as the built-in phrase `YES` or `NO` in the language of `translate` (`utils/phrases.ts`),
     * a `PhraseMessage` as its phrase in that language, and an element is cloned with `translate`.
     */
    children?: React.ReactNode | PhraseMessage
    /** What translates a string child: the translator of the document it renders in without one */
    translate?: Translate
    [key: string]: unknown
}

/** The part of ConfigContext this component reads. */
type TextConfig = { dateFormat?: string, locale?: string }

/**
 * Text View - Pure Component.
 * (to be used as replacement for `<span></span>` for cross platform integration)
 */
function Text ({
    className,
    fill,
    reverse,
    rtl,
    children,
    translate: given,
    ...props
}: TextProps) {
    // A cast, not a guard: `ConfigContext` has no default value, so outside a provider this destructure
    // throws, as it did in JavaScript. The library root (`AppProvider`) always renders one.
    const { dateFormat, locale } = useContext(ConfigContext) as TextConfig
    // Handed none, as the value renderers and the tabs hand none, it takes its document's translator, read from
    // the context, so it renders again when that changes (`TranslateContext`). Until 2026-10-23 it took the
    // module global, the translator of the document constructed last: on a page with two documents, the second
    // one's in the first. The global stays the default outside a document.
    const documentTranslate = useContext(TranslateContext)
    const translate = given || documentTranslate || Active.translate

    let component: React.ReactNode
    // A component child is handed the translator; a DOM element is not, because there `translate` is
    // an HTML attribute, and React warned on a function in it (until 2026-10-06).
    if (React.isValidElement<{ translate?: Translate }>(children) && typeof children.type !== 'string') {
        component = React.cloneElement(children, { translate })
    } else if (isPhraseMessage(children)) {
        // A validator's message or a popup's title, made where no translator is known: translated here, as a
        // boolean is, and not again below.
        component = phrase(translate, children.phrase, children.variables)
    } else if (typeof children === 'number') {
        component = withDecimalSeparator(children.toString(), locale)
    } else if (typeof children === 'boolean') {
        // Translated here, and not again below, which translates a string child only.
        component = phrase(translate, children ? 'YES' : 'NO')
    } else if (typeof children === 'string' && ISO_8601_COMPLETE_DATE.test(children)) {
        component = moment(children).format(dateFormat)
    } else {
        // Any other object, a DOM element among them, as it is, and any other string, which is translated below.
        component = children
    }
    // DOM boundary: this spread lands on a <span>, and `Text` is where every value renderer
    // ends up (renders.tsx renderFloat -> <Text {...options}>), so the whole render-method
    // options bag arrives here. Nothing engine-internal and no field-only attribute belongs
    // on a span — add new engine props to ./domProps.ts, not as another `foo: _` above.
    const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
    return (
        <span className={classNames('text', { fill, reverse, rtl, pointer: props.onClick }, className)} {...domProps}>
            {(typeof children === 'string') ? translate(component) : component}
        </span>
    )
}

export default React.memo(Text)
