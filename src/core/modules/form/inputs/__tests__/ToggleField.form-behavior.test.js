import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'
import { Active } from '../../../../utils'
import ToggleField from '../ToggleField'

const renderField = (field, initialValues = {}) => {
    let formApi
    const view = render(
        <ConfigContext.Provider value={initialConfigState}>
            <Form
                onSubmit={() => {}}
                initialValues={initialValues}
                render={({ form, handleSubmit }) => {
                    formApi = form
                    return <form onSubmit={handleSubmit}>{field}</form>
                }}
            />
        </ConfigContext.Provider>
    )

    return { ...view, formApi }
}

describe('ToggleField contracts', () => {
    it('registers react-final-form Field when the shared registry is empty', () => {
        jest.isolateModules(() => {
            const { Active: isolatedActive } = require('../../../../utils')
            const { Field } = require('react-final-form')
            isolatedActive.Field = null

            require('../ToggleField')

            expect(isolatedActive.Field).toBe(Field)
        })
    })

    it('uses the global translator fallback when translate is omitted', () => {
        const translate = Active.translate
        Active.translate = jest.fn(value => value && `translated:${value}`)

        try {
            const { container } = renderField(
                <ToggleField name="enabled" label="Enable" />,
                { enabled: false }
            )

            expect(container).toHaveTextContent('translated:Enable')
        } finally {
            Active.translate = translate
        }
    })

    it('round-trips custom true and false values through final-form', () => {
        const { container, formApi } = renderField(
            <ToggleField
                name="visibility"
                label="Visibility"
                valueTrue="PUBLIC"
                valueFalse="PRIVATE"
            />,
            { visibility: 'PRIVATE' }
        )
        const checkbox = container.querySelector('input[type="checkbox"]')

        expect(checkbox).not.toBeChecked()
        fireEvent.click(checkbox)
        expect(formApi.getState().values.visibility).toBe('PUBLIC')
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox)
        expect(formApi.getState().values.visibility).toBe('PRIVATE')
        expect(checkbox).not.toBeChecked()
    })

    it('shows a filled readonly value without allowing a form update', () => {
        const onChange = jest.fn()
        const { container, formApi } = renderField(
            <ToggleField name="enabled" label="Enable" readonly onChange={onChange} />,
            { enabled: false }
        )
        const checkbox = container.querySelector('input[type="checkbox"]')

        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toHaveAttribute('readonly')
        fireEvent.click(checkbox)
        expect(formApi.getState().values.enabled).toBe(false)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('omits an empty readonly value', () => {
        const { container } = renderField(
            <ToggleField name="enabled" label="Enable" readonly />,
            { enabled: '' }
        )

        expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument()
    })

    it('updates the form input before invoking the external callback', () => {
        const order = []
        const formChange = jest.fn(value => order.push(['form', value]))
        const onChange = function (value, details) {
            order.push(['callback', value, details])
        }
        const field = new ToggleField({ name: 'enabled', label: 'Enable', onChange })
        const checkbox = field.input({ input: { value: false, onChange: formChange } })

        checkbox.props.onChange(true)

        expect(order).toEqual([
            ['form', true],
            ['callback', true, { name: 'enabled' }],
        ])
    })

    it('rerenders labels when labelTrue and labelFalse props change', () => {
        const field = (labelTrue, labelFalse) => (
            <ConfigContext.Provider value={initialConfigState}>
                <Form
                    onSubmit={() => {}}
                    initialValues={{ enabled: true }}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <ToggleField
                                name="enabled"
                                labelTrue={labelTrue}
                                labelFalse={labelFalse}
                            />
                        </form>
                    )}
                />
            </ConfigContext.Provider>
        )
        const view = render(field('Enabled', 'Disabled'))

        expect(view.container).toHaveTextContent('Enabled')
        expect(view.container).toHaveTextContent('Disabled')

        view.rerender(field('Available', 'Unavailable'))

        expect(view.container).toHaveTextContent('Available')
        expect(view.container).toHaveTextContent('Unavailable')
        expect(view.container).not.toHaveTextContent('Enabled')
        expect(view.container).not.toHaveTextContent('Disabled')
    })

    it('does not leak instance or external onChange props into Active.Field', () => {
        const registered = Active.Field
        const FieldProbe = jest.fn(() => null)
        Active.Field = FieldProbe

        try {
            const onChange = jest.fn()
            render(
                <ToggleField
                    name="enabled"
                    label="Enable"
                    instance={{ internal: true }}
                    onChange={onChange}
                    labelTrue="Yes"
                />
            )
            const fieldProps = FieldProbe.mock.calls[0][0]

            expect(fieldProps).not.toHaveProperty('instance')
            expect(fieldProps).not.toHaveProperty('onChange')
            expect(fieldProps).toMatchObject({ name: 'enabled', labelTrue: 'Yes' })
            expect(fieldProps.component).toEqual(expect.any(Function))
        } finally {
            Active.Field = registered
        }
    })
})
