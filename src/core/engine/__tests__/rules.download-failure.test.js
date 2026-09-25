/**
 * A FAILED DOWNLOAD SHOWS A POPUP, AND THE REST OF THE UI SURVIVES IT.
 * =============================================================================================
 *
 * `rules.api-actions.test.js` checks the popup STATE a failed download produces, with the popup
 * mocked. That is exactly why nobody saw what the state did once rendered: the rejection went into
 * the title unchanged, and an `Error` there — what `fetch` rejects with when the network fails — is
 * an object React cannot render, so the whole UI was replaced by "Objects are not valid as a React
 * child". Found in the running demo; this renders the real popup.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import UIRender, { formsStorage } from '../rules' // eslint-disable-line import/first
import { AppProvider } from '../../providers' // eslint-disable-line import/first

describe('a download the host rejects', () => {
    let popupRoot

    beforeEach(() => {
        formsStorage.clear()
        popupRoot = document.createElement('div')
        popupRoot.id = 'render-popup-root'
        document.body.appendChild(popupRoot)
    })

    afterEach(() => {
        popupRoot.remove()
    })

    it('shows the failure in a popup titled with the error message, and keeps the UI', async () => {
        render(
            <AppProvider>
                <UIRender
                    meta={{
                        view: 'Button',
                        children: 'Download report',
                        onClick: { name: 'download', args: ['report.csv'] },
                    }}
                    data={{}}
                    apiCalls={{ downloadFile: () => Promise.reject(new TypeError('Failed to fetch')) }}
                />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'Download report' }))

        await waitFor(() => expect(popupRoot).toHaveTextContent('Failed to fetch'))
        expect(popupRoot).toHaveTextContent('Download Failed!')
        expect(screen.getByRole('button', { name: 'Download report' })).toBeInTheDocument()
    })
})
