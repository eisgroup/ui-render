/**
 * WHAT THE FORM WRAPPER `withForm` BUILDS DOES FOR THE DOCUMENT INSIDE IT.
 * =============================================================================================
 *
 * The wrapper owns a document's react-final-form `<Form>`. It hands the document the form, keeps
 * the form in the shared `formsStorage` under the values it was initialised with, resets it when
 * the host passes initial values that differ by value, and tracks each form's touched fields,
 * clearing them and the form's errors when a new baseline arrives.
 *
 * These are pinned on the engine's real documents, the wrapper's one consumer, so they hold for
 * whatever the wrapper is written as. They replace tests that constructed the wrapper class and
 * called its lifecycle methods by name (§9.3 step 6, slice 5).
 *
 * `form` is NOT one object for the document's lifetime. react-final-form hands its render prop a
 * new `{...form, reset}` on every render, and the document's `form` is the latest one. They all
 * share the underlying form's methods, so these tests tell "the same form" by `getState`.
 */
if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import '../utils' // eslint-disable-line import/first
import Render from '../../../engine/Render' // eslint-disable-line import/first
import UIRender from '../../../engine/rules' // eslint-disable-line import/first
import { UIRender as DeclaredUIRender } from '../../../engine/rules' // eslint-disable-line import/first
import { errorsFor, formsStorage, touchedFor } from '../../../state/formRegistry' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts' // eslint-disable-line import/first
import { clearEngineGlobals } from '../../../../demo/testing/mountExample' // eslint-disable-line import/first

/** Every document instance a node was handed, and how many times each document rendered. */
let seen
let renders
let resolve
let draw
beforeAll(() => {
    resolve = Render.Component
    Render.Component = function RecordingResolver (props) {
        if (props.instance && !seen.includes(props.instance)) seen.push(props.instance)
        return React.createElement(resolve, props)
    }
    draw = DeclaredUIRender.prototype.render
    DeclaredUIRender.prototype.render = function () {
        renders.set(this, (renders.get(this) || 0) + 1)
        return draw.apply(this, arguments)
    }
})
afterAll(() => {
    Render.Component = resolve
    DeclaredUIRender.prototype.render = draw
})
beforeEach(() => {
    seen = []
    renders = new Map()
})

const noop = () => {}
const identity = value => value
const documents = () => seen.filter(instance => !instance.props.parent)
/** The storage entries of a document's form, whichever of its render's `form` objects they hold. */
const storedFor = document => [...formsStorage.entries()]
    .filter(([, entry]) => entry.form && entry.form.getState === document.form.getState)

const meta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'name', label: 'Name' },
        { view: 'Input', name: 'city', label: 'City' },
    ],
}

/** A host that can render again, with the providers the engine reads. */
function mountHost (props) {
    clearEngineGlobals()
    const tree = next => (
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={providedApp}>
                <UIRender translate={identity} onSubmit={noop} meta={meta} {...next} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    const view = render(tree(props))
    return { ...view, rerender: next => view.rerender(tree(next)) }
}
const providedApp = { ...initialAppState, setPopupState: noop, togglePopupState: noop }

const type = (label, value) => {
    const input = screen.getByLabelText(label)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value } })
    fireEvent.blur(input)
}

