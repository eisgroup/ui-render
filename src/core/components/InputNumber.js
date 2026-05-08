import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { capitalize, isString } from '../utils'
import Button from './Button'
import Icon from './Icon'
import Label from './Label'
import Row from './Row'
import Text from './Text'
import View from './View'
import { Active } from '../utils'

// Constants
const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g
const DECIMAL_PATTERN_TEMPLATE = '^\\d*(\\.\\d{0,{decimals}})?$'

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
}) => {
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

    const formatDecimals = (value, isUserTyping = false) => {
        if (value && outputFormat && typeof outputFormat.decimals === 'number' && outputFormat.decimals >= 0) {
            const pattern = DECIMAL_PATTERN_TEMPLATE.replace('{decimals}', outputFormat.decimals)
            const re = new RegExp(pattern, 'g')
            // Don't format during active user editing
            if (!isUserTyping && !(re.test(value.toString()))) {
                return parseFloat(value.toString().replace(',', '')).toFixed(outputFormat.decimals)
            }
        }
        return value
    }

    const [active, setActive] = useState(false)
    const [value, setValue] = useState(valueFromParent !== undefined ? valueFromParent.toString().replace(',', '.') : '')

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
    const idHelp = id + '-help'

    const hasValue = useMemo(() => 
        value !== '' && value !== undefined && !isNaN(parseFloat(value)), 
        [value]
    )
    
    const isDone = useMemo(() => 
        done == null ? !error && hasValue : done, 
        [done, error, hasValue]
    )

    useEffect(() => {
        // Don't update from parent during active editing to preserve user input
        if (!active && valueFromParent !== value) {
            const newValue = valueFromParent !== undefined ? valueFromParent.toString().replace(',', '.') : ''
            setValue(newValue)
        }
    }, [valueFromParent, active])

    const onChangeHandler = useCallback((value, name, event) => {
        // Preserve string representation during user input to keep decimal separator
        let nextValue = value
        // Only convert to number if it's a complete valid number (not ending with decimal point)
        if (value !== '' && value !== '.' && !value.endsWith('.') && !isNaN(parseFloat(value))) {
            nextValue = parseFloat(value)
        }
        onChange(nextValue, name, event)
        setValue(value) // Keep the string representation for display
    }, [onChange])

    const commify = useCallback((n, separator = ' ') => {
        var parts = n.toString().split('.')
        const numberPart = parts[0]
        const decimalPart = parts[1]
        return numberPart.replace(THOUSANDS_SEPARATOR_REGEX, separator) + (decimalPart ? '.' + decimalPart : '')
    }, [])

    const format = useCallback((value, { userTyping, input }) => {
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

    const parser = useCallback((value) => {
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
                            className="invisible no-margin">{props.value}</Text>{placeholder.substring(props.value.length)}
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
                        const inputValue = e.target.value
                        if (inputValue === '' || inputRegex.test(inputValue)) {
                            const normalizedValue = inputValue.replace(',', '.')
                            onChangeHandler(normalizedValue, name, e)
                        } else {
                            e.preventDefault()
                        }
                    }}
                    {...props}
                    value={value}
                />
                {icon && !lefty && (isString(icon)
                        ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
                        : icon
                )}
                {float && label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
            </Row>
            {(error || info) &&
                <View id={idHelp} className="field-help">
                    {error && <Text className="error">{translate(error)}</Text>}
                    {info && <Text className="into">{translate(info)}</Text>}
                </View>
            }
            {children}
        </View>
    )
}

InputNumber.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    lefty: PropTypes.bool,
    onClickIcon: PropTypes.func,
    unit: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    done: PropTypes.bool,
    className: PropTypes.string,
    classNameIcon: PropTypes.string,
    children: PropTypes.node,
    stickyPlaceholder: PropTypes.bool,
    resize: PropTypes.bool,
    readonly: PropTypes.bool,
    float: PropTypes.bool,
    error: PropTypes.string,
    info: PropTypes.string,
    style: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onRemove: PropTypes.func,
    title: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.string,
    translate: PropTypes.func,
    outputFormat: PropTypes.shape({
        percentage: PropTypes.bool,
        separateThousands: PropTypes.bool,
        decimals: PropTypes.number,
    }),
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
}

export default InputNumber
