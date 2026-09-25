/**
 * WHAT A `download` ACTION ASKS THE HOST FOR, AND WHAT IT SAVES.
 * =============================================================================================
 *
 * Until §9.3 step 2 lifted it out of the `config` getter, this could only be reached by clicking a
 * rendered button. `rules.actions.test.js` and `rules.api-actions.test.js` still do that for the
 * success and the failure path, and are what proves the wiring; these reach the argument handling
 * and the edges nobody wired a button for.
 *
 * The save is the real `services/downloadFile`, observed at the one place a browser would show it:
 * the `download` attribute of the link it clicks.
 */
import { describeFailure, download } from '../download'

let saved
let anchorClick
let originalCreateObjectURL
let originalRevokeObjectURL

beforeEach(() => {
    saved = []
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    // jsdom implements neither.
    URL.createObjectURL = () => 'blob:saved'
    URL.revokeObjectURL = () => {}
    anchorClick = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
        saved.push(this.getAttribute('download'))
    })
})

afterEach(() => {
    anchorClick.mockRestore()
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
})

/** A host `downloadFile` that records what it was asked for and answers with a body. */
const hostReturning = body => {
    const requested = []
    const downloadFile = fileName => {
        requested.push(fileName)
        return Promise.resolve({ blob: () => Promise.resolve(body) })
    }
    return { downloadFile, requested }
}

const failNever = error => {
    throw new Error(`onFailure was not expected, got: ${error}`)
}

describe('a working call', () => {
    it('asks the host for the named file and saves the body under that name', async () => {
        const { downloadFile, requested } = hostReturning(new Blob(['period,value']))

        await download(['report.csv'], { downloadFile, onFailure: failNever })

        expect(requested).toEqual(['report.csv'])
        expect(saved).toEqual(['report.csv'])
    })

    it('drops the click event a Button passes first', async () => {
        const { downloadFile, requested } = hostReturning(new Blob(['x']))

        await download([{ nativeEvent: {}, target: {} }, 'report.csv'], { downloadFile, onFailure: failNever })

        expect(requested).toEqual(['report.csv'])
    })
})

describe('which leading argument counts as the event', () => {
    it.each([
        ['a plain object', {}],
        ['null', null],
    ])('any object does, %s included', async (_name, leading) => {
        const { downloadFile, requested } = hostReturning(new Blob(['x']))

        await download([leading, 'a.csv'], { downloadFile, onFailure: failNever })

        expect(requested).toEqual(['a.csv'])
    })

    it('but only one is dropped', async () => {
        const second = {}
        const { downloadFile, requested } = hostReturning(new Blob(['x']))

        await download([{}, second, 'a.csv'], { downloadFile, onFailure: () => {} })

        expect(requested).toEqual([second])
    })
})

describe('what the arguments mean beyond the first', () => {
    it('saves under a second argument, while the host is asked for the first', async () => {
        // The shape `button-download_meta.js` writes. It meant this until 2022-11, when the switch
        // to the host's `downloadFile` silently dropped the second argument; restored since.
        const { downloadFile, requested } = hostReturning(new Blob(['x']))

        await download(
            [{ nativeEvent: {} }, '/static/images/ui-architecture.png', 'optional-file-name-to-save-as.png'],
            { downloadFile, onFailure: failNever }
        )

        expect(requested).toEqual(['/static/images/ui-architecture.png'])
        expect(saved).toEqual(['optional-file-name-to-save-as.png'])
    })

    it.each([['an empty string', ''], ['a non-string', 42]])(
        'falls back to the requested name when the second argument is %s',
        async (_label, saveAs) => {
            const { downloadFile } = hostReturning(new Blob(['x']))

            await download(['report.csv', saveAs], { downloadFile, onFailure: failNever })

            expect(saved).toEqual(['report.csv'])
        }
    )

    it('with no file name asks the host for undefined and leaves the saved name to the browser', async () => {
        // Asking the host is defensible, since a host may have a default. Until this was fixed the
        // file was saved under the string "undefined"; the attribute is now empty, which still
        // downloads and lets the browser name the file.
        const { downloadFile, requested } = hostReturning(new Blob(['x']))

        await download([{ nativeEvent: {} }], { downloadFile, onFailure: failNever })

        expect(requested).toEqual([undefined])
        expect(saved).toEqual([''])
    })
})

describe('without a usable host call', () => {
    it('returns false and does nothing when the host provides no downloadFile', () => {
        const failures = []

        expect(download(['a.csv'], { downloadFile: undefined, onFailure: e => failures.push(e) })).toBe(false)
        expect(failures).toEqual([])
        expect(saved).toEqual([])
    })

    it('hands a failed fetch to onFailure and saves nothing', async () => {
        const failure = new Error('network unavailable')
        const failures = []

        await download(['a.csv'], { downloadFile: () => Promise.reject(failure), onFailure: e => failures.push(e) })

        expect(failures).toEqual([failure])
        expect(saved).toEqual([])
    })

    it('hands a response with no body to onFailure', async () => {
        // What the demo harness's `downloadFile: () => Promise.resolve({})` produces.
        const failures = []

        await download(['a.csv'], { downloadFile: () => Promise.resolve({}), onFailure: e => failures.push(e) })

        expect(failures).toHaveLength(1)
        expect(failures[0]).toBeInstanceOf(TypeError)
        expect(saved).toEqual([])
    })

    it('throws, rather than reporting, when the host returns no promise', () => {
        // Unchanged from before the extraction: the host call is not wrapped, so a host breaking its
        // contract fails loudly instead of showing a "Download Failed" popup.
        const failures = []

        expect(() => download(['a.csv'], { downloadFile: () => undefined, onFailure: e => failures.push(e) }))
            .toThrow(TypeError)
        expect(failures).toEqual([])
    })
})

describe('describeFailure, the text the failure popup can title itself with', () => {
    it.each([
        ['a string', 'quota exceeded', 'quota exceeded'],
        ['an Error, by its message', new TypeError('Failed to fetch'), 'Failed to fetch'],
        ['an Error with no message, by its name', new RangeError(), 'RangeError'],
        ['nothing', undefined, ''],
        ['null', null, ''],
        ['anything else, as a string', 42, '42'],
    ])('describes %s', (_label, error, expected) => {
        expect(describeFailure(error)).toBe(expected)
    })

    describe('a Response', () => {
        // jsdom defines no `Response`; see `apiError.test.js`.
        class TestResponse {
            constructor (status, statusText) {
                this.status = status
                this.statusText = statusText
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

        it('is described by its status', () => {
            expect(describeFailure(new TestResponse(404, 'Not Found'))).toBe('404 Not Found')
            expect(describeFailure(new TestResponse(502, ''))).toBe('502')
        })
    })
})