describe('the form wrapper', () => {
    it('hands the document its form and submit handler', () => {
        const submitted = []
        const values = { name: 'Ada', city: 'Paris' }
        mountHost({ data: values, initialValues: values, onSubmit: next => { submitted.push(next) } })
        const [document] = documents()

        expect(document.props.instance.form).toBe(document.form)
        expect(document.form.getState().values).toEqual(values)
        act(() => { document.props.instance.handleSubmit() })
        expect(submitted).toEqual([values])
    })

    it('keeps its form in formsStorage under the values it started with, and removes it on unmount', () => {
        const values = { name: 'Ada', city: 'Paris' }
        const view = mountHost({ data: values, initialValues: values })
        const [document] = documents()
        const entries = storedFor(document)

        expect(entries).toHaveLength(1)
        const [[key, entry]] = entries
        expect(key).toEqual(values)
        expect(key).not.toBe(values)
        expect(entry.meta).toBe(meta)

        view.unmount()

        expect(formsStorage.has(key)).toBe(false)
    })

    it('resets the form to initial values that differ by value, and moves its storage entry', () => {
        const first = { name: 'Ada', city: 'Paris' }
        const view = mountHost({ data: first, initialValues: first })
        const [document] = documents()
        type('City', 'Rome')
        expect(document.form.getState().pristine).toBe(false)

        const next = { name: 'Grace', city: 'Oslo' }
        const nextMeta = { ...meta }
        view.rerender({ data: next, initialValues: next, meta: nextMeta })

        expect(screen.getByLabelText('Name')).toHaveValue('Grace')
        expect(screen.getByLabelText('City')).toHaveValue('Oslo')
        expect(document.form.getState().pristine).toBe(true)
        const entries = storedFor(document)
        expect(entries.map(([key]) => key)).toEqual([next])
        expect(entries[0][1].meta).toBe(nextMeta)
    })

    it('keeps the user\'s edits when the initial values change only by identity', () => {
        const first = { name: 'Ada', city: 'Paris' }
        const view = mountHost({ data: first, initialValues: first })
        const [document] = documents()
        const [[key]] = storedFor(document)
        type('City', 'Rome')

        const same = { name: 'Ada', city: 'Paris' }
        view.rerender({ data: first, initialValues: same })

        expect(screen.getByLabelText('City')).toHaveValue('Rome')
        expect(document.form.getState().pristine).toBe(false)
        expect(formsStorage.has(key)).toBe(true)
    })

    it('does not report a data change when the host resets an edited form to new initial values', async () => {
        // A host that saves the user's edits and passes the saved values back as the new initial
        // values. Until §9.3 step 6, on React 18, the document compared the new values with the form
        // state from before the reset and reported one more change. On React 16 and 17 the reset was
        // applied within the same render, and it reported none.
        const changes = []
        const onDataChanged = () => { changes.push('changed') }
        const first = { name: 'Ada', city: 'Paris' }
        const view = mountHost({ data: first, initialValues: first, onDataChanged })
        const [document] = documents()
        type('City', 'Rome')
        await waitFor(() => expect(changes.length).toBeGreaterThan(0))
        expect(document.form.getState().pristine).toBe(false)
        changes.length = 0

        const saved = { name: 'Ada', city: 'Rome' }
        view.rerender({ data: saved, initialValues: saved, onDataChanged })
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })

        expect(document.form.getState().pristine).toBe(true)
        expect(screen.getByLabelText('City')).toHaveValue('Rome')
        expect(changes).toEqual([])
    })

    it('tracks the fields touched on its form, and untouches them when new initial values arrive', () => {
        const first = { name: 'Ada', city: 'Paris' }
        const view = mountHost({ data: first, initialValues: first })
        const [document] = documents()
        type('Name', 'Ada L.')
        type('City', 'Rome')

        expect(touchedFor(document.form)).toEqual({ name: true, city: true })
        errorsFor(document.form).name = 'stale'

        const next = { name: 'Grace', city: 'Oslo' }
        view.rerender({ data: next, initialValues: next })

        expect(document.form.getFieldState('name').touched).toBe(false)
        expect(document.form.getFieldState('city').touched).toBe(false)
        expect(touchedFor(document.form)).toEqual({})
        expect(errorsFor(document.form)).toEqual({})
    })

    it('does not let a second document starting up untouch the first one\'s fields', () => {
        clearEngineGlobals()
        const firstValues = { name: 'Ada', city: 'Paris' }
        const secondValues = { name: 'Grace', city: 'Oslo' }
        const host = (withSecond) => (
            <ConfigContext.Provider value={initialConfigState}>
                <AppContext.Provider value={providedApp}>
                    <UIRender translate={identity} onSubmit={noop} meta={meta} data={firstValues} initialValues={firstValues} />
                    {withSecond && <UIRender translate={identity} onSubmit={noop} meta={meta} data={secondValues} initialValues={secondValues} />}
                </AppContext.Provider>
            </ConfigContext.Provider>
        )
        const view = render(host(false))
        const [first] = documents()
        type('Name', 'Ada L.')
        errorsFor(first.form).name = 'kept'

        view.rerender(host(true))

        expect(documents()).toHaveLength(2)
        expect(touchedFor(first.form)).toEqual({ name: true })
        expect(errorsFor(first.form)).toEqual({ name: 'kept' })
        expect(first.form.getFieldState('name').touched).toBe(true)
    })

    it('does not render the document again for a parent\'s render with the same props', () => {
        const values = { name: 'Ada', city: 'Paris' }
        const props = { data: values, initialValues: values }
        const view = mountHost(props)
        const [document] = documents()
        const before = renders.get(document)

        view.rerender(props)

        expect(renders.get(document)).toBe(before)
    })

    it('under StrictMode, is not among the components React reports for componentWillReceiveProps', () => {
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            clearEngineGlobals()
            const values = { name: 'Ada', city: 'Paris' }
            render(
                <React.StrictMode>
                    <ConfigContext.Provider value={initialConfigState}>
                        <AppContext.Provider value={providedApp}>
                            <UIRender translate={identity} onSubmit={noop} meta={meta} data={values} initialValues={values} />
                        </AppContext.Provider>
                    </ConfigContext.Provider>
                </React.StrictMode>
            )
            const reported = errors.mock.calls.map(args => args.join(' '))
                .filter(message => message.includes('componentWillReceiveProps'))

            expect(screen.getByLabelText('Name')).toHaveValue('Ada')
            // `UIRenderLifecycleWithFormSetup` contains the name, so only a whole word counts.
            for (const message of reported) expect(message).not.toMatch(/\bWithForm\b/)
        } finally {
            errors.mockRestore()
        }
    })
})
