import classNames from 'classnames'
import React, { useState, useRef, useMemo, useContext } from 'react'
import Row from './Row'
import Text from './Text'
import View from './View'
import { Active } from 'ui-utils-pack'
import Picker from 'rc-picker'
import enUs from 'rc-picker/lib/locale/en_US'
import generateConfig from "rc-picker/lib/generate/moment"
import moment from 'moment'

import './inputDate.css'
import ConfigContext from 'core/src/providers/ConfigProvider'

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
    ...props
}) => {
    const config = useContext(ConfigContext)
    const [active, setState] = useState(props.autoFocus)

    const dateFormat = useMemo(() => config.dateFormat || 'DD/MM/YYYY', [config])

    if (autofocus) props.autoFocus = autofocus // React fix
    if (readonly) {
        props.className = 'readonly'
        props.readOnly = readonly
    }

    if (!id && label) id = 'input-' + label.replace(/ +?/g, '-')
    if (!label && title) props.title = translate(title)

    const value = props.value ?
        moment(props.value) :
        props.defaultValue ?
            moment(props.defaultValue) : null

    const idHelp = useMemo(() => id + '-help', [id])

    const onDateChanged = (date, ...rest) => {
        onChange && onChange(moment(date, dateFormat).format('YYYY-MM-DD'))
    }

    return (
        <View
            className={classNames('input--wrapper', className, {
                resize, swatch: props.type === 'color', required: props.required
            })}
            style={style}
        >
            <Row className={classNames('input', {active, icon, lefty, error, info, unit})}>
                <Picker
                    name={name}
                    id={id}
                    disabled={disabled}
                    resize={resize}
                    aria-describedby={idHelp}
                    onFocus={(...args) => {
                        !active && setState(true)
                        onFocus && onFocus(...args)
                    }}
                    onBlur={(...args) => {
                        active && setState(false)
                        onBlur && onBlur(...args)
                    }}
                    placeholder={translate(placeholder)}
                    generateConfig={generateConfig}
                    {...props}
                    value={value}
                    allowClear={false}
                    locale={enUs}
                    picker='date'
                    format={dateFormat}
                    onChange={onDateChanged}
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

export { InputDate }
export default React.memo(InputDate)
