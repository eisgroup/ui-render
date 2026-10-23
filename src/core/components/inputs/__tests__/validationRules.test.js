import {
    OK,
    isRequired,
    url,
    email,
    maxLength,
    password,
} from '../validationRules'
import { phraseMessage } from '../../../utils/phrases'

// Each rule fails with a built-in phrase, which a field shows in its document's language, and with the same one
// each time: final-form tells a field its error changed when the error is another object.
describe('the messages the rules fail with', () => {
    it('are the built-in phrases of the rules', () => {
        expect(isRequired('')).toEqual(phraseMessage('REQUIRED'))
        expect(url('not a url')).toEqual(phraseMessage('INVALID_URL'))
        expect(email('not-an-email')).toEqual(phraseMessage('INVALID_EMAIL_ADDRESS'))
        expect(maxLength()('x'.repeat(101))).toEqual(phraseMessage('MUST_BE_LESS_THAN_CHARACTERS', { count: 100 }))
        expect(maxLength(3)('abcd')).toEqual(phraseMessage('MUST_BE_LESS_THAN_CHARACTERS', { count: 3 }))
    })

    it('are the same object each time a rule fails', () => {
        expect(isRequired(null)).toBe(isRequired(''))
        expect(url('a')).toBe(url('b'))
        expect(email('a')).toBe(email('b'))
        const tooLong = maxLength(3)
        expect(tooLong('abcd')).toBe(tooLong('abcde'))
    })

    it('fails a weak password with its phrase', () => {
        const original = window.zxcvbn
        window.zxcvbn = () => ({ score: 0 })
        try {
            expect(password('abc')).toEqual(phraseMessage('PASSWORD_IS_TOO_WEAK'))
            expect(password('abc')).toBe(password('abd'))
        } finally {
            window.zxcvbn = original
        }
    })

    it('leave `password.confirm`, which no meta can name, with its own English message', () => {
        password('Strong#Pass123!')
        expect(password.confirm('different')).toBe('Password mismatch')
    })
})

describe('isRequired', () => {
    it('returns OK for non-empty values', () => {
        expect(isRequired('x')).toBe(OK)
        expect(isRequired(0)).toBe(OK)
        expect(isRequired(false)).toBe(OK)
        expect(isRequired([1])).toBe(OK)
        expect(isRequired({ a: 1 })).toBe(OK)
    })
    it('returns an error message for empty values', () => {
        expect(isRequired(undefined)).toBeTruthy()
        expect(isRequired(null)).toBeTruthy()
        expect(isRequired('')).toBeTruthy()
        expect(isRequired(NaN)).toBeTruthy()
        expect(isRequired({})).toBeTruthy()
    })
})

describe('url', () => {
    it('returns OK for valid URLs with protocol', () => {
        expect(url('https://example.com')).toBe(OK)
        expect(url('http://x.com/path')).toBe(OK)
    })
    it('returns OK for falsy/empty values', () => {
        expect(url('')).toBeFalsy()
        expect(url(null)).toBeFalsy()
        expect(url(undefined)).toBeFalsy()
    })
    it('returns an error message for invalid URLs', () => {
        expect(url('not a url')).toBeTruthy()
    })
})

describe('email', () => {
    it('returns OK for valid emails', () => {
        expect(email('me@example.com')).toBe(OK)
    })
    it('returns OK for empty values', () => {
        expect(email('')).toBeFalsy()
        expect(email(null)).toBeFalsy()
        expect(email(undefined)).toBeFalsy()
    })
    it('returns an error message for invalid emails', () => {
        expect(email('not-an-email')).toBeTruthy()
    })
})

describe('maxLength', () => {
    it('returns OK when value length is within limit', () => {
        const validator = maxLength(5)
        expect(validator('abc')).toBe(OK)
        expect(validator('12345')).toBe(OK)
    })
    it('returns an error message when value exceeds limit', () => {
        const validator = maxLength(3)
        expect(validator('abcd')).toBeTruthy()
    })
})

describe('password / password.confirm', () => {
    // Note: in jsdom Active.passwordCheck defaults to () => ({score: Infinity}),
    // so password strength always passes. We exercise the validator surface only.
    it('returns OK for empty value', () => {
        expect(password('')).toBe(OK)
        expect(password(null)).toBe(OK)
    })
    it('returns OK when password check is satisfied', () => {
        expect(password('Strong#Pass123!')).toBe(OK)
    })
    it('returns the failure message when password strength check fails', () => {
        const original = window.zxcvbn
        window.zxcvbn = () => ({ score: 0 })
        try {
            expect(password('abc')).toBeTruthy()
        } finally {
            window.zxcvbn = original
        }
    })
    it('password.confirm matches the last password call', () => {
        password('Strong#Pass123!')
        expect(password.confirm('Strong#Pass123!')).toBe(OK)
        expect(password.confirm('different')).toBeTruthy()
    })
})
