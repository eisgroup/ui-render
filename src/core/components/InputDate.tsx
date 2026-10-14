import classNames from '../utils/classNames'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
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
import type { PickerProps, PickerRef } from 'rc-picker'
import type { Moment } from 'moment'
import type { Translate } from '../utils/_envs'
import { useOwnId } from './useOwnId'

type DatePickerProps = PickerProps<Moment>

/**
 * rc-picker, typed to accept `resize`, which this has always passed it and which it drops: no element
 * it renders carries the attribute, the open panel included (measured). Typed rather than removed, so
 * that converting this file changes nothing at runtime.
 */
const Picker = PickerJs as React.ComponentType<DatePickerProps & { resize?: boolean } & React.RefAttributes<PickerRef>>

// A layout effect in a browser. On the server, where no effect runs, an effect: React 16 and 17 warn about a layout
// effect there.
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * How far outside the viewport a field mounts its picker, so that one scrolled to is ready when it is reached.
 */
const NEAR = '200px'

/** The fields that wait to come near the viewport, and what each then does. One observer watches them all. */
const waiting = new Map<Element, () => void>()
let observer: IntersectionObserver | null = null

/** Calls `near` once `element` comes within NEAR of the viewport, and returns what stops the wait. */
function whenNear (element: Element, near: () => void): () => void {
    if (!observer) {
        observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue
                const call = waiting.get(entry.target)
                waiting.delete(entry.target)
                observer!.unobserve(entry.target)
                if (call) call()
            }
        }, {rootMargin: NEAR})
    }
    waiting.set(element, near)
    observer.observe(element)
    return () => {
        waiting.delete(element)
        observer!.unobserve(element)
    }
}

/** The props rc-picker copies onto its `<input>` as they are: `role`, `aria-*` and `data-*` (rc-util's `pickAttrs`). */
function ariaAndData (props: Record<string, unknown>): Record<string, unknown> {
    const picked: Record<string, unknown> = {}
    for (const key in props) {
        if (key === 'role' || key.startsWith('aria-') || key.startsWith('data-')) picked[key] = props[key]
    }
    return picked
}

/**
 * What mounted a field's picker: coming near the viewport or under a pointer, or a focus or a press while it was not
 * there yet.
 */
type PickerMount = 'near' | 'focus' | 'press'

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
    id: idGiven,
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

    // The id as it always was: the one given, else the name, else one from the label.
    let derivedId = idGiven === undefined ? name : idGiven
    if (!derivedId && label) derivedId = 'input-' + label.replace(/ +?/g, '-')
    // Unique on the page unless the meta gave it: see `useOwnId`. The `<input>` that carries it is rc-picker's,
    // inside the element its ref hands out.
    const field = useRef<Element | null>(null)
    const onPicker = useCallback((picker: PickerRef | null) => { field.current = picker && picker.nativeElement }, [])
    const onStandIn = useCallback((element: HTMLDivElement | null) => { field.current = element }, [])
    // rc-picker cost a closed field about as much as the rest of a 200-row period table did (2026-10-14): a field
    // renders what rc-picker renders while closed, the stand-in below, until it comes near the viewport. Where there is
    // no IntersectionObserver, which is the server and jsdom, the picker mounts before the first paint.
    const [mounted, setMounted] = useState<PickerMount | null>(autofocus ? 'focus' : null)
    useBeforePaintEffect(() => {
        if (mounted) return undefined
        if (typeof IntersectionObserver === 'undefined') {
            setMounted('near')
            return undefined
        }
        // An assertion, not a guard: the stand-in's ref is attached before its parent's layout effects run.
        return whenNear(field.current!, () => setMounted(current => current || 'near'))
    }, [mounted])
    const ownId = useOwnId(idGiven ? undefined : derivedId, field)
    const id = idGiven || ownId
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

    // DOM boundary (see ./domProps): what reaches rc-picker, which forwards unknown props to its own <input>, so this
    // is a form-control boundary: ENGINE_PROPS only.
    const passed = omitProps(props, ENGINE_PROPS) as Record<string, unknown>
    // The props rc-picker is handed below, before its own, and so what the stand-in renders from.
    const given: Record<string, unknown> = {
        name, id, className: 'ui-render-picker', disabled, 'aria-describedby': idHelp, placeholder: translate(placeholder),
        ...passed,
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
                {mounted ? (
                    <Picker
                        ref={onPicker}
                        name={name}
                        id={id}
                        prefixCls={'ui-render-picker'}
                        className={'ui-render-picker'}
                        disabled={disabled}
                        resize={resize}
                        aria-describedby={idHelp}
                        placeholder={translate(placeholder)}
                        generateConfig={generateConfig}
                        {...passed}
                        // Mounted by a focus or a press on the stand-in: it takes the focus, and a press opens it.
                        {...(mounted !== 'near' && {autoFocus: true})}
                        {...(mounted === 'press' && {defaultOpen: true})}
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
                ) : (
                    // The stand-in: what rc-picker renders for a closed field, attribute for attribute, read from the same
                    // props (`InputDate.stand-in.test.js`). It has rc-picker's elements, and none of its behaviour.
                    <div
                        ref={onStandIn}
                        className={classNames('ui-render-picker', {'ui-render-picker-disabled': given.disabled}, given.className as string)}
                        onMouseEnter={given.onMouseEnter as React.MouseEventHandler<HTMLDivElement> | undefined}
                        onMouseLeave={given.onMouseLeave as React.MouseEventHandler<HTMLDivElement> | undefined}
                        // A pointer comes over a field before it presses it, a touch or a pen as it touches: the picker
                        // mounts then, at once, so that the press is rc-picker's own. A press that came first (a pointer
                        // that has not moved since the field rendered under it) mounts it open and focused instead.
                        onPointerEnter={() => flushSync(() => setMounted(current => current || 'near'))}
                        onPointerDown={() => setMounted(current => current || 'press')}
                    >
                        <div className="ui-render-picker-input">
                            <input
                                aria-invalid={false}
                                autoComplete="off"
                                {...ariaAndData(given)}
                                readOnly={given.inputReadOnly as boolean | undefined}
                                required={given.required as boolean | undefined}
                                name={given.name as string | undefined}
                                {...(given.autoComplete !== undefined && {autoComplete: given.autoComplete as string})}
                                // rc-picker's width, in characters: the format's, and at least 10, and 2 more.
                                size={Math.max(10, dateFormat.length) + 2}
                                id={given.id as string | undefined}
                                // rc-picker's own text: the first format, in its locale, whatever moment's global one is.
                                value={value ? generateConfig.locale.format(enUs.locale, value, dateFormat) : ''}
                                placeholder={given.placeholder as string | undefined}
                                disabled={given.disabled as boolean | undefined}
                                tabIndex={given.tabIndex as number | undefined}
                                onFocus={() => setMounted('focus')}
                                // Nothing types here: a focus mounts the picker first.
                                onChange={() => undefined}
                            />
                        </div>
                    </div>
                )}
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
