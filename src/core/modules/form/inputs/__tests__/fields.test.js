import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
// Force form module to fully resolve before each input is imported (cycle workaround)
import '../../utils'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

import DropdownField from '../DropdownField'
import InputField from '../InputField'
import InputNumberField from '../InputNumberField'
import SliderField from '../SliderField'
import ToggleField from '../ToggleField'
import InputDateField from '../InputDateField'

const wrap = (ui, initialValues = {}) => (
    <ConfigContext.Provider value={initialConfigState}>
        <Form
            onSubmit={() => {}}
            initialValues={initialValues}
            render={({ handleSubmit }) => <form onSubmit={handleSubmit}>{ui}</form>}
        />
    </ConfigContext.Provider>
)

describe('form/inputs - asField wrappers', () => {
    it('InputField renders an input wired to a final-form Field', () => {
        const { container } = render(wrap(<InputField name="x" label="X" />, { x: 'hello' }))
        const input = container.querySelector('input')
        expect(input).toBeInTheDocument()
        expect(input.value).toBe('hello')
    })

    it('InputField changes value through final-form', () => {
        let formApi
        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <Form
                    onSubmit={() => {}}
                    initialValues={{ x: '' }}
                    render={({ handleSubmit, form }) => {
                        formApi = form
                        return <form onSubmit={handleSubmit}><InputField name="x" /></form>
                    }}
                />
            </ConfigContext.Provider>
        )
        const input = container.querySelector('input')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'abc' } })
        fireEvent.blur(input)
        expect(formApi.getState().values.x).toBe('abc')
    })

    it('DropdownField renders a Semantic UI Dropdown', () => {
        const options = [{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }]
        const { container } = render(wrap(<DropdownField name="x" options={options} />, { x: 'a' }))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('InputNumberField renders a numeric-input wrapper', () => {
        const { container } = render(wrap(<InputNumberField name="x" />, { x: 42 }))
        expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('SliderField renders a slider track', () => {
        const { container } = render(wrap(<SliderField name="x" min={0} max={100} />, { x: 50 }))
        expect(container.querySelector('.app__slider')).toBeInTheDocument()
    })

    it('ToggleField renders a toggle checkbox', () => {
        const translate = (v) => v
        const { container } = render(
            wrap(<ToggleField name="x" label="Enable" translate={translate} />, { x: true })
        )
        const cb = container.querySelector('input[type="checkbox"]')
        expect(cb).toBeInTheDocument()
        expect(cb).toBeChecked()
    })

    it('ToggleField propagates changes to the form', () => {
        let formApi
        const translate = (v) => v
        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <Form
                    onSubmit={() => {}}
                    initialValues={{ x: false }}
                    render={({ handleSubmit, form }) => {
                        formApi = form
                        return (
                            <form onSubmit={handleSubmit}>
                                <ToggleField name="x" label="Enable" translate={translate} />
                            </form>
                        )
                    }}
                />
            </ConfigContext.Provider>
        )
        fireEvent.click(container.querySelector('input[type="checkbox"]'))
        expect(formApi.getState().values.x).toBe(true)
    })

    it('InputDateField renders without crashing', () => {
        const { container } = render(wrap(<InputDateField name="d" />, { d: '2024-01-15' }))
        expect(container.querySelector('.input--wrapper')).toBeInTheDocument()
    })

    it('class names follow the AsField suffix convention', () => {
        expect(InputField.name).toMatch(/AsField$/)
        expect(DropdownField.name).toMatch(/AsField$/)
        expect(InputNumberField.name).toMatch(/AsField$/)
        expect(SliderField.name).toMatch(/AsField$/)
    })

    it('ToggleField returns null when readonly and value is empty', () => {
        const translate = (v) => v
        const { container } = render(
            wrap(<ToggleField name="x" label="X" readonly translate={translate} />, { x: '' })
        )
        expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument()
    })

    it('ToggleField calls onChange callback with name', () => {
        const calls = []
        const onChange = function (...args) { calls.push(args) }
        const translate = (v) => v
        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <Form
                    onSubmit={() => {}}
                    initialValues={{ x: false }}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <ToggleField name="x" label="Enable" translate={translate} onChange={onChange} />
                        </form>
                    )}
                />
            </ConfigContext.Provider>
        )
        fireEvent.click(container.querySelector('input[type="checkbox"]'))
        expect(calls.length).toBe(1)
        expect(calls[0][1]).toEqual({ name: 'x' })
    })

    it('ToggleField uses name as label fallback when no label is provided', () => {
        const translate = (v) => v
        const { container } = render(
            wrap(<ToggleField name="namedField" translate={translate} />, { namedField: false })
        )
        expect(container.textContent).toContain('namedField')
    })
})
