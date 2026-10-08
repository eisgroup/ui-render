import classNames from '../utils/classNames'
import React, { useState, useCallback, useMemo } from 'react'
import { capitalize, isString } from '../utils'
import Button from './Button'
import Icon from './Icon'
import Label from './Label'
import Row from './Row'
import Text from './Text'
import View from './View'
import { Active } from '../utils'
import type { Translate } from '../utils/_envs'
import { ENGINE_PROPS, omitProps } from './domProps'

// Constants
const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g
const DECIMAL_PATTERN_TEMPLATE = '^\\d*(\\.\\d{0,{decimals}})?$'

/** Anything this control accepts as, or reports as, a numeric value. The display state is a
 * string (the raw text the user is typing); a completed number is reported as a `number`. */
export type InputNumberValue = string | number

/** `outputFormat` — how the idle (unfocused) value is decorated, and to how many decimals a
 * blurred value is rounded. Every flag is optional; an absent flag means "do not apply". */
export interface InputNumberOutputFormat {
    percentage?: boolean
    separateThousands?: boolean
    decimals?: number
}

/**
 * Reported on every accepted keystroke and on a blur that rewrites the value.
 * @param value - the parsed number, or the raw string while the token is still incomplete ('-', '1.', '')
 * @param name - the field registration path, i.e. `props.name` (undefined when the caller passed none)
 * @param event - the change event, or the blur event when the rewrite came from blur
 */
export type InputNumberChangeHandler = (
    value: InputNumberValue,
    name?: string,
    event?: React.SyntheticEvent<HTMLInputElement>,
) => void

export interface InputNumberProps {
    /**
     * The engine spreads a whole meta declaration onto every rendered node (see ./domProps), so
     * arbitrary extra keys really do arrive here and are forwarded to the `<input>`. The index
     * signature states that instead of pretending the declared list is closed; anything read off
     * the rest bag must be narrowed, or declared above like `required`.
     */
    [key: string]: unknown

    name?: string
    id?: string
    icon?: string | React.ReactNode
    lefty?: boolean
    onClickIcon?: React.MouseEventHandler<HTMLElement>
    unit?: string
    label?: string
    disabled?: boolean
    done?: boolean
    className?: string
    classNameIcon?: string
    children?: React.ReactNode
    /** only works with controlled component when `props.value` is provided */
    stickyPlaceholder?: boolean
    resize?: boolean
    readonly?: boolean
    float?: boolean
    /** The message to show, or `false` while it is not to be shown yet: the form's field wrapper passes that */
    error?: string | false
    info?: string
    style?: React.CSSProperties
    onFocus?: React.FocusEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    onRemove?: (name?: string) => void
    title?: string
    defaultValue?: InputNumberValue
    placeholder?: string
    translate?: Translate
    outputFormat?: InputNumberOutputFormat
    onChange?: InputNumberChangeHandler
    value?: InputNumberValue
    type?: string
    min?: number
    max?: number
    /** forwarded to the `<input>` as `aria-required`, and to the wrapper as a `required` class */
    required?: boolean
}

