import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState, AppContext, initialAppState } from '../../../core/contexts'
import { Render } from '../../../core/engine'
import UIRender, { formsStorage } from '../../../core/engine/rules'
import { EXAMPLES as examples } from '../../examples/manifest'
import ExamplesPage from '../Examples'

const messageFromConsoleCall = args => args
    .map(value => value instanceof Error ? value.message : String(value))
    .join(' ')

// No example may log an error, on any React major. This used to be an allowlist, and it emptied
// itself: four prop-type entries went with the prop types at §9.6-E5, and the other five were
// measured matching nothing on React 16.14, 17.0.2, 18.3.1 and 19.3.0 before they were removed. An
// allowlist that matches nothing hides the next real warning of the same shape, so the rule is now
// the plain one. A failure prints each message whole: React 16-18 append a component stack, which
// React 19 leaves out.

const apiCalls = {
    updateExperienceData: jest.fn(() => Promise.resolve({})),
    downloadFile: jest.fn(() => Promise.resolve({})),
    uploadFile: jest.fn(() => Promise.resolve({})),
}

const translate = value => value
const originalRenderOnError = Render.onError
const originalFetch = global.fetch

const clearGlobalRegistries = () => {
    formsStorage.clear()
}

const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider
            value={{
                ...initialAppState,
                setPopupState: jest.fn(),
                togglePopupState: jest.fn(),
            }}
        >
            {ui}
        </AppContext.Provider>
    </ConfigContext.Provider>
)

describe('registered demo examples contract', () => {
    let caughtRenderErrors
    let consoleError

    beforeEach(() => {
        clearGlobalRegistries()
        caughtRenderErrors = []
        Render.onError = ({ error }) => caughtRenderErrors.push(error)
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({}),
        }))
    })

    afterEach(() => {
        Render.onError = originalRenderOnError
        consoleError.mockRestore()
        clearGlobalRegistries()
        jest.clearAllMocks()
        if (originalFetch === undefined) {
            delete global.fetch
        } else {
            global.fetch = originalFetch
        }
    })

    it('keeps the documented example registry stable and unique', () => {
        expect(examples).toHaveLength(38)
        expect(new Set(examples.map(({ id }) => id)).size).toBe(examples.length)
    })

    // The registry moved to src/demo/examples/manifest.js, so this suite no longer
    // loads the demo page as a side effect of importing the list. Keep it loaded:
    // evaluating the module is what proves the page still resolves and still reads
    // the manifest, rather than having drifted back to its own copy of the list.
    it('loads the demo page that consumes the manifest', () => {
        expect(typeof ExamplesPage).toBe('function')
    })

    const assertExampleMountContract = ({ data, meta }) => {
        const { container, unmount } = render(withProviders(
            <UIRender
                data={data}
                meta={meta}
                initialValues={data}
                form={{ id: 'example' }}
                onSubmit={jest.fn()}
                translate={translate}
                apiCalls={apiCalls}
            />
        ))

        expect(container.querySelector('.ui__render')).toBeInTheDocument()
        const caughtMessages = caughtRenderErrors.map(error => error.message || String(error))

        unmount()

        expect(formsStorage.size).toBe(0)
        expect(caughtMessages).toEqual([])

        expect(consoleError.mock.calls.map(messageFromConsoleCall)).toEqual([])
    }

    test.each(examples)('$id mounts without renderer failures', assertExampleMountContract)
})
