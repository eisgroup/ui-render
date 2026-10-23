import classNames from '../utils/classNames'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Row from './Row'
import Text from './Text'
import View from './View'
import Label from './Label'
import { Active } from '../utils'
import PickerJs from 'rc-picker'
import generateConfig from 'rc-picker/lib/generate/moment'
import moment from 'moment'
import { ConfigContext } from '../contexts'
import { ENGINE_PROPS, omitProps } from './domProps'
import type { PickerProps, PickerRef } from 'rc-picker'
import type { Moment } from 'moment'
import type { Translate } from '../utils/_envs'
import type { PhraseMessage } from '../utils/phrases'
import { useOwnId } from './useOwnId'
import { dateLocaleOf, useCalendarLocale } from './calendarLocale'

type DatePickerProps = PickerProps<Moment>

/**
 * rc-picker, typed to accept `resize`, which this has always passed it and which it drops: no element
 * it renders carries the attribute, the open panel included (measured). Typed rather than removed, so
 * that converting this file changes nothing at runtime.
 */
const RcPicker = PickerJs as React.ComponentType<DatePickerProps & { resize?: boolean } & React.RefAttributes<PickerRef>>

/**
 * What `Picker` takes: rc-picker's props but its `locale`, which it makes of the last two, and the HTML `translate`
 * attribute, whose name the document's translator takes.
 */
type CalendarPickerProps = Omit<DatePickerProps, 'locale' | 'translate'> & {
    resize?: boolean
    /** The document's translator, which the calendar's texts are asked of */
    translate: Translate
    /** The moment locale the field writes dates, month and day names in (`dateLocaleOf`) */
    dateLocale: string
}

/**
 * rc-picker, with its locale: its texts in the language of `translate`, its month and day names in `dateLocale`
 * (`./calendarLocale`). A component of its own, so that a field asks for the texts only once its picker is mounted.
 */
const Picker = React.forwardRef<PickerRef, CalendarPickerProps>(function Picker ({translate, dateLocale, ...props}, ref) {
    const locale = useCalendarLocale(translate, dateLocale)
    return <RcPicker ref={ref} {...props} locale={locale}/>
})

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

/**
 * A date as a moment, or null when there is none: a moment, a Date, a timestamp, or a string in `dateFormat`,
 * `YYYY-MM-DD` or ISO 8601.
 */
function toMoment (date: unknown, dateFormat: string): Moment | null {
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

/**
 * Whether rc-picker reads `text` as a date, as it reads what a user types: strictly, in one of `formats`, and in the
 * moment locale `dateLocale`, its own, which names the months. Never the lenient read of `toMoment`, which takes
 * `02-29-2021` for 2021-02-28 and `11-31-2021` for 2021-11-30.
 */
function readsAsDate (text: string, formats: readonly string[], dateLocale: string): boolean {
    return formats.some(format => generateConfig.locale.parse(dateLocale, text, [format]) !== null)
}

/** What the input rc-picker renders tells `InputDate` (`TextInput`). */
type InputReports = {
    /** The text the input shows, whenever it changes */
    shows: (text: string) => void
    focuses: () => void
    /** The text the input shows as it loses the focus */
    leaves: (text: string) => void
}

const InputReported = React.createContext<InputReports | null>(null)

/** What rc-picker hands its input, among the rest: the text it keeps, and its own focus handlers. */
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    value: string
    onFocus: React.FocusEventHandler<HTMLInputElement>
    onBlur: React.FocusEventHandler<HTMLInputElement>
}

