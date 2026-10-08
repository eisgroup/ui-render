import classNames from '../utils/classNames'
import React, { useMemo, useContext } from 'react'
import Row from './Row'
import Text from './Text'
import View from './View'
import Label from './Label'
import { Active } from '../utils'
import PickerJs from 'rc-picker'
import enUs from 'rc-picker/lib/locale/en_US'
import generateConfig from 'rc-picker/lib/generate/moment'
import moment from 'moment'
import { ConfigContext } from '../contexts'
import { ENGINE_PROPS, omitProps } from './domProps'
import type { PickerProps } from 'rc-picker'
import type { Moment } from 'moment'
import type { Translate } from '../utils/_envs'

type DatePickerProps = PickerProps<Moment>

/**
 * rc-picker, typed to accept `resize`, which this has always passed it and which it drops: no element
 * it renders carries the attribute, the open panel included (measured). Typed rather than removed, so
 * that converting this file changes nothing at runtime.
 */
const Picker = PickerJs as React.ComponentType<DatePickerProps & { resize?: boolean }>

/** The named props are read here; the rest is passed to rc-picker through ./domProps. */
export type InputDateProps = {
    name?: string
    id?: string
    /** Read for its css class only, as `Input` adds it */
    icon?: unknown
    lefty?: boolean
    unit?: unknown
    label?: string
    disabled?: boolean
    className?: string
    children?: React.ReactNode
    resize?: boolean
    readonly?: boolean
    autofocus?: boolean
    error?: React.ReactNode
    info?: React.ReactNode
    style?: React.CSSProperties
    onFocus?: DatePickerProps['onFocus']
    onBlur?: DatePickerProps['onBlur']
    title?: string
    placeholder?: string
    translate?: Translate
    /** Called with the picked date as `YYYY-MM-DD`, or null when there is none */
    onChange?: (value: string | null) => void
    onSelect?: DatePickerProps['onCalendarChange']
    /** A moment, a Date, a timestamp, or a string in the configured format, `YYYY-MM-DD` or ISO 8601 */
    value?: unknown
    defaultValue?: unknown
    /** `Input`'s, taken only to keep them off the picker */
    onClickIcon?: unknown
    done?: unknown
    classNameIcon?: unknown
    stickyPlaceholder?: unknown
    onRemove?: unknown
    [key: string]: unknown
}

const InputDate = ({
    name,
    id = name,
    icon,
    lefty,
    onClickIcon,
    unit,
    label,
    disabled,
    done,
    className,
    classNameIcon,
    children,
    stickyPlaceholder, // only works with controlled component when `props.value` is provided
    resize,
    readonly,
    autofocus,
    error,
    info,
    style,
    onFocus,
    onBlur,
    onRemove,
    title,
    placeholder,
    translate = Active.translate,
    onChange,
    onSelect,
    value: valueFromParent,
    defaultValue,
    ...props
}: InputDateProps) => {
    const config = useContext(ConfigContext)

    const dateFormat = useMemo(() => (config && config.dateFormat) || 'DD/MM/YYYY', [config])

    if (autofocus) props.autoFocus = autofocus // React fix
    if (readonly) {
        props.className = 'readonly'
        props.readOnly = readonly
        props.inputReadOnly = readonly
    }

    if (!id && label) id = 'input-' + label.replace(/ +?/g, '-')
    if (!label && title) props.title = translate(title)

    const toMoment = (date: unknown): Moment | null => {
        if (date == null || date === '') return null

        let parsed: Moment
        if (moment.isMoment(date)) parsed = date
        else if (typeof date !== 'string') parsed = moment(date as moment.MomentInput)
        else {
            // Strict pass first, so the configured format wins over Moment's guessing. Then fall
            // back to a lenient read: a stored value in a shape we do not list (unpadded `2021-1-2`,
            // `2021/01/02`, `Jan 2, 2021`) must still render. Showing it blank reads as "unset" to
            // the user, who then overwrites a perfectly good date.
            parsed = moment(date, [dateFormat, 'YYYY-MM-DD', moment.ISO_8601], true)
            // The lenient read is `moment(date)`'s own, step by step: ISO 8601, RFC 2822, then the
            // `Date` parse Moment falls back to. Called as `moment(date)`, that last step printed
            // Moment's deprecation warning to the host's console, until 2026-10-06.
            if (!parsed.isValid()) parsed = moment(date, moment.ISO_8601)
            if (!parsed.isValid()) parsed = moment(date, moment.RFC_2822)
            if (!parsed.isValid()) parsed = moment(new Date(date))
        }

        return parsed.isValid() ? parsed : null
    }

    const sourceValue = valueFromParent !== undefined ? valueFromParent : defaultValue
    const value = toMoment(sourceValue)

    // An `aria-describedby` naming an id no element carries is worse than none: it is an axe
    // `aria-valid-attr-value` violation, and a screen reader announces nothing for it. The help
    // element exists only while there is a message, so the reference is conditional on the same
    // value — one binding for both, so the two cannot disagree again.
    const idHelp = (error || info) ? id + '-help' : undefined

    // `unknown`: rc-picker's type also covers its multiple mode, and `toMoment` reads whatever arrives.
    const onDateChanged = (date: unknown) => {
        if (!onChange) return

        const changedDate = toMoment(date)
        onChange(changedDate ? changedDate.format('YYYY-MM-DD') : null)
    }

    return (
        <View
            className={classNames('input--wrapper', className, {
                resize, swatch: props.type === 'color', required: props.required
            })}
            style={style}
        >
            <Row className="middle">
                {label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
            </Row>
            <Row className={classNames('input', {icon, lefty, error, info, unit})}>
                <Picker
                    name={name}
                    id={id}
                    prefixCls={'ui-render-picker'}
                    className={'ui-render-picker'}
                    disabled={disabled}
                    resize={resize}
                    aria-describedby={idHelp}
                    placeholder={translate(placeholder)}
                    generateConfig={generateConfig}
                    // DOM boundary (see ./domProps): the spread reaches rc-picker, which forwards unknown props to its own <input>, so this is
    // a form-control boundary: ENGINE_PROPS only.
                    {...omitProps(props, ENGINE_PROPS)}
                    value={value}
                    allowClear={false}
                    locale={enUs}
                    picker='date'
                    format={[dateFormat, 'YYYY-MM-DD']}
                    onChange={onDateChanged}
                    onCalendarChange={onSelect}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </Row>
            {idHelp &&
                <View id={idHelp} className='field-help'>
                    {error && <Text className='error'>{translate(error)}</Text>}
                    {info && <Text className='info'>{translate(info)}</Text>}
                </View>
            }
            {children}
        </View>
    )
}

export default InputDate
// export default React.memo(InputDate)
