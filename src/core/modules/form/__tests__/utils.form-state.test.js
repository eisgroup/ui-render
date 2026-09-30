/**
 * WHAT A DOCUMENT'S FORM LAYER TELLS ITS HOST.
 * =============================================================================================
 *
 * The form layer watches the form and the props it is given, and tells the host two things:
 *  - `onChangeState(instance)` whenever whether the document can be saved changes, and
 *    `onChangeState({})` when it unmounts;
 *  - `onDataChanged()` when the form's state changes while the user's edits are in.
 *
 * Until §9.3 step 6 part of this ran in `UNSAFE_componentWillReceiveProps`, before the render. It is
 * pinned here by what the host receives, not by when, so it holds for whatever the layer is.
 */
// The engine hands the `fetch` action the global one whenever it builds a meta.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import '../utils' // eslint-disable-line import/first
import Render from '../../../engine/Render' // eslint-disable-line import/first
import UIRender from '../../../engine/rules' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts' // eslint-disable-line import/first
import { clearEngineGlobals } from '../../../../demo/testing/mountExample' // eslint-disable-line import/first

let seen
let resolve
beforeAll(() => {
    resolve = Render.Component
    Render.Component = function RecordingResolver (props) {
        if (props.instance && !seen.includes(props.instance)) seen.push(props.instance)
        return React.createElement(resolve, props)
    }
})
afterAll(() => {
    Render.Component = resolve
})
beforeEach(() => {
    seen = []
})

const noop = () => {}
const identity = value => value
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 400)) })
const meta = { view: 'Col', items: [{ view: 'Input', name: 'name', label: 'Name' }] }

function mountHost (props) {
    clearEngineGlobals()
    const tree = next => (
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}>
                <UIRender translate={identity} onSubmit={noop} meta={meta} {...next} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    const view = render(tree(props))
    return { ...view, rerender: next => view.rerender(tree(next)) }
}

const type = value => {
    const input = screen.getByLabelText('Name')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value } })
}

describe('what the form layer tells its host', () => {
    it('tells onChangeState, with the document, each time whether it can be saved changes', async () => {
        const published = []
        const onChangeState = instance => { published.push({ instance, canSave: instance.canSave }) }
        const values = { name: 'Ada' }
        const view = mountHost({ data: values, initialValues: values, onChangeState })
        await settle()
        const [document] = seen.filter(instance => !instance.props.parent)
        const before = published.length

        type('Ada Lovelace')
        await settle()
        type('Ada')
        await settle()

        const changes = published.slice(before).map(entry => entry.canSave)
        expect(changes).toEqual([true, false])
        for (const entry of published) expect(entry.instance).toBe(document)

        view.unmount()
        expect(published[published.length - 1].instance).toEqual({})
    })

    it('tells onDataChanged about the user\'s edits, and nothing while there are none', async () => {
        const calls = []
        const onDataChanged = () => { calls.push('changed') }
        const values = { name: 'Ada' }
        const view = mountHost({ data: values, initialValues: values, onDataChanged })
        await settle()
        view.rerender({ data: values, initialValues: values, onDataChanged, onSubmit: () => {} })
        await settle()
        expect(calls).toEqual([])

        type('Ada Lovelace')

        await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    })

    it('lets the host set its own state from both callbacks without a warning from React', async () => {
        // Both are called once the commit is in, not during the render. Called from the render, a
        // host's state update would draw React's "Cannot update a component while rendering a
        // different component".
        const reported = []
        const errors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args.join(' ')) })
        try {
            let updates = 0
            function Host () {
                const [, setCount] = React.useState(0)
                const values = { name: 'Ada' }
                const bump = () => { updates += 1; setCount(count => count + 1) }
                return <UIRender translate={identity} onSubmit={noop} meta={meta} data={values} initialValues={values} onDataChanged={bump} onChangeState={bump} />
            }
            clearEngineGlobals()
            render(
                <ConfigContext.Provider value={initialConfigState}>
                    <AppContext.Provider value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}>
                        <Host />
                    </AppContext.Provider>
                </ConfigContext.Provider>
            )
            await settle()
            type('Ada Lovelace')
            await settle()

            expect(updates).toBeGreaterThan(0)
            expect(reported).toEqual([])
        } finally {
            errors.mockRestore()
        }
    })
})
