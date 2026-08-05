import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import moment from 'moment'
import Picker from 'rc-picker'
import generateConfig from 'rc-picker/lib/generate/moment'
import enUs from 'rc-picker/lib/locale/en_US'
import InputDate from '../InputDate'
import { ConfigContext } from '../../contexts/ConfigContext'

jest.mock('rc-picker', () => {
    const React = require('react')

    return {
        __esModule: true,
        default: jest.fn(props => React.createElement('input', {
            'data-testid': 'date-picker',
            autoFocus: props.autoFocus,
            className: props.className,
            disabled: props.disabled,
            id: props.id,
            onBlur: props.onBlur,
            onFocus: props.onFocus,
            placeholder: props.placeholder,
            readOnly: props.inputReadOnly,
            title: props.title,
        })),
    }
})

const withConfig = (ui, config = {}) => (
    <ConfigContext.Provider value={config}>{ui}</ConfigContext.Provider>
)

const pickerProps = () => Picker.mock.calls[Picker.mock.calls.length - 1][0]

describe('InputDate rc-picker and form contracts', () => {
    beforeEach(() => {
        Picker.mockClear()
    })

    it('uses the stable rc-picker contract and is safe without a config provider', () => {
        render(<InputDate name="effectiveDate" />)

        expect(pickerProps()).toEqual(expect.objectContaining({
            allowClear: false,
            format: ['DD/MM/YYYY', 'YYYY-MM-DD'],
            generateConfig,
            locale: enUs,
            name: 'effectiveDate',
            picker: 'date',
            prefixCls: 'ui-render-picker',
            value: null,
        }))

        expect(() => pickerProps().onChange(moment('2026-07-31'))).not.toThrow()
    })

    it('normalizes a selected date and exposes the configured display format', () => {
        const onChange = jest.fn()
        render(withConfig(
            <InputDate name="effectiveDate" value="31.07.2026" onChange={onChange} />,
            { dateFormat: 'DD.MM.YYYY' }
        ))

        const props = pickerProps()
        expect(props.format).toEqual(['DD.MM.YYYY', 'YYYY-MM-DD'])
        expect(moment.isMoment(props.value)).toBe(true)
        expect(props.value.format('YYYY-MM-DD')).toBe('2026-07-31')

        props.onChange(moment('01.08.2026', 'DD.MM.YYYY'))
        expect(onChange).toHaveBeenCalledWith('2026-08-01')
    })

    it('reports null instead of an invalid date when the picker is cleared', () => {
        const onChange = jest.fn()
        render(withConfig(<InputDate name="effectiveDate" onChange={onChange} />))

        pickerProps().onChange(null)

        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('forwards focus and blur events required by Final Form', () => {
        const onFocus = jest.fn()
        const onBlur = jest.fn()
        const { getByTestId } = render(withConfig(
            <InputDate name="effectiveDate" onFocus={onFocus} onBlur={onBlur} />
        ))

        fireEvent.focus(getByTestId('date-picker'))
        fireEvent.blur(getByTestId('date-picker'))

        expect(onFocus).toHaveBeenCalledTimes(1)
        expect(onBlur).toHaveBeenCalledTimes(1)
    })

    it('forwards calendar selection details without changing their shape', () => {
        const onSelect = jest.fn()
        render(withConfig(<InputDate name="effectiveDate" onSelect={onSelect} />))
        const date = moment('2026-09-02')
        const info = { source: 'date' }

        pickerProps().onCalendarChange(date, '2026-09-02', info)

        expect(onSelect).toHaveBeenCalledWith(date, '2026-09-02', info)
    })

    it('maps readonly, autofocus and disabled to rc-picker semantics', () => {
        const { getByTestId } = render(withConfig(
            <InputDate name="effectiveDate" readonly autofocus disabled />
        ))

        expect(pickerProps()).toEqual(expect.objectContaining({
            autoFocus: true,
            className: 'readonly',
            disabled: true,
            inputReadOnly: true,
        }))
        expect(getByTestId('date-picker')).toHaveAttribute('readonly')
        expect(getByTestId('date-picker')).toBeDisabled()
    })

    it('translates the standalone title and placeholder passed to the picker', () => {
        const translate = jest.fn(value => value && `translated:${value}`)
        render(withConfig(
            <InputDate
                label={null}
                placeholder="Choose date"
                title="Effective date"
                translate={translate}
            />
        ))

        expect(pickerProps()).toEqual(expect.objectContaining({
            placeholder: 'translated:Choose date',
            title: 'translated:Effective date',
        }))
    })

    it('translates a labelled field and derives a stable id for help text', () => {
        const translate = value => value && `translated:${value}`
        const { container } = render(withConfig(
            <InputDate
                label="Birth Date"
                error="Required"
                title="Date tooltip"
                translate={translate}
            />
        ))

        expect(container.querySelector('label')).toHaveTextContent('translated:Birth Date')
        expect(container.querySelector('label')).toHaveAttribute('title', 'translated:Date tooltip')
        expect(pickerProps()).toEqual(expect.objectContaining({
            'aria-describedby': 'input-Birth-Date-help',
            id: 'input-Birth-Date',
        }))
        expect(container.querySelector('#input-Birth-Date-help')).toHaveTextContent('translated:Required')
    })

    it('normalizes defaultValue once and does not leak a raw date into rc-picker', () => {
        render(withConfig(
            <InputDate name="effectiveDate" defaultValue="2026-10-03" />,
            { dateFormat: 'YYYY-MM-DD' }
        ))

        expect(moment.isMoment(pickerProps().value)).toBe(true)
        expect(pickerProps().value.format('YYYY-MM-DD')).toBe('2026-10-03')
        expect(pickerProps().defaultValue).toBeUndefined()
    })

    it('accepts a native Date value at the rc-picker boundary', () => {
        render(withConfig(
            <InputDate name="effectiveDate" value={new Date(2026, 10, 5)} />,
            { dateFormat: 'YYYY-MM-DD' }
        ))

        expect(pickerProps().value.format('YYYY-MM-DD')).toBe('2026-11-05')
    })

    it('prefers value over defaultValue and turns invalid external values into null', () => {
        const { rerender } = render(withConfig(
            <InputDate
                name="effectiveDate"
                value="2026-11-04"
                defaultValue="2026-10-03"
            />,
            { dateFormat: 'YYYY-MM-DD' }
        ))

        expect(pickerProps().value.format('YYYY-MM-DD')).toBe('2026-11-04')

        rerender(withConfig(
            <InputDate name="effectiveDate" value="not-a-date" />,
            { dateFormat: 'YYYY-MM-DD' }
        ))
        expect(pickerProps().value).toBeNull()
    })

    it.each([null, ''])('keeps an explicit empty value %p instead of restoring defaultValue', value => {
        render(withConfig(
            <InputDate
                name="effectiveDate"
                value={value}
                defaultValue="2026-10-03"
            />,
            { dateFormat: 'YYYY-MM-DD' }
        ))

        expect(pickerProps().value).toBeNull()
    })
})
