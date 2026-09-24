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
 *   ALSO FIXED, and this file is where it was pinned first. `errorsMap` used to be shared by every
 *   instance, so once the second document re-rendered for any reason its `componentDidUpdate` found
 *   the first document's errors in that map and reported them as its own. The map is now keyed by
 *   the final-form `form` object, and the assertion at the bottom — which USED to record the wrong
 *   behaviour deliberately — now records the right one. That flip is the whole point of pinning a
 *   defect rather than describing it in a comment.
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
import { formsStorage } from '../../state/formRegistry' // eslint-disable-line import/first
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

    it('the other document stays silent about them, even after it re-renders', async () => {
        // The shared map used to make this `[['B', ['alpha.name']]]`: the second document repeating
        // the first one's error as its own. Re-rendering is what exposed it, because that is what
        // runs `componentDidUpdate` against the shared map.
        const calls = []
        const view = render(twoDocuments(calls))

        await touch('Alpha name', calls)
        calls.length = 0

        view.rerender(twoDocuments(calls, { embedded: true }))
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(calls).toEqual([])
    })
})
