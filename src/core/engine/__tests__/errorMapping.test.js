import { errorsProcessing, mapErrorObjectToUIFormat, convertFieldNameToTitleCaseText, showsAnError } from '../errorMapping'
import { errorsFor, holdFixableField, touchedFor } from '../../state/formRegistry'

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

    // The contract publishes `text: string`, and a host is entitled to read it as one.
    it('leaves out an entry whose error is not a string', () => {
        const result = mapErrorObjectToUIFormat({
            'items': [{ name: 'Name is Required' }],
            'items[0].name': 'Name is Required',
            'group': { child: 'Invalid value' },
            'count': 3,
        })
        expect(result).toEqual({ 'items[0].name': { messages: [{ text: 'Name is Required' }] } })
    })

    // The one non-string that reaches the report: an array field's error, which final-form builds
    // from its items' errors. The item is reported under its own name, so nothing is lost.
    it('reports an array field through its items, not as the array of their errors', () => {
        const fieldStates = {
            'items': { name: 'items', error: [{ name: 'Required' }], touched: true },
            'items[0].name': { name: 'items[0].name', error: 'Required', touched: true },
        }
        const form = {
            getRegisteredFields: () => Object.keys(fieldStates),
            getFieldState: name => fieldStates[name],
        }
        errorsProcessing(form, {})

        expect(Object.keys(errorsFor(form))).toEqual(['items', 'items[0].name'])
        expect(mapErrorObjectToUIFormat(errorsFor(form))).toEqual({
            'items[0].name': { messages: [{ text: 'Name is Required' }] },
        })
    })
})

describe('showsAnError', () => {
    /** A form whose fields are in the given states, every one of them counted as one the user can fix. */
    function formWith (fieldStates, fixable = Object.keys(fieldStates)) {
        const form = { getFieldState: name => fieldStates[name] }
        fixable.forEach(name => holdFixableField(form, name))
        return form
    }
    const formsOf = (...forms) => new Map(forms.map(form => [{}, { form, meta: {}, tree: {}, draftRow: false }]))

    const required = { error: 'Required', touched: false, pristine: true }

    it('is false for no forms, and for a form whose fields are valid', () => {
        expect(showsAnError(new Map())).toBe(false)
        expect(showsAnError(formsOf(formWith({ weight: { touched: true, pristine: false } })))).toBe(false)
    })

    it('is false for an error the field does not show yet: untouched and unchanged', () => {
        expect(showsAnError(formsOf(formWith({ weight: required })))).toBe(false)
    })

    it.each([
        ['touched', { ...required, touched: true }, false],
        ['changed', { ...required, pristine: false }, false],
        ['remembered as touched', required, true],
    ])('is true for an error the field shows once it is %s', (_label, state, remembered) => {
        const form = formWith({ weight: state })
        if (remembered) touchedFor(form).weight = true

        expect(showsAnError(formsOf(formWith({}), form))).toBe(true)
    })

    it('reads only the fields whose error the user can fix', () => {
        // `months` is disabled or readonly, or shows no error of its own: nothing counted it.
        const form = formWith({ months: { ...required, touched: true } }, [])

        expect(showsAnError(formsOf(form))).toBe(false)
    })

    it('skips a counted field the form no longer registers', () => {
        expect(showsAnError(formsOf(formWith({}, ['gone'])))).toBe(false)
    })

    it('changes no field state: it only reads it', () => {
        const state = { ...required, touched: true }
        const form = formWith({ weight: state })

        showsAnError(formsOf(form))

        expect(state).toEqual({ error: 'Required', touched: true, pristine: true })
        expect(touchedFor(form)).toEqual({})
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
