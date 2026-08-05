import '../utils'
import { Field } from 'react-final-form'
import { asInputDateField } from '../asInputDateField'
import { storedTouched } from '../utils'
import { Active } from '../../../utils'

const DateInput = () => null
const DateField = asInputDateField(DateInput)

const inputApi = (overrides = {}) => ({
    name: 'effectiveDate',
    onBlur: jest.fn(),
    onChange: jest.fn(),
    onFocus: jest.fn(),
    ...overrides,
})

describe('asInputDateField edge contracts', () => {
    afterEach(() => {
        Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    })

    it('registers react-final-form Field when the shared registry is empty', () => {
        const registered = Active.Field
        try {
            Active.Field = null
            const RegisteredDateField = asInputDateField(DateInput)
            expect(RegisteredDateField).toEqual(expect.any(Function))
            expect(Active.Field).toBe(Field)
        } finally {
            Active.Field = registered
        }
    })

    it('exposes a null cached value until one is assigned', () => {
        const field = new DateField({ name: 'effectiveDate' })
        expect(field.value).toBeNull()

        field.value = '2026-07-31'
        expect(field.value).toBe('2026-07-31')
    })

    it('formats a pristine default value but leaves a non-pristine empty value undefined', () => {
        const format = jest.fn(value => `formatted:${value}`)
        const field = new DateField({
            name: 'effectiveDate',
            defaultValue: '2026-01-01',
            format,
        })
        const input = inputApi()

        const pristine = field.Input({
            input: { ...input, value: undefined },
            meta: { pristine: true },
        })
        expect(pristine.props.value).toBe('formatted:2026-01-01')
        expect(format).toHaveBeenCalledWith('2026-01-01')

        const nonPristine = field.Input({
            input: { ...input, value: undefined },
            meta: { pristine: false },
        })
        expect(nonPristine.props.value).toBeNull()
    })

    it('uses an unformatted default and supports omitted meta state', () => {
        const field = new DateField({
            name: 'effectiveDate',
            defaultValue: '2026-02-02',
        })
        const input = inputApi()

        const defaulted = field.Input({
            input: { ...input, value: undefined },
            meta: { pristine: true },
        })
        expect(defaulted.props.value).toBe('2026-02-02')

        const withoutMeta = field.Input({
            input: { ...input, value: '2026-03-03' },
        })
        expect(withoutMeta.props.value).toBe('2026-03-03')
    })

    it('prefers an explicit error after interaction and otherwise exposes the form error', () => {
        const input = inputApi()
        storedTouched.effectiveDate = true
        const explicit = new DateField({
            name: 'effectiveDate',
            error: 'Configured error',
        })
        const explicitView = explicit.Input({
            input: { ...input, value: 'invalid' },
            meta: { error: 'Form error', pristine: true, touched: false },
        })
        expect(explicitView.props.error).toBe('Configured error')

        delete storedTouched.effectiveDate
        const formOwned = new DateField({ name: 'effectiveDate' })
        const formView = formOwned.Input({
            input: { ...input, value: 'invalid' },
            meta: { error: 'Form error', pristine: false, touched: false },
        })
        expect(formView.props.error).toBe('Form error')
    })

    it('keeps a readonly forced value visible and wires focus/blur handlers', () => {
        const input = inputApi()
        const field = new DateField({
            name: 'effectiveDate',
            readonly: true,
            value: 'forced-value',
        })
        const view = field.Input({
            input: { ...input, value: undefined },
            meta: { pristine: false },
        })

        expect(view).not.toBeNull()
        expect(view.props.value).toBe('forced-value')
        expect(view.props.onFocus).toBe(field.handleFocus)
        expect(view.props.onBlur).toBe(field.handleBlur)

        field.handleFocus('focus-event')
        expect(field.hasFocus).toBe(true)
        expect(input.onFocus).toHaveBeenCalledWith('focus-event')

        field.handleBlur('blur-event')
        expect(field.hasFocus).toBe(false)
        expect(input.onBlur).toHaveBeenCalledWith('blur-event')
    })

    it('passes raw changes to final-form without caching when unfocused', () => {
        const onChange = jest.fn()
        const field = new DateField({ name: 'effectiveDate', onChange })
        field.input = inputApi()

        field.handleChange('2026-04-04', 'extra')

        expect(field.value).toBeNull()
        expect(field.input.onChange).toHaveBeenCalledWith('2026-04-04')
        expect(onChange).toHaveBeenCalledWith('2026-04-04', 'extra')
    })

    it('derives a wrapper name from the component constructor when its function name is blank', () => {
        const AnonymousInput = () => null
        Object.defineProperty(AnonymousInput, 'name', { value: '' })

        const AnonymousField = asInputDateField(AnonymousInput)

        expect(AnonymousField.name).toBe('FunctionAsField')
    })
})
