import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState, AppContext, initialAppState } from '../../../core/contexts'
import { storedTouched } from '../../../core/modules/form/utils'
import { Render } from '../../../core/ui-render'
import UIRender, { clearErrorsMap, formsStorage } from '../../../core/pages/main/rules'
import { examples } from '../Examples'

const messageFromConsoleCall = args => args
    .map(value => value instanceof Error ? value.message : String(value))
    .join(' ')

// React reports a given development warning only once per loaded module. Keep a strict
// allowlist for every warning we do observe without requiring another example to emit it again.
const EXPECTED_CONSOLE_ERROR_PATTERNS = [
    ['Unknown event handler property', 'onDataChanged'],
    ['React does not recognize', 'currencyCode'],
    ['non-boolean attribute', 'buttoned'],
    ['Cannot update during an existing state transition', 'DropdownAsField'],
    ['Invalid prop `error` of type `boolean`', 'InputNumber'],
    ['Invalid value for prop', 'translate'],
    ['prop `items[0].tab` is marked as required', 'Tabs'],
    ['prop `formProps` is marked as required', 'UIRender', 'Data'],
    ['prop `instance` is marked as required', 'UIRender', 'Data'],
    ['Invalid attribute name', '@class'],
]

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
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
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
        expect(examples).toHaveLength(37)
        expect(new Set(examples.map(({ id }) => id)).size).toBe(examples.length)
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

        const unexpectedWarnings = consoleError.mock.calls
            .map(messageFromConsoleCall)
            .filter(message => !EXPECTED_CONSOLE_ERROR_PATTERNS.some(requiredParts => (
                requiredParts.every(part => message.includes(part))
            )))
        expect(unexpectedWarnings).toEqual([])
    }

    test.each(examples)('$id mounts without renderer failures', assertExampleMountContract)
})