const InputNumber = ({
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
    float,
    error,
    info,
    style,
    onFocus,
    onBlur,
    onRemove,
    title,
    defaultValue,
    placeholder,
    translate = Active.translate,
    outputFormat = {
        percentage: false,
        separateThousands: false,
    },
    onChange,
    value: valueFromParent,
    type: _1,
    min,
    max,
    ...props
}: InputNumberProps) => {
    // Build the input regex from min/decimals constraints so that disallowed
    // characters cannot be entered in the first place. min: 0 forbids the
    // minus sign; outputFormat.decimals: 0 forbids the decimal separator.
    const inputRegex = useMemo(() => {
        const allowMinus = !(typeof min === 'number' && min >= 0)
        const allowDecimal = !(outputFormat && outputFormat.decimals === 0)
        const minus = allowMinus ? '-?' : ''
        const decimal = allowDecimal ? '[.,]?\\d*' : ''
        return new RegExp(`^${minus}\\d*${decimal}$`)
    }, [min, outputFormat])

    const formatDecimals = (value: InputNumberValue, isUserTyping = false): InputNumberValue => {
        if (value && outputFormat && typeof outputFormat.decimals === 'number' && outputFormat.decimals >= 0) {
            const pattern = DECIMAL_PATTERN_TEMPLATE.replace('{decimals}', String(outputFormat.decimals))
            const re = new RegExp(pattern, 'g')
            // Don't format during active user editing
            if (!isUserTyping && !(re.test(value.toString()))) {
                return parseFloat(value.toString().replace(',', '')).toFixed(outputFormat.decimals)
            }
        }
        return value
    }

    const [active, setActive] = useState(false)
    const initialValue = valueFromParent !== undefined ? valueFromParent : defaultValue
    const [value, setValue] = useState(initialValue !== undefined ? initialValue.toString().replace(',', '.') : '')
    // Whether the parent has ever given a value: from then on, its value is what shows outside an edit. A ref
    // until 2026-10-08, set during the render; state now, set in the render that first sees a value, which is why
    // `controlled` also counts the value of this render.
    const [hasBeenControlled, setHasBeenControlled] = useState(valueFromParent !== undefined)
    if (valueFromParent !== undefined && !hasBeenControlled) setHasBeenControlled(true)
    const controlled = hasBeenControlled || valueFromParent !== undefined

    if (readonly) {
        props.className = 'readonly'
        props.readOnly = readonly
    } // React fix
    if (float) {
        if (!label && name) label = capitalize(name)
        if (!placeholder) placeholder = ' ' // required for Float label CSS to work
    }
    if (!id && label) id = 'input-' + label.replace(/ +?/g, '-')
    if (!label && title) props.title = translate(title)
    // An `aria-describedby` naming an id no element carries is worse than none: it is an axe
    // `aria-valid-attr-value` violation, and a screen reader announces nothing for it. The help
    // element exists only while there is a message, so the reference is conditional on the same
    // value — one binding for both, so the two cannot disagree again.
    const idHelp = (error || info) ? id + '-help' : undefined

    const hasValue = useMemo(() => 
        value !== '' && value !== undefined && !isNaN(parseFloat(value)), 
        [value]
    )
    
    const isDone = useMemo(() => 
        done == null ? !error && hasValue : done, 
        [done, error, hasValue]
    )

    // Re-syncs from the parent when its value changes or an edit ends, in the render that sees the change. An effect
    // did this until 2026-10-08, after the commit, which rendered the stale value once more. `synced` is what the last
    // sync saw, compared with `Object.is` as the effect compared its dependencies: a parent value of NaN must not
    // count as a change on every render. A local edit changes neither, so it is never overwritten with the parent's
    // stale value.
    const [synced, setSynced] = useState({ valueFromParent, active })
    if (!Object.is(synced.valueFromParent, valueFromParent) || synced.active !== active) {
        setSynced({ valueFromParent, active })
        // Don't update from parent during active editing to preserve user input
        if (!active && controlled) {
            const newValue = valueFromParent !== undefined ? valueFromParent.toString().replace(',', '.') : ''
            if (newValue !== value) setValue(newValue)
        }
    }

    const onChangeHandler = useCallback((
        value: string,
        name?: string,
        event?: React.SyntheticEvent<HTMLInputElement>,
    ) => {
        // Preserve string representation during user input to keep decimal separator
        let nextValue: InputNumberValue = value
        // Only convert to number if it's a complete valid number (not ending with decimal point)
        if (value !== '' && value !== '.' && !value.endsWith('.') && !isNaN(parseFloat(value))) {
            nextValue = parseFloat(value)
        }
        onChange && onChange(nextValue, name, event)
        setValue(value) // Keep the string representation for display
    }, [onChange])

    const commify = useCallback((n: InputNumberValue, separator = ' ') => {
        var parts = n.toString().split('.')
        const numberPart = parts[0]
        const decimalPart = parts[1]
        return numberPart.replace(THOUSANDS_SEPARATOR_REGEX, separator) + (decimalPart ? '.' + decimalPart : '')
    }, [])

    const format = useCallback((value: InputNumberValue | null | undefined): InputNumberValue => {
        if (value === '' || value == null) return ''
        if (outputFormat) {
            if (outputFormat.percentage) {
                return value + ' %'
            }
            if (outputFormat.separateThousands) {
                return commify(value)
            }
        }

        return value
    }, [outputFormat, commify])

    const parser = useCallback((value: string): string => {
        if (outputFormat) {
            if (outputFormat.percentage) {
                return value.replace(' %', '')
            }
            if (outputFormat.separateThousands) {
                if (!value) {
                    return value
                }
                return value.toString().replace(/ /g, '')
            }
        }
        return value
    }, [outputFormat])

    const displayValue = active || !hasValue ? value : format(value)

    return (
        <View
            className={classNames('input--wrapper', className, {
                float, done: isDone, resize, required: props.required
            })}
            style={style}
        >
            {!float &&
                <Row className="middle">
                    {label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
                    {onRemove && !readonly &&
                        <Button className="input__delete" onClick={() => onRemove(name || id)}><Icon
                            name="delete"/></Button>}
                </Row>
            }
            <Row className={classNames('input', { active, icon, lefty, error, info, unit })}>
                {icon && lefty && (isString(icon)
                        ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
                        : icon
                )}
                {unit && hasValue &&
                    <Text className="input__unit truncate">
                        <Text className="invisible" aria-hidden="true">{value}</Text>{' '}{unit}
                    </Text>
                }
                {stickyPlaceholder && placeholder && hasValue &&
                    <Text className="input__unit" aria-hidden="true">
                        <Text
                            className="invisible no-margin">{value}</Text>{placeholder.substring(String(value).length)}
                    </Text>
                }
                <input
                    type="text"
                    name={name}
                    id={id}
                    disabled={disabled}
                    aria-describedby={idHelp}
                    aria-invalid={!!error}
                    aria-required={props.required}
                    placeholder={translate(placeholder)}
                    inputMode="decimal"
                    onFocus={(...args) => {
                        !active && setActive(true)
                        onFocus && onFocus(...args)
                    }}
                    onBlur={(...args) => {
                        active && setActive(false)
                        if (value && value !== '' && value !== '.') {
                            let numValue = parseFloat(value)
                            if (!isNaN(numValue)) {
                                if (typeof min === 'number' && numValue < min) numValue = min
                                if (typeof max === 'number' && numValue > max) numValue = max
                                const formattedValue = formatDecimals(numValue, false)
                                const nextDisplay = String(formattedValue)
                                if (nextDisplay !== value) {
                                    setValue(nextDisplay)
                                    const nextNumeric = typeof formattedValue === 'number'
                                        ? formattedValue
                                        : parseFloat(formattedValue)
                                    onChange && onChange(nextNumeric, name, args[0])
                                }
                            }
                        }
                        onBlur && onBlur(...args)
                    }}
                    onChange={(e) => {
                        const inputValue = parser(e.target.value)
                        if (inputValue === '' || inputRegex.test(inputValue)) {
                            const normalizedValue = inputValue.replace(',', '.')
                            onChangeHandler(normalizedValue, name, e)
                        } else {
                            e.preventDefault()
                        }
                    }}
                    // DOM boundary (see ./domProps): the spread lands on the <input>, so ENGINE_PROPS only -- `name` is the field registration
    // path this control must carry, and the onChange above reads `props.name`.
                    {...omitProps(props, ENGINE_PROPS)}
                    value={displayValue}
                />
                {icon && !lefty && (isString(icon)
                        ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
                        : icon
                )}
                {float && label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
            </Row>
            {idHelp &&
                <View id={idHelp} className="field-help">
                    {error && <Text className="error">{translate(error)}</Text>}
                    {info && <Text className="info">{translate(info)}</Text>}
                </View>
            }
            {children}
        </View>
    )
}

export default InputNumber
