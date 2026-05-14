import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import { asField } from '../utils'

// Simple controlled input that uses props.value + props.onChange,
// like a normal Semantic input would.
const TestInput = ({ value, onChange, name, error, ...rest }) => (
    <div>
        <input
            data-testid="ti"
            value={value || ''}
            onChange={(e) => onChange(e.target.value, name, e)}
            name={name}
            {...rest}
        />
        {error && <span data-testid="err">{error}</span>}
    </div>
)

const Wrapped = asField(TestInput)

const RFForm = ({ children, initialValues = {} }) => (
    <Form
        onSubmit={() => {}}
        initialValues={initialValues}
        render={({ handleSubmit }) => <form onSubmit={handleSubmit}>{children}</form>}
    />
)

describe('asField', () => {
    it('renders the wrapped component inside a final-form Field', () => {
        const { getByTestId } = render(
            <RFForm initialValues={{ x: 'hello' }}>
                <Wrapped name="x" />
            </RFForm>
        )
        expect(getByTestId('ti')).toHaveValue('hello')
    })

    it('propagates changes back to final-form', () => {
        let formApi
        const { getByTestId } = render(
            <Form
                onSubmit={() => {}}
                initialValues={{ x: '' }}
                render={({ handleSubmit, form }) => {
                    formApi = form
                    return <form onSubmit={handleSubmit}><Wrapped name="x" /></form>
                }}
            />
        )
        const input = getByTestId('ti')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'abc' } })
        fireEvent.blur(input)
        expect(formApi.getState().values.x).toBe('abc')
    })

    it('returns a class whose name ends with AsField', () => {
        expect(Wrapped.name).toBe('TestInputAsField')
    })

    it('applies parse on change', () => {
        const Trim = asField(TestInput)
        const parse = (v) => (typeof v === 'string' ? v.trim() : v)
        let formApi
        const { getByTestId } = render(
            <Form
                onSubmit={() => {}}
                initialValues={{ x: '' }}
                render={({ handleSubmit, form }) => {
                    formApi = form
                    return <form onSubmit={handleSubmit}><Trim name="x" parse={parse} /></form>
                }}
            />
        )
        const input = getByTestId('ti')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '  hi  ' } })
        fireEvent.blur(input)
        expect(formApi.getState().values.x).toBe('hi')
    })

    it('does not render readonly fields with empty required values', () => {
        const TwoRequiredReadonly = asField(TestInput)
        const { container } = render(
            <RFForm initialValues={{ x: '' }}>
                <TwoRequiredReadonly name="x" readonly />
            </RFForm>
        )
        // Component returns null in Input renderer when readonly + isRequired(value) is true
        expect(container.querySelector('[data-testid="ti"]')).not.toBeInTheDocument()
    })

    it('renders readonly fields when they have a value', () => {
        const ReadonlyWithValue = asField(TestInput)
        const { container } = render(
            <RFForm initialValues={{ x: 'present' }}>
                <ReadonlyWithValue name="x" readonly />
            </RFForm>
        )
        expect(container.querySelector('[data-testid="ti"]')).toBeInTheDocument()
    })

    it('accepts a defaultValue prop without crashing', () => {
        const FieldWithDefault = asField(TestInput)
        expect(() => render(
            <RFForm initialValues={{}}>
                <FieldWithDefault name="x" defaultValue="initial" />
            </RFForm>
        )).not.toThrow()
    })

    it('accepts a format prop and renders without crashing', () => {
        const FormatField = asField(TestInput)
        const format = (v) => `formatted:${v}`
        expect(() => render(
            <RFForm initialValues={{ x: 'raw' }}>
                <FormatField name="x" format={format} />
            </RFForm>
        )).not.toThrow()
    })

    it('applies sanitize for Dropdown displayName', () => {
        const FakeDropdown = (props) => <div data-testid="dd">{String(props.value)}</div>
        FakeDropdown.displayName = 'Dropdown'
        const Wrapped = asField(FakeDropdown)
        const { container } = render(
            <RFForm initialValues={{ x: '' }}>
                <Wrapped name="x" />
            </RFForm>
        )
        // Empty string is converted to undefined for Dropdown
        expect(container.querySelector('[data-testid="dd"]').textContent).toBe('undefined')
    })

    it('shows error text when touched and error is present', () => {
        const ErrorField = asField(TestInput)
        const validate = (v) => (!v ? 'Required' : undefined)
        const { container } = render(
            <RFForm initialValues={{ x: '' }}>
                <ErrorField name="x" validate={validate} />
            </RFForm>
        )
        const input = container.querySelector('[data-testid="ti"]')
        fireEvent.focus(input)
        fireEvent.blur(input)
        expect(container.querySelector('[data-testid="err"]')).toBeInTheDocument()
    })
})
