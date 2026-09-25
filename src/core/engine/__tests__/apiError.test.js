/**
 * WHAT A FAILED API CALL SHOWS THE USER.
 * =============================================================================================
 *
 * Thirty-five of the sixty lines of the `onApplyPeriods` action, and until §9.3 step 2 lifted them
 * out there was no way to reach any of it except by making a real call fail with a real `Response`.
 * Every body shape below was handled by that code and asserted by nothing.
 */
import { messageFromError } from '../apiError'

/**
 * jsdom defines no `Response`, which is why none of this could be tested where it lived: inside the
 * handler, `error instanceof Response` throws a ReferenceError the moment the identifier is absent,
 * so in this environment an API failure never reached the message-building code at all. A browser
 * has the global and the original path works there. The stand-in supplies the only two things the
 * function needs — the constructor to match against, and a body to read.
 */
class TestResponse {
    constructor (body) {
        this.body = body
    }

    text () {
        return Promise.resolve(this.body)
    }
}

let originalResponse
beforeAll(() => {
    // eslint-disable-next-line no-undef
    originalResponse = global.Response
    // eslint-disable-next-line no-undef
    global.Response = TestResponse
})
afterAll(() => {
    // eslint-disable-next-line no-undef
    if (originalResponse === undefined) delete global.Response
    // eslint-disable-next-line no-undef
    else global.Response = originalResponse
})

const responseWith = body => new TestResponse(body)

describe('an error that is not a Response speaks for itself', () => {
    it('hands back an Error unchanged', async () => {
        const error = new Error('network down')

        await expect(messageFromError(error)).resolves.toBe(error)
    })

    it('hands back a string unchanged', async () => {
        await expect(messageFromError('plain failure')).resolves.toBe('plain failure')
    })
})

describe('a Response body', () => {
    it('gives up its `message` when it is JSON that has one', async () => {
        const message = await messageFromError(responseWith(JSON.stringify({ message: 'Row is locked' })))

        expect(message).toBe('Row is locked')
    })

    it('is used whole when it is JSON without a `message`', async () => {
        const message = await messageFromError(responseWith(JSON.stringify({ code: 42, detail: 'nope' })))

        // The caller renders this with `Json`, so an object is a usable answer.
        expect(message).toEqual({ code: 42, detail: 'nope' })
    })

    it('is shown raw when only its KEYS are unquoted — quoting them is not enough', async () => {
        // The quoting pass turns `{message: Row is locked}` into `{"message": Row is locked}`, which
        // is still not JSON because the VALUE is bare. Measured, not assumed: the pass only rescues
        // a body whose values are already quoted.
        const message = await messageFromError(responseWith('{message: Row is locked}'))

        expect(message).toBe('{message: Row is locked}')
    })

    it('is used as plain text when it is not JSON at all', async () => {
        const message = await messageFromError(responseWith('upstream timed out'))

        expect(message).toBe('upstream timed out')
    })

    it('falls back to the error itself when the body is empty', async () => {
        const error = responseWith('')

        await expect(messageFromError(error)).resolves.toBe(error)
    })

    it('falls back to the error itself when the body parses to something falsy', async () => {
        const error = responseWith('null')

        await expect(messageFromError(error)).resolves.toBe(error)
    })
})

describe('the embedded message= … errors= shape', () => {
    it('keeps only the part before `errors`', async () => {
        const body = JSON.stringify({ message: 'message=Period overlaps an existing one errors=[]' })

        const message = await messageFromError(responseWith(body))

        expect(message).toBe('Period overlaps an existing one ')
    })

    it('keeps the whole message when the half before `errors` is empty', async () => {
        const body = JSON.stringify({ message: 'message=errors=[]' })

        const message = await messageFromError(responseWith(body))

        expect(message).toBe('message=errors=[]')
    })

    it('PINNED DEFECT: a `key:value` anywhere in the body defeats the whole thing', async () => {
        // The quoting pass runs over the ENTIRE text, including inside string values. A message that
        // embeds `errors=[{code:12}]` — the very shape the branch above exists for — becomes
        // `errors=[{"code":12}]`, whose quotes break the JSON string containing them. Parsing then
        // fails and the user is shown the raw body instead of the clean message.
        const body = JSON.stringify({ message: 'message=Period overlaps errors=[{code:12}]' })

        const message = await messageFromError(responseWith(body))

        expect(message).toBe(body)
    })

    it('leaves a message without that shape alone', async () => {
        const body = JSON.stringify({ message: 'Period overlaps an existing one' })

        const message = await messageFromError(responseWith(body))

        expect(message).toBe('Period overlaps an existing one')
    })
})
