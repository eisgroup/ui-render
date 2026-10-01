import { FIELD } from '../../variables/fields'
import '../constants'

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
})
