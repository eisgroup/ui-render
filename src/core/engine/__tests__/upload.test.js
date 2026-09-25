/**
 * WHAT AN `upload` ACTION SENDS THE HOST, AND WHAT IT DOES WITH THE ANSWER.
 * =============================================================================================
 *
 * Until §9.3 step 2 lifted it out of the `config` getter, this could only be reached by picking a
 * file in a rendered `Upload`. `rules.actions.test.js` and `rules.api-actions.test.js` still do
 * that for the payload, the reinitialisation and the failure, and are what proves the wiring;
 * these reach the edges nobody wired a field for.
 */
import { upload } from '../upload'

const csv = name => new File(['name,value'], name, { type: 'text/csv' })

/** What `Upload` passes as its third argument: the in-house `Dropzone`'s imperative handle. */
const dropzone = () => {
    const writes = []
    return {
        writes,
        handle: {
            fileInputEl: {
                set value (v) { writes.push(v) },
            },
        },
    }
}

/** A host `uploadFile` that records every call and answers with `answer`. */
const hostAnswering = answer => {
    const calls = []
    const uploadFile = (serialized, file) => {
        calls.push({ payload: JSON.parse(serialized), file })
        return Promise.resolve(answer)
    }
    return { uploadFile, calls }
}

let consoleError
beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
    consoleError.mockRestore()
})

describe('a working call', () => {
    it('sends every form value except the file field, and the file', async () => {
        const { uploadFile, calls } = hostAnswering({})
        const file = csv('rates.csv')

        await upload([[file], 'file', dropzone().handle], {
            uploadFile,
            readFormsData: () => ({ recordNumber: 'R-1', nested: { enabled: true }, file: 'stale' }),
            onUploaded: () => {},
        })

        expect(calls.map(call => call.payload)).toEqual([{ recordNumber: 'R-1', nested: { enabled: true } }])
        // `toBe`, not `toEqual`: a File has no own enumerable properties, so any two compare equal.
        expect(calls[0].file).toBe(file)
    })

    it('hands over the answer normalised, and clears the file input', async () => {
        const { uploadFile } = hostAnswering({ status: 'After', when: '2026-09-25T10:00:00Z' })
        const zone = dropzone()
        const applied = []

        await upload([[csv('a.csv')], 'file', zone.handle], {
            uploadFile,
            readFormsData: () => ({}),
            onUploaded: data => applied.push(data),
        })

        expect(applied).toEqual([{ status: 'After', when: '2026-09-25' }])
        expect(zone.writes).toEqual([null])
    })
})

describe('when there is nothing to do', () => {
    it('reads nothing and sends nothing without a file', async () => {
        const { uploadFile, calls } = hostAnswering({})
        let reads = 0

        await upload([[], 'file', dropzone().handle], {
            uploadFile,
            readFormsData: () => { reads++; return {} },
            onUploaded: () => {},
        })

        expect(calls).toEqual([])
        expect(reads).toBe(0)
    })

    it('reads nothing when the host provides no uploadFile', async () => {
        let reads = 0

        await upload([[csv('a.csv')], 'file', dropzone().handle], {
            uploadFile: undefined,
            readFormsData: () => { reads++; return {} },
            onUploaded: () => {},
        })

        expect(reads).toBe(0)
    })
})

describe('a failure', () => {
    it('is logged, and neither applies anything nor clears the input', async () => {
        const failure = new Error('upload rejected')
        const zone = dropzone()
        const applied = []

        await upload([[csv('a.csv')], 'file', zone.handle], {
            uploadFile: () => Promise.reject(failure),
            readFormsData: () => ({}),
            onUploaded: data => applied.push(data),
        })

        expect(consoleError).toHaveBeenCalledWith(failure)
        expect(applied).toHaveLength(0)
        expect(zone.writes).toEqual([])
    })

    it('includes an answer that cannot be applied', async () => {
        const failure = new Error('cannot apply')
        const { uploadFile } = hostAnswering({})

        await upload([[csv('a.csv')], 'file', dropzone().handle], {
            uploadFile,
            readFormsData: () => ({}),
            onUploaded: () => { throw failure },
        })

        expect(consoleError).toHaveBeenCalledWith(failure)
    })
})

describe('the file field', () => {
    it('is excluded by path, so a dotted name leaves the rest of its object alone', async () => {
        // Until this was fixed the exclusion was `delete data[path]`, which removed a top-level key
        // called `attachment.file` that does not exist, and the field went to the host as `[{}]`
        // (see the end-to-end case in `rules.actions.test.js`).
        const { uploadFile, calls } = hostAnswering({})

        await upload([[csv('a.csv')], 'attachment.file', dropzone().handle], {
            uploadFile,
            readFormsData: () => ({ recordNumber: 'R-1', attachment: { file: 'stale', note: 'kept' } }),
            onUploaded: () => {},
        })

        expect(calls[0].payload).toEqual({ recordNumber: 'R-1', attachment: { note: 'kept' } })
    })
})

describe('an empty answer', () => {
    it.each([['undefined', undefined], ['null', null], ['an empty string', ''], ['zero', 0]])(
        'of %s is ignored: the data is kept, and the input still cleared',
        async (_label, answer) => {
            // Until this was fixed it was handed over as the new data. With `undefined` or `null` the
            // engine then rendered an empty container, the upload control included (see
            // `rules.actions.test.js`); with `''` or `0` every form value was wiped.
            const { uploadFile } = hostAnswering(answer)
            const zone = dropzone()
            const applied = []

            await upload([[csv('a.csv')], 'file', zone.handle], {
                uploadFile,
                readFormsData: () => ({}),
                onUploaded: data => applied.push(data),
            })

            // `toHaveLength`, not `toEqual([])`: toEqual ignores undefined array items, so an
            // answer of `undefined` handed over would still pass.
            expect(applied).toHaveLength(0)
            expect(zone.writes).toEqual([null])
        }
    )
})

describe('pinned, not fixed', () => {
    it('PINNED: only the first of several files is sent', async () => {
        const { uploadFile, calls } = hostAnswering({})
        const first = csv('first.csv')

        await upload([[first, csv('second.csv')], 'file', dropzone().handle], {
            uploadFile,
            readFormsData: () => ({}),
            onUploaded: () => {},
        })

        expect(calls).toHaveLength(1)
        expect(calls[0].file).toBe(first)
    })
})
