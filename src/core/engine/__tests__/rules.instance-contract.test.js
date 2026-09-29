/**
 * WHAT AN ENGINE INSTANCE OFFERS THE CODE THAT READS IT.
 * =============================================================================================
 *
 * The engine hands every node it renders `instance`, the document's own engine instance, and the
 * mapper, the fields, the validators, `showIf`, the popups and the nested documents read it. §9.3
 * step 6's design pass measured what they read: a Proxy on every instance for the whole suite, and
 * a scan of `src` for the paths the suite did not reach. The engine's conversion to a function
 * component has to keep exactly that, so this pins it on real documents, through the channel the
 * engine itself uses. It says nothing about classes, and holds for whatever replaces them.
 *
 * The instances are collected from `Render.Component`, the engine's resolver hook, which every
 * node passes through with its `instance`.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import '../../modules/form/utils' // eslint-disable-line import/first
import Render from '../Render' // eslint-disable-line import/first
import { autoSubmitter } from '../autoSubmit' // eslint-disable-line import/first
import { EXAMPLES } from '../../../demo/examples/manifest' // eslint-disable-line import/first
import { clearEngineGlobals, mountExample, mountMeta } from '../../../demo/testing/mountExample' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts' // eslint-disable-line import/first
import UIRender from '../rules' // eslint-disable-line import/first

/** Every distinct instance a node was handed, in the order they were first seen. */
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

const rootOf = () => seen.find(instance => !instance.props.parent)
const noop = () => {}
const identity = value => value

/** A document that can be rendered again with other props, inside the providers the engine reads. */
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
const childrenOf = parent => seen.filter(instance => instance.props.parent === parent)

const inputMeta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'amount', label: 'Amount' },
        { view: 'Button', label: 'Choose', onClick: 'setState,choice' },
    ],
}

describe('the instance every node of a document is handed', () => {
    it('is one object per document, the same on every render', () => {
        const view = mountDocument({ meta: inputMeta, data: { amount: 5 }, initialValues: { amount: 5 } })
        const first = rootOf()
        view.rerender({ meta: inputMeta, data: { amount: 6 }, initialValues: { amount: 6 } })

        expect(seen.filter(instance => !instance.props.parent)).toEqual([first])
        expect(first.props.data).toEqual({ amount: 6 })
    })

    it('carries the translator, the state, the props and the form', () => {
        const onError = () => {}
        mountMeta(inputMeta, { amount: 5 }, { translate: value => `t:${value}`, onError })
        const instance = rootOf()

        expect(instance.translate('Amount')).toBe('t:Amount')
        expect(instance.state.currencyCode).toBe('USD')
        expect(instance.props.initialValues).toEqual({ amount: 5 })
        expect(instance.props.onError).toBe(onError)
        for (const method of ['change', 'submit', 'reset', 'getState']) {
            expect(typeof instance.form[method]).toBe('function')
        }
        expect(instance.formValues).toEqual({ amount: 5 })
        expect(instance.getRawFormsData()).toEqual(expect.objectContaining({ amount: 5 }))
    })

    it('keeps its state a free-form bag: a setState action writes a path into it', () => {
        mountMeta(inputMeta, { amount: 5 })

        fireEvent.click(screen.getByText('Choose'))

        expect(rootOf().state).toEqual(expect.objectContaining({ choice: expect.anything() }))
    })

    it('merges setState, and runs its callback after the commit', () => {
        mountMeta(inputMeta, { amount: 5 })
        const instance = rootOf()
        const before = instance.state
        let seenInCallback

        act(() => {
            instance.setState(state => ({ marker: 'set', count: (state.count || 0) + 1 }), () => {
                seenInCallback = instance.state
            })
        })

        expect(instance.state).toEqual(expect.objectContaining({ marker: 'set', count: 1, currencyCode: 'USD' }))
        expect(seenInCallback).toBe(instance.state)
        // The state object handed out before is left as it was.
        expect(before).not.toHaveProperty('marker')
    })

    it('applies two setState updaters batched together, both of them', () => {
        // `dataKindPush` and the meta actions update through updaters for exactly this: an object
        // built from the state before the batch would undo the other write.
        mountMeta(inputMeta, { amount: 5 })
        const instance = rootOf()

        act(() => {
            instance.setState(state => ({ group: { ...state.group, first: 'gold' } }))
            instance.setState(state => ({ group: { ...state.group, second: 'silver' } }))
        })

        expect(instance.state.group).toEqual({ first: 'gold', second: 'silver' })
    })

    it('takes changed data and meta props into its state, leaving the state object it handed out', () => {
        const view = mountDocument({ meta: inputMeta, data: { amount: 5 }, initialValues: { amount: 5 } })
        const instance = rootOf()
        const before = instance.state
        const nextMeta = { view: 'Col', items: [{ view: 'Text', children: 'next' }] }

        view.rerender({ meta: nextMeta, data: { amount: 6 }, initialValues: { amount: 6 } })

        expect(instance.state.data.json).toEqual({ amount: 6 })
        expect(instance.state.meta.json).toBe(nextMeta)
        expect(before.data.json).toEqual({ amount: 5 })
        expect(before.meta.json).toBe(inputMeta)
    })

    it('registers the popups it renders, by static id and by template', () => {
        mountMeta({
            view: 'Col',
            items: [
                { view: 'Popup', id: 'details', title: 'Details', items: [{ view: 'Text', children: 'inside' }] },
                { view: 'Popup', id: 'row-{index}', title: 'Row', items: [{ view: 'Text', children: 'row' }] },
            ],
        })
        const instance = rootOf()

        expect(instance.popupById).toEqual(expect.objectContaining({ details: expect.any(Object) }))
        expect(instance.popupTemplates).toEqual(expect.objectContaining({ 'row-{index}': expect.any(Object) }))
    })

    it('carries a submit that works unbound, and room for auto-submit to park its timers', () => {
        const submitted = []
        mountMeta(inputMeta, { amount: 5 }, { onSubmit: values => { submitted.push(values) } })
        const instance = rootOf()
        const { submit } = instance

        act(() => { submit() })
        expect(submitted).toEqual([expect.objectContaining({ amount: 5 })])

        const later = autoSubmitter(instance, 10)
        expect(typeof later).toBe('function')
        expect(autoSubmitter(instance, 10)).toBe(later)
    })

    it('is marked as unmounting once its document unmounts', () => {
        const view = mountMeta(inputMeta, { amount: 5 })
        const instance = rootOf()
        expect(instance.isUnmounting).toBeFalsy()

        view.unmount()

        expect(instance.isUnmounting).toBe(true)
    })
})

