import { FIELD } from '../../variables/fields'
import { toSlider, NAME, FORM_ASYNC_VALIDATE, API_VALIDATE_FAIL_CODE } from '../constants'

describe('FIELD definitions (populated by form/constants)', () => {
    it('FIELD.TYPE contains form-specific types', () => {
        expect(FIELD.TYPE.INPUT).toBe('Input')
        expect(FIELD.TYPE.SELECT).toBe('Select')
        expect(FIELD.TYPE.TOGGLE).toBe('Toggle')
        expect(FIELD.TYPE.UPLOAD).toBe('Upload')
    })

    it('FIELD.VALIDATE maps to ID strings', () => {
        expect(FIELD.VALIDATE.EMAIL).toBe('email')
        expect(FIELD.VALIDATE.REQUIRED).toBe('required')
    })

    it('FIELD.VALIDATION maps each ID to a function', () => {
        expect(typeof FIELD.VALIDATION.email).toBe('function')
        expect(typeof FIELD.VALIDATION.required).toBe('function')
        expect(typeof FIELD.VALIDATION.url).toBe('function')
        expect(typeof FIELD.VALIDATION.password).toBe('function')
        expect(typeof FIELD.VALIDATION.maxLength).toBe('function')
    })

    it('FIELD.DEF.email has expected shape', () => {
        expect(FIELD.DEF.email.name).toBe('email')
        expect(FIELD.DEF.email.type).toBe('email')
        expect(FIELD.DEF.email.view).toBe(FIELD.TYPE.INPUT)
        expect(typeof FIELD.DEF.email.label).toBe('string')
    })
})

describe('module constants', () => {
    it('NAME is FORM', () => {
        expect(NAME).toBe('FORM')
    })
    it('FORM_ASYNC_VALIDATE is FORM_ASYNC_VALIDATE', () => {
        expect(FORM_ASYNC_VALIDATE).toBe('FORM_ASYNC_VALIDATE')
    })
    it('API_VALIDATE_FAIL_CODE is 422', () => {
        expect(API_VALIDATE_FAIL_CODE).toBe(422)
    })
})

describe('toSlider', () => {
    // Provide FIELD.MIN_MAX entries needed by toSlider
    beforeAll(() => {
        if (!FIELD.MIN_MAX.testRange) {
            FIELD.MIN_MAX = { testRange: [0, 100] }
        }
    })

    it('attaches min/max/defaultValue and SliderLabel view to each field', () => {
        const fields = [{ id: 'testRange', label: 'Test Range' }]
        const out = toSlider(fields)
        expect(out[0]).toMatchObject({
            id: 'testRange',
            label: 'Test Range',
            min: 0,
            max: 100,
            defaultValue: [0, 100],
            view: FIELD.TYPE.SLIDER,
        })
    })

    it('merges in extra options like namePrefix', () => {
        const out = toSlider([{ id: 'testRange' }], { namePrefix: 'user.' })
        expect(out[0].namePrefix).toBe('user.')
    })
})
