/**
 * TWO DOCUMENTS AND THE VALIDATION-ERROR CHANNEL (§9.3 step 3, risk R14).
 * =============================================================================================
 *
 * The channel has TWO module-level pieces and this file pins the state of both — the one that is
 * fixed, and the one that is not, so the diff that fixes the second is visible rather than silent.
 *
 *   FIXED. `errorHandlerFunction` was a module-level `let` assigned in the constructor, so the LAST
 *   instance constructed owned it. Measured before the fix: touching the FIRST document's required
 *   field delivered its error to the SECOND document's callback, and the first document's own
 *   callback was never called at all. Each instance now keeps its own.
 *
 *   STILL OPEN, pinned below. `errorsMap` is shared by every instance, so once the second document
 *   re-renders for any reason, its `componentDidUpdate` finds the first document's errors in that
 *   map and reports them as its own. Splitting the map is the next slice of step 3; until then the
 *   assertion at the bottom records what a host actually receives.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import { storedTouched } from '../../modules/form/utils' // eslint-disable-line import/first
import UIRender from '../rules' // eslint-disable-line import/first
import { clearErrorsMap, formsStorage } from '../../state/formRegistry' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts' // eslint-disable-line import/first

const appContext = { ...initialAppState, setPopupState: () => {} }
const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

afterEach(() => {
    cleanup()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
})

const docMeta = (name, label) => ({
    view: 'Row',
    items: [{ view: 'Input', name, label, validate: 'required', required: true }],
})

/** Two documents side by side, each with its own required field and its own error callback. */
const twoDocuments = (calls, extraOnSecond) => withProviders(
    <div>
        <UIRender form meta={docMeta('alpha.name', 'Alpha name')} data={{ alpha: { name: '' } }}
            initialValues={{ alpha: { name: '' } }} onSubmit={() => {}}
            getValidationErrors={errors => calls.push(['A', Object.keys(errors)])}/>
        <UIRender form meta={docMeta('beta.name', 'Beta name')} data={{ beta: { name: '' } }}
            initialValues={{ beta: { name: '' } }} onSubmit={() => {}}
            getValidationErrors={errors => calls.push(['B', Object.keys(errors)])} {...extraOnSecond}/>
    </div>
)

const touch = async (label, calls) => {
    const input = screen.getByLabelText(label)
    fireEvent.focus(input)
    fireEvent.blur(input)
    await waitFor(() => expect(calls.length).toBeGreaterThan(0))
}

describe('each document reports its validation errors to its own callback', () => {
    it('the error of the first document reaches the callback of the first document', async () => {
        const calls = []
        render(twoDocuments(calls))

        await touch('Alpha name', calls)

        expect(calls).toEqual([['A', ['alpha.name']]])
    })

    it('the error of the second document reaches the callback of the second document', async () => {
        const calls = []
        render(twoDocuments(calls))

        await touch('Beta name', calls)

        expect(calls).toEqual([['B', ['beta.name']]])
    })

    it('PINNED DEFECT: the other document repeats those errors once it re-renders', async () => {
        // Not what anyone wants — it is what the shared `errorsMap` produces, and it is recorded so
        // the slice that splits the map has to change this expectation to land.
        const calls = []
        const view = render(twoDocuments(calls))

        await touch('Alpha name', calls)
        calls.length = 0

        view.rerender(twoDocuments(calls, { embedded: true }))
        await waitFor(() => expect(calls.length).toBeGreaterThan(0))

        expect(calls).toEqual([['B', ['alpha.name']]])
    })
})
