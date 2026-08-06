import classNames from '../utils/classNames'
import React, { useMemo, useContext } from 'react'
import Row from './Row'
import Text from './Text'
import View from './View'
import Label from './Label'
import { Active } from '../utils'
import Picker from 'rc-picker'
import enUs from 'rc-picker/lib/locale/en_US'
import generateConfig from 'rc-picker/lib/generate/moment'
import moment from 'moment'
import { ConfigContext } from '../contexts'

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
}) => {
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

    const toMoment = (date) => {
        if (date == null || date === '') return null

        let parsed
        if (moment.isMoment(date)) parsed = date
        else if (typeof date !== 'string') parsed = moment(date)
        else {
            // Strict pass first, so the configured format wins over Moment's guessing. Then fall
            // back to a lenient read: a stored value in a shape we do not list (unpadded `2021-1-2`,
            // `2021/01/02`, `Jan 2, 2021`) must still render. Showing it blank reads as "unset" to
            // the user, who then overwrites a perfectly good date.
            parsed = moment(date, [dateFormat, 'YYYY-MM-DD', moment.ISO_8601], true)
            if (!parsed.isValid()) parsed = moment(date)
        }

        return parsed.isValid() ? parsed : null
    }

    const sourceValue = valueFromParent !== undefined ? valueFromParent : defaultValue
    const value = toMoment(sourceValue)

    const idHelp = useMemo(() => id + '-help', [id])

    const onDateChanged = (date) => {
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
                    {...props}
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
            {(error || info) &&
                <View id={idHelp} className='field-help'>
                    {error && <Text className='error'>{translate(error)}</Text>}
                    {info && <Text className='into'>{translate(info)}</Text>}
                </View>
            }
            {children}
        </View>
    )
}

export default InputDate
// export default React.memo(InputDate)
