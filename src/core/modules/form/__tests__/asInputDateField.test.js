import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
// Force `form/utils` to fully load before asInputDateField pulls `storedTouched` from it,
// otherwise the renders.js → asField cycle blows up.
import '../utils'
import { asInputDateField } from '../asInputDateField'

const TestDate = ({ value, onChange, name, error, ...rest }) => (
    <div>
        <input
            data-testid="dt"
            value={value || ''}
            onChange={(e) => onChange(e.target.value, name, e)}
            name={name}
            {...rest}
        />
        {error && <span data-testid="err">{error}</span>}
    </div>
)

const WrappedDate = asInputDateField(TestDate)

const RFForm = ({ children, initialValues = {} }) => (
    <Form
        onSubmit={() => {}}
        initialValues={initialValues}
        render={({ handleSubmit }) => <form onSubmit={handleSubmit}>{children}</form>}
    />
)

describe('asInputDateField', () => {
    it('renders a Field-wrapped input with initial value', () => {
        const { getByTestId } = render(
            <RFForm initialValues={{ d: '2024-01-15' }}>
                <WrappedDate name="d" />
            </RFForm>
        )
        expect(getByTestId('dt')).toHaveValue('2024-01-15')
    })

    it('propagates onChange back to final-form', () => {
        let formApi
        const { getByTestId } = render(
            <Form
                onSubmit={() => {}}
                initialValues={{ d: '' }}
                render={({ handleSubmit, form }) => {
                    formApi = form
                    return <form onSubmit={handleSubmit}><WrappedDate name="d" /></form>
                }}
            />
        )
        const input = getByTestId('dt')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '2024-06-15' } })
        expect(formApi.getState().values.d).toBe('2024-06-15')
    })

    it('hides readonly field when its value is empty', () => {
        const { container } = render(
            <RFForm initialValues={{ d: '' }}>
                <WrappedDate name="d" readonly />
            </RFForm>
        )
        expect(container.querySelector('[data-testid="dt"]')).not.toBeInTheDocument()
    })

    it('shows readonly field when it has a value', () => {
        const { container } = render(
            <RFForm initialValues={{ d: '2024-01-15' }}>
                <WrappedDate name="d" readonly />
            </RFForm>
        )
        expect(container.querySelector('[data-testid="dt"]')).toBeInTheDocument()
    })

    it('applies parse on outgoing onChange', () => {
        const onChange = jest.fn()
        const parse = (v) => `parsed:${v}`
        const { getByTestId } = render(
            <RFForm initialValues={{ d: '' }}>
                <WrappedDate name="d" parse={parse} onChange={onChange} />
            </RFForm>
        )
        const input = getByTestId('dt')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '2024-01-01' } })
        expect(onChange).toHaveBeenCalled()
        expect(onChange.mock.calls[0][0]).toBe('parsed:2024-01-01')
    })

    it('class name has AsField suffix', () => {
        expect(WrappedDate.name).toBe('TestDateAsField')
    })

    it('handles defaultValue when value is undefined', () => {
        const { container } = render(
            <RFForm initialValues={{}}>
                <WrappedDate name="d" defaultValue="2024-01-01" />
            </RFForm>
        )
        expect(container.querySelector('[data-testid="dt"]')).toBeInTheDocument()
    })

    it('caches value while user is focused', () => {
        const { getByTestId } = render(
            <RFForm initialValues={{ d: '2024-01-15' }}>
                <WrappedDate name="d" />
            </RFForm>
        )
        const input = getByTestId('dt')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '2024-12-25' } })
        expect(input.value).toBe('2024-12-25')
    })

    it('does not crash when instance prop is provided', () => {
        const instance = { props: { initialValues: { d: '2024-01-15' } } }
        const { container } = render(
            <RFForm initialValues={{ d: '2024-01-15' }}>
                <WrappedDate name="d" instance={instance} />
            </RFForm>
        )
        expect(container.querySelector('[data-testid="dt"]')).toBeInTheDocument()
    })
})
