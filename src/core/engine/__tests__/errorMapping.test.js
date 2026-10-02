import { errorsProcessing, mapErrorObjectToUIFormat, convertFieldNameToTitleCaseText } from '../errorMapping'
import { errorsFor, touchedFor } from '../../state/formRegistry'

describe('errorsProcessing', () => {
    function makeFormWithErrors (fieldStates, registered = Object.keys(fieldStates)) {
        return {
            getRegisteredFields: () => registered,
            getFieldState: (name) => fieldStates[name] || {},
        }
    }

    it('returns early when meta has relativePath but no relativeIndex', () => {
        const form = makeFormWithErrors({})
        expect(() => errorsProcessing(form, { relativePath: 'x' })).not.toThrow()
    })

    it('returns early when no fields are registered', () => {
        const form = makeFormWithErrors({}, [])
        expect(() => errorsProcessing(form, {})).not.toThrow()
    })

    it('does nothing when fields have no error', () => {
        const form = makeFormWithErrors({ foo: { name: 'foo', touched: true } })
        errorsProcessing(form, {})
        expect(errorsFor(form).foo).toBeUndefined()
    })

    it('records a touched field error', () => {
        const form = makeFormWithErrors({
            email: {
                name: 'email',
                error: 'Email is invalid',
                touched: true,
            },
        })

        errorsProcessing(form, {})

        expect(errorsFor(form)).toEqual({
            email: 'Email is invalid',
        })
    })

    it('turns a Required error into a field-specific message', () => {
        const form = makeFormWithErrors({
            ownerName: {
                name: 'ownerName',
                error: 'Required',
                touched: true,
            },
        })

        errorsProcessing(form, {})

        expect(errorsFor(form).ownerName).toBe('Owner Name is Required')
    })

    it('records an error for a field remembered as touched', () => {
        const form = makeFormWithErrors({
            phoneNumber: {
                name: 'phoneNumber',
                error: 'Phone is invalid',
                touched: false,
            },
        })
        // Remembered against THIS form since §9.3 step 3 — final-form reports it as untouched, and
        // the remembered touch is the whole reason the error is still recorded.
        touchedFor(form).phoneNumber = true

        errorsProcessing(form, {})

        expect(errorsFor(form).phoneNumber).toBe('Phone is invalid')
    })

    it('removes a stale error after the field becomes valid', () => {
        const fieldState = {
            name: 'rows[1].startDate',
            error: 'Required',
            touched: true,
        }
        const form = makeFormWithErrors({
            'rows[1].startDate': fieldState,
        })

        errorsProcessing(form, { relativePath: 'rows', relativeIndex: 1 })
        expect(errorsFor(form)['rows[1].startDate']).toBe('Start Date is Required')

        delete fieldState.error
        errorsProcessing(form, { relativePath: 'rows', relativeIndex: 1 })

        expect(errorsFor(form)['rows[1].startDate']).toBeUndefined()
    })
})

describe('mapErrorObjectToUIFormat', () => {
    it('converts flat errors to UI format', () => {
        const errors = { fieldA: 'Field A is required', fieldB: 'Invalid value' }
        const result = mapErrorObjectToUIFormat(errors)
        expect(result).toEqual({
            fieldA: { messages: [{ text: 'Field A is required' }] },
            fieldB: { messages: [{ text: 'Invalid value' }] },
        })
    })

    it('returns empty object for empty input', () => {
        expect(mapErrorObjectToUIFormat({})).toEqual({})
    })

    it('handles single error', () => {
        const result = mapErrorObjectToUIFormat({ email: 'Invalid email' })
        expect(result.email.messages).toHaveLength(1)
        expect(result.email.messages[0].text).toBe('Invalid email')
    })
})

describe('convertFieldNameToTitleCaseText', () => {
    it('converts camelCase to title case', () => {
        expect(convertFieldNameToTitleCaseText('firstName')).toBe('First Name')
    })

    it('handles dot-separated path (uses last segment)', () => {
        expect(convertFieldNameToTitleCaseText('user.profile.firstName')).toBe('First Name')
    })

    it('handles single word', () => {
        expect(convertFieldNameToTitleCaseText('name')).toBe('Name')
    })

    it('handles already capitalized', () => {
        expect(convertFieldNameToTitleCaseText('Name')).toBe('Name')
    })

    it('handles multiple consecutive uppercase letters', () => {
        expect(convertFieldNameToTitleCaseText('startDateUTC')).toBe('Start Date U T C')
    })
})
