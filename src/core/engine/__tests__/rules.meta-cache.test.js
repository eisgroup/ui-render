/**
 * WHEN THE ENGINE REBUILDS A DOCUMENT'S META.
 * =============================================================================================
 *
 * The engine turns a document's meta into props once for each state it renders. `{state.x}`
 * templates in a node's `name` resolve then, and the handlers it composes from strings such as
 * `'setState,choice'` are built then. So it must rebuild on every new state, and only then: a
 * render that brings no new state, such as a keystroke or a parent's render, hands every node the
 * same handlers, which is what lets a memoised component skip its render.
 *
 * Rebuilding on props-driven and upload-driven state is pinned where those flows are
 * (`UIRender.smoke`, `rules.actions`). This file pins a state change the document makes itself, and
 * the renders that must NOT rebuild, which nothing else covers.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../modules/form/utils'
import Render from '../Render'
import { clearEngineGlobals } from '../../../demo/testing/mountExample'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'
import UIRender from '../rules'

/** Every node's render: the props it was handed, and its document's state as it rendered. */
let rendered
let resolve
beforeAll(() => {
    resolve = Render.Component
    Render.Component = function RecordingResolver (props) {
        rendered.push({ props, state: props.instance && props.instance.state })
        return React.createElement(resolve, props)
    }
})
afterAll(() => {
    Render.Component = resolve
})
beforeEach(() => {
    rendered = []
})

const noop = () => {}
const identity = value => value
const instanceOf = () => rendered.find(({ props }) => props.instance && !props.instance.props.parent).props.instance

function mountDocument (props) {
    clearEngineGlobals()
    const tree = next => (
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}>
                <UIRender translate={identity} onSubmit={noop} {...next} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    const view = render(tree(props))
    return { ...view, rerender: next => view.rerender(tree(next)) }
}

describe('a document\'s meta', () => {
    it('is rebuilt on a new state: a `{state.x}` name resolves again', () => {
        const meta = {
            view: 'Col',
            items: [{ view: 'Input', name: 'amounts.{state.pick,first}', label: 'Amount' }],
        }
        const data = { amounts: { first: 'one', second: 'two' } }
        mountDocument({ meta, data, initialValues: data })
        expect(screen.getByDisplayValue('one')).toBeInTheDocument()

        // Straight through the instance's `setState`, as a nested document writes its parent's
        // state, not through the meta's `setState` action, which clears the cache itself.
        act(() => { instanceOf().setState({ pick: 'second' }) })

        expect(screen.getByDisplayValue('two')).toBeInTheDocument()
        expect(screen.queryByDisplayValue('one')).not.toBeInTheDocument()
    })

    it('is kept across renders that bring no new state, so every node keeps its handlers', () => {
        const meta = {
            view: 'Col',
            items: [
                { view: 'Input', name: 'amount', label: 'Amount' },
                { view: 'Button', label: 'Choose', onClick: 'setState,choice' },
            ],
        }
        const data = { amount: '5' }
        const renders = () => rendered.filter(({ props }) => props.label === 'Choose')
        const latest = () => renders()[renders().length - 1]
        const type = value => {
            const amount = screen.getByLabelText('Amount')
            fireEvent.focus(amount)
            fireEvent.change(amount, { target: { value } })
        }
        const view = mountDocument({ meta, data, initialValues: data })
        const mounted = latest()

        // A parent's render with the same meta and data brings no new state...
        view.rerender({ meta, data, initialValues: data, onSubmit: () => {} })

        expect(latest()).not.toBe(mounted)
        expect(latest().state).toBe(mounted.state)
        expect(latest().props.onClick).toBe(mounted.props.onClick)

        // ...and neither does a keystroke after the first one, which made the form dirty.
        type('6')
        const typed = latest()
        type('7')

        expect(latest()).not.toBe(typed)
        expect(latest().state).toBe(typed.state)
        expect(latest().props.onClick).toBe(typed.props.onClick)

        // A new state is a new meta, with new handlers.
        act(() => { instanceOf().setState({ unrelated: true }) })

        expect(latest().state).not.toBe(typed.state)
        expect(latest().props.onClick).not.toBe(typed.props.onClick)
        expect(typeof latest().props.onClick).toBe('function')
    })

    it('needs no lifecycle for it: under StrictMode React reports no componentWillUpdate', () => {
        // An `UNSAFE_componentWillUpdate` dropped the cache until §9.3 step 6, and React's StrictMode
        // warning named it. The engine's other lifecycles still warn until they go too.
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            clearEngineGlobals()
            render(
                <React.StrictMode>
                    <ConfigContext.Provider value={initialConfigState}>
                        <AppContext.Provider value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}>
                            <UIRender translate={identity} onSubmit={noop} data={{}} meta={{ view: 'Text', children: 'strict' }} />
                        </AppContext.Provider>
                    </ConfigContext.Provider>
                </React.StrictMode>
            )
            const reported = errors.mock.calls.map(args => args.join(' ')).join('\n')
            expect(screen.getByText('strict')).toBeInTheDocument()
            expect(reported).not.toMatch(/componentWillUpdate/)
        } finally {
            errors.mockRestore()
        }
    })
})
