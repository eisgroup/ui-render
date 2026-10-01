/** @jest-environment node */
/**
 * `validate: 'password'` WHERE THERE IS NO WINDOW.
 *
 * A browser without zxcvbn skips the strength check: `Active.passwordCheck` falls back to
 * `() => ({score: Infinity})`. On the server the getter returns what the host assigned, and
 * `undefined` when it assigned nothing — `_envs.runtime-environments.test.js` pins that — and the
 * rule called it anyway. Every password validation on a server that had not configured a checker
 * threw `TypeError: Active.passwordCheck is not a function`.
 */
import { OK, password } from '../validationRules'
import { Active } from '../../../utils'

afterEach(() => {
    Active.passwordCheck = undefined
})

describe('the password rule on the server', () => {
    it('skips the strength check when no checker is configured, as a browser without zxcvbn does', () => {
        expect(Active.passwordCheck).toBeUndefined()

        expect(password('abc')).toBe(OK)
    })

    it('uses the checker the host configured', () => {
        Active.passwordCheck = () => ({ score: 0 })

        expect(password('abc')).not.toBe(OK)
    })

    it('still lets an empty value through without asking the checker', () => {
        Active.passwordCheck = () => { throw new Error('not to be called') }

        expect(password('')).toBe(OK)
    })
})
