/**
 * WHAT AN `onApplyPeriods` ACTION SENDS THE HOST, AND WHAT IT DOES WITH THE ANSWER.
 * =============================================================================================
 *
 * Until §9.3 step 2 lifted it out of the `config` getter, this could only be reached by clicking a
 * rendered button. `rules.api-actions.test.js` and `rules.async-errors-and-callbacks.test.js` still
 * do that for the applied answer, the ignored empty one and the popup, and are what proves the
 * wiring. The body shapes a failure can have are `apiError.test.js`'s; this checks only that the
 * message it produces is the one handed on.
 */
import { applyPeriods } from '../applyPeriods'

const hostAnswering = answer => {
    const sent = []
    const updateData = data => {
        sent.push(data)
        return Promise.resolve(answer)
    }
    return { updateData, sent }
}

const failNever = (message, error) => {
    throw new Error(`onFailure was not expected, got: ${error}`)
}

describe('a working call', () => {
    it('sends every form value and hands over the answer normalised', async () => {
        const { updateData, sent } = hostAnswering({ status: 'After', effectiveAt: '2026-07-31T22:15:00.000Z' })
        const applied = []

        await applyPeriods({
            updateData,
            readFormsData: () => ({ status: 'Before', requestId: 'r-2' }),
            onUpdated: data => applied.push(data),
            onFailure: failNever,
        })

        expect(sent).toEqual([{ status: 'Before', requestId: 'r-2' }])
        expect(applied).toEqual([{ status: 'After', effectiveAt: '2026-07-31' }])
    })

    it.each([['undefined', undefined], ['null', null], ['an empty string', ''], ['zero', 0]])(
        'ignores an answer of %s and leaves the data alone',
        async (_label, answer) => {
            const { updateData } = hostAnswering(answer)
            const applied = []

            await applyPeriods({
                updateData,
                readFormsData: () => ({}),
                onUpdated: data => applied.push(data),
                onFailure: failNever,
            })

            // `toHaveLength`, not `toEqual([])`: toEqual ignores undefined array items, so an
            // answer of `undefined` handed over would still pass.
            expect(applied).toHaveLength(0)
        }
    )
})

it('returns false and reads nothing when the host provides no updateData', async () => {
    let reads = 0

    await expect(applyPeriods({
        updateData: undefined,
        readFormsData: () => { reads++; return {} },
        onUpdated: () => {},
        onFailure: failNever,
    })).resolves.toBe(false)
    expect(reads).toBe(0)
})

describe('a failure', () => {
    it('is handed on with the message read from it, and the error itself', async () => {
        const failure = new Error('network down')
        const failures = []

        await applyPeriods({
            updateData: () => Promise.reject(failure),
            readFormsData: () => ({}),
            onUpdated: () => {},
            onFailure: (message, error) => failures.push([message, error]),
        })

        // For anything that is not a Response, `messageFromError` hands the error back unchanged.
        expect(failures).toEqual([[failure, failure]])
    })

    describe('from a Response', () => {
        // jsdom defines no `Response`; see `apiError.test.js` for why and for every body shape.
        class TestResponse {
            constructor (body, readable = true) {
                this.body = body
                this.readable = readable
            }

            text () {
                return this.readable ? Promise.resolve(this.body) : Promise.reject(new Error('body unreadable'))
            }
        }

        let originalResponse
        beforeAll(() => {
            originalResponse = global.Response
            global.Response = TestResponse
        })
        afterAll(() => {
            if (originalResponse === undefined) delete global.Response
            else global.Response = originalResponse
        })

        it('hands on the message in its body', async () => {
            const failure = new TestResponse(JSON.stringify({ message: 'Row is locked' }))
            const failures = []

            await applyPeriods({
                updateData: () => Promise.reject(failure),
                readFormsData: () => ({}),
                onUpdated: () => {},
                onFailure: (message, error) => failures.push([message, error]),
            })

            expect(failures).toEqual([['Row is locked', failure]])
        })

        it('PINNED: rejects without handing anything on when the body cannot be read', async () => {
            // Unguarded before the extraction as well: no popup and no console entry for this one.
            const failures = []

            await expect(applyPeriods({
                updateData: () => Promise.reject(new TestResponse('', false)),
                readFormsData: () => ({}),
                onUpdated: () => {},
                onFailure: (message, error) => failures.push([message, error]),
            })).rejects.toThrow('body unreadable')
            expect(failures).toEqual([])
        })
    })

    it('includes an answer that cannot be applied', async () => {
        const failure = new Error('cannot apply')
        const { updateData } = hostAnswering({ status: 'After' })
        const failures = []

        await applyPeriods({
            updateData,
            readFormsData: () => ({}),
            onUpdated: () => { throw failure },
            onFailure: (message, error) => failures.push(error),
        })

        expect(failures).toEqual([failure])
    })
})