/**
 * The `<input>` rc-picker renders, handed to it as `components.input`: the element it renders itself, which tells
 * `InputDate` the text it shows. rc-picker keeps that text in its own state, and changes it as the user types, as the
 * value changes, and as a day in the calendar is hovered.
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput ({onFocus, onBlur, ...props}, ref) {
    // An assertion, not a guard: rc-picker renders this input only inside `InputDate`'s provider.
    const reports = useContext(InputReported)!
    const {value} = props
    useEffect(() => {
        reports.shows(value)
    }, [reports, value])
    return (
        <input
            ref={ref}
            {...props}
            onFocus={event => {
                reports.focuses()
                onFocus(event)
            }}
            onBlur={event => {
                // rc-picker's first: through it, the field's own, which marks the field touched.
                onBlur(event)
                reports.leaves(event.currentTarget.value)
            }}
        />
    )
})

/** One object: rc-picker reads it into a context of its own, by identity. */
const COMPONENTS = {input: TextInput}

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
    /** Shown under the field: a string, which `translate` translates, or a validator's built-in phrase (`PhraseMessage`) */
    error?: React.ReactNode | PhraseMessage
    info?: React.ReactNode
    style?: React.CSSProperties
    onFocus?: DatePickerProps['onFocus']
    onBlur?: DatePickerProps['onBlur']
    title?: string
    placeholder?: string
    translate?: Translate
    /** Called with the picked date as `YYYY-MM-DD`, or null when there is none */
    onChange?: (value: string | null) => void
    /**
     * Called with the text the field is left with when that text is no date in its formats, which the field keeps
     * showing, and with null once it shows a date or nothing again. The date is the one it had before.
     */
    onInvalidText?: (text: string | null) => void
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
    onInvalidText,
    onSelect,
    value: valueFromParent,
    defaultValue,
    ...props
}: InputDateProps) => {
    const config = useContext(ConfigContext)

    const dateFormat = useMemo(() => (config && config.dateFormat) || 'DD/MM/YYYY', [config])
    // The month and day names follow the host's `locale`, else its `language`, and not moment's global locale: until
    // 2026-10-23 they were English whatever the host set.
    const dateLocale = useMemo(() => dateLocaleOf(config && config.locale, config && config.language), [config])

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

    const sourceValue = valueFromParent !== undefined ? valueFromParent : defaultValue
    // One moment per value. A new one on every render made rc-picker drop a date typed and not confirmed yet whenever
    // the field rendered again, as it does when it is left: only Tab and Enter kept the date, and a click anywhere else
    // put the old one back, until 2026-10-23.
    const value = useMemo(() => toMoment(sourceValue, dateFormat), [sourceValue, dateFormat])
    // What rc-picker reads typed text in, and shows a date in the first of.
    const formats = useMemo(() => [dateFormat, 'YYYY-MM-DD'], [dateFormat])

    // TEXT THAT IS NO DATE. rc-picker hands on only text it reads as a date in `formats`. Until 2026-10-23 a field left
    // with `11-31-2021` or `02-29-2021` showed the date it had before again, or nothing, and a required one said
    // `Required`. Now it keeps the text (`preserveInvalidOnBlur`), and its owner hears of it (`onInvalidText`) to show
    // the error: the date is still the one it had.
    // The text reported, while the field shows it.
    const invalidText = useRef<string | null>(null)
    // Left empty. rc-picker confirms the date it last read once the field is left, one it read before the text was
    // emptied included: until the next focus, the field takes none.
    const emptied = useRef(false)
    // What the reports read of the latest render: they are made once.
    const latest = useRef({value, formats, dateLocale, onChange, onInvalidText})
    useBeforePaintEffect(() => {
        latest.current = {value, formats, dateLocale, onChange, onInvalidText}
    })
    const reports = useMemo<InputReports>(() => {
        const report = (text: string | null) => {
            if (invalidText.current === text) return
            invalidText.current = text
            const {onInvalidText} = latest.current
            if (onInvalidText) onInvalidText(text)
        }
        return {
            shows: (text) => {
                // A date now, or nothing: the user corrected the text, or rc-picker showed a value in its place.
                const {formats, dateLocale} = latest.current
                if (invalidText.current !== null && (!text || readsAsDate(text, formats, dateLocale))) report(null)
            },
            focuses: () => {
                emptied.current = false
            },
            leaves: (text) => {
                if (text) {
                    const {formats, dateLocale} = latest.current
                    report(readsAsDate(text, formats, dateLocale) ? null : text)
                    return
                }
                report(null)
                // Emptied, and so the date is gone. rc-picker kept it, and showed it again, until 2026-10-23.
                emptied.current = true
                const {value, onChange} = latest.current
                if (value && onChange) onChange(null)
            },
        }
    }, [])

    // An `aria-describedby` naming an id no element carries is worse than none: it is an axe
    // `aria-valid-attr-value` violation, and a screen reader announces nothing for it. The help
    // element exists only while there is a message, so the reference is conditional on the same
    // value — one binding for both, so the two cannot disagree again.
    const idHelp = (error || info) ? id + '-help' : undefined

    // `unknown`: rc-picker's type also covers its multiple mode, and `toMoment` reads whatever arrives.
    const onDateChanged = (date: unknown) => {
        if (!onChange || emptied.current) return

        const changedDate = toMoment(date, dateFormat)
        // In English, for its digits: rc-picker's date is in the field's locale, and one such as `ar` writes others.
        onChange(changedDate ? changedDate.clone().locale('en').format('YYYY-MM-DD') : null)
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
                    <InputReported.Provider value={reports}>
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
                            translate={translate}
                            dateLocale={dateLocale}
                            value={value}
                            allowClear={false}
                            picker='date'
                            format={formats}
                            preserveInvalidOnBlur
                            components={COMPONENTS}
                            onChange={onDateChanged}
                            onCalendarChange={onSelect}
                            onFocus={onFocus}
                            onBlur={onBlur}
                        />
                    </InputReported.Provider>
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
                                value={value ? generateConfig.locale.format(dateLocale, value, dateFormat) : ''}
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
                    {error && <Text className='error' translate={translate}>{error}</Text>}
                    {info && <Text className='info'>{translate(info)}</Text>}
                </View>
            }
            {children}
        </View>
    )
}

export default InputDate
// export default React.memo(InputDate)