describe('a nested document', () => {
    const example = EXAMPLES.find(({ id }) => id === 'nestedDataKind')

    it('has an instance of its own, which names the document as its parent', () => {
        mountExample(example)
        const root = rootOf()
        const children = childrenOf(root)

        expect(children.length).toBeGreaterThan(0)
        for (const child of children) expect(child).not.toBe(root)
    })

    it('shares its parent\'s form, unless it has a form wrapper of its own', () => {
        // A table row's document shares the form; the draft row `renderExtraItem` renders gets a form
        // of its own (`useForm`), and so a `props.instance` of its own too.
        mountExample(example)
        const root = rootOf()
        const children = childrenOf(root)
        const rows = children.filter(child => !child.props.instance)
        const drafts = children.filter(child => child.props.instance)

        for (const row of rows) expect(row.form).toBe(root.form)
        expect(drafts.length).toBeGreaterThan(0)
        for (const draft of drafts) expect(draft.form).not.toBe(root.form)
    })

    it('names the document as its parent at the second level too, told apart by its scope', () => {
        // The line items of every phase are rendered by the ROOT's table, inside the phase's expanded
        // row, so their parent is the root and not the phase. Which phase they belong to is their
        // registry scope, `dataKindPath`, and the root answers for each scope separately.
        mountExample(example)
        const root = rootOf()
        const rows = childrenOf(root).filter(child => !child.props.instance)
        const phases = example.data.dataKind.phases
        const byKind = kind => rows.filter(row => row.props.form.kind === kind)

        expect(byKind('phases').length).toBe(phases.length)
        expect(byKind('lineItems').length).toBe(phases.reduce((n, phase) => n + phase.dataKind.lineItems.length, 0))

        const scopes = [...new Set(byKind('lineItems').map(row => row.dataKindPath))]
        expect(scopes.length).toBe(phases.length)
        for (const scope of scopes) {
            const phase = phases[Number(scope.match(/(\d+)/)[1])]
            expect(root.getDataKind('lineItems', scope).map(item => item.sku))
                .toEqual(phase.dataKind.lineItems.map(item => item.sku))
        }
    })

    it('is registered with its parent, which answers for the rows from its registry', () => {
        mountExample(example)
        const root = rootOf()

        for (const phase of childrenOf(root)) {
            expect(typeof phase.dataKindPath).toBe('string')
        }
        expect(root.getDataKind('phases').map(phase => phase.title)).toEqual(
            example.data.dataKind.phases.map(phase => phase.title)
        )
        for (const method of ['registerDataKind', 'unregisterDataKind']) {
            expect(typeof root[method]).toBe('function')
        }
        expect(root.getDataKind('noSuchKind')).toEqual([])
    })

    it('reads its parent\'s translator, state, setState and submit handler', () => {
        mountExample(example)
        const root = rootOf()
        const [phase] = childrenOf(root).filter(child => !child.props.instance)

        expect(phase.translate).toBe(root.translate)
        expect(root.state.data.json.dataKind.phases.length).toBe(example.data.dataKind.phases.length)
        expect(typeof root.setState).toBe('function')
        expect(typeof root.handleSubmit).toBe('function')
        expect(phase.handleSubmit).toBe(root.handleSubmit)
    })

    it('reaches the host\'s change callback through its parent, read when a field changes', async () => {
        // A nested document mounts before its parent has copied `onDataChanged` from its props, so
        // its own copy stays unset. What reaches the host is the form layer reading the PARENT's
        // `onDataChanged` when a field changes, so that is what the parent must carry.
        const calls = []
        const onDataChanged = () => { calls.push('changed') }
        mountExample(example, { onDataChanged })
        const root = rootOf()
        expect(root.onDataChanged).toBe(onDataChanged)

        const title = screen.getByDisplayValue(example.data.dataKind.phases[0].title)
        fireEvent.focus(title)
        fireEvent.change(title, { target: { value: 'Discovery' } })

        await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    })

    it('reaches its parent\'s form through the parent\'s props.instance', () => {
        mountExample(example)
        const root = rootOf()

        expect(root.props.instance.form).toBe(root.form)
    })

    it('leaves its parent\'s registry when it unmounts', () => {
        const view = mountExample(example)
        const phases = childrenOf(rootOf())

        view.unmount()

        for (const phase of phases) expect(phase.dataKindPath).toBeUndefined()
    })
})
