import {
    ENV,
    NODE_ENV,
    __PROD__,
    __DEV__,
    Active,
} from '../_envs'

describe('_envs - environment flags', () => {
    it('ENV is at least an object', () => {
        expect(typeof ENV).toBe('object')
        expect(ENV).not.toBeNull()
    })

    it('NODE_ENV is a string or undefined', () => {
        expect(NODE_ENV === undefined || typeof NODE_ENV === 'string').toBe(true)
    })

    it('exposes mode flags as booleans', () => {
        expect(typeof __PROD__).toBe('boolean')
        expect(typeof __DEV__).toBe('boolean')
    })
})

describe('_envs - Active', () => {
    it('Active.LANG defaults to English', () => {
        expect(Active.LANG._).toBe('en')
    })

    it('Active.translate is identity by default', () => {
        expect(Active.translate('hello')).toBe('hello')
    })

    it('Active.passwordCheck getter returns function in browser/jsdom (no zxcvbn)', () => {
        const fn = Active.passwordCheck
        expect(typeof fn).toBe('function')
        expect(fn()).toEqual({ score: Infinity })
    })

    it('Active.passwordCheck uses window.zxcvbn when available', () => {
        const original = window.zxcvbn
        window.zxcvbn = (v) => ({ score: 3, value: v })
        try {
            const fn = Active.passwordCheck
            expect(fn('test')).toEqual({ score: 3, value: 'test' })
        } finally {
            window.zxcvbn = original
        }
    })

    it('Active.passwordCheck setter assigns to internal zxcvbn slot', () => {
        const original = Active.zxcvbn
        Active.passwordCheck = (v) => ({ score: 5, v })
        try {
            expect(Active.zxcvbn).toBeDefined()
            // Getter prefers window.zxcvbn in client → so setter has no observable effect there
            // We can still check the storage slot directly
            expect(Active.zxcvbn('x')).toEqual({ score: 5, v: 'x' })
        } finally {
            Active.zxcvbn = original
        }
    })
})
