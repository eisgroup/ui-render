/**
 * A `showIf` THAT READS A FIELD OF ANOTHER FORM OF ITS DOCUMENT TREE (2026-10-26).
 * =============================================================================================
 *
 * A `Data` block with `useForm` is a document with a form of its own, and a document renders on changes of its own
 * form only. So a node beside such a block whose `showIf` reads the block's field, or a node in another block, did
 * not render on a change of it. Measured on the published 0.34.3, on React 16.14 and 18.3: the node followed the
 * field for a host that renders again on `onDataChanged`, through the context `AppProvider` made anew on each render,
 * and never for a host that renders once. Its context values are made once from 2026-10-23, and then the node
 * followed it for no host. It follows the other forms of its tree itself now (`engine/showIfFollowsForm.ts`).
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'

const HOSTS = [
    ['a host that renders once', 'once'],
    ['a host that renders again on `onDataChanged`', 'again'],
    ['a host that renders again on `onDataChanged` with the same props', 'same'],
]

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

/** The document, mounted by a host that renders as `renders` says. */
function mount (meta, data, renders) {
    function Host () {
        const [, setChanges] = React.useState(0)
        const same = React.useCallback(() => setChanges(count => count + 1), [])
        const onDataChanged = renders === 'same' ? same : () => { if (renders === 'again') setChanges(count => count + 1) }
        return <UIRender meta={meta} data={data} initialValues={data} onDataChanged={onDataChanged}/>
    }
    render(<Host/>)
    act(() => { jest.runOnlyPendingTimers() })
}

/** Types `value` into the field named `name`, and leaves it. */
function type (name, value) {
    const input = document.querySelector(`input[name="${name}"]`)
    act(() => { fireEvent.focus(input) })
    act(() => { fireEvent.change(input, { target: { value } }) })
    act(() => { jest.runOnlyPendingTimers() })
    act(() => { fireEvent.blur(input) })
    act(() => { jest.runOnlyPendingTimers() })
}

const gated = { view: 'Text', children: 'Gated', showIf: { name: 'inner', relativeData: false } }
const block = { view: 'Data', useForm: true, meta: { view: 'Col', items: [{ view: 'Input', name: 'inner', label: 'Inner' }] } }
const gatedShown = () => screen.queryByText('Gated') !== null

describe.each(HOSTS)('for %s', (_, renders) => {
    it('a node beside a `useForm` block shows and hides as the block\'s field its `showIf` reads changes', () => {
        mount({ view: 'Col', items: [block, gated] }, {}, renders)
        expect(gatedShown()).toBe(false)

        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        type('inner', '')
        expect(gatedShown()).toBe(false)
    })

    it('a node in a `useForm` block shows and hides as a field of another block changes', () => {
        const reader = { view: 'Data', useForm: true, meta: { view: 'Col', items: [gated] } }
        mount({ view: 'Col', items: [block, reader] }, {}, renders)
        expect(gatedShown()).toBe(false)

        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        type('inner', '')
        expect(gatedShown()).toBe(false)
    })

    it('a node decides again without the field of a `useForm` block that goes', () => {
        const shut = { ...block, showIf: { name: 'open', relativeData: false } }
        mount({ view: 'Col', items: [{ view: 'Input', name: 'open', label: 'Open' }, shut, gated] }, { open: 'yes' }, renders)
        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        // The block goes, and its form with it: nothing holds the field any more.
        type('open', '')
        expect(screen.queryByLabelText('Inner')).toBeNull()
        expect(gatedShown()).toBe(false)
    })

    it('a list\'s items that mount after the block\'s field is typed in hide as the block goes', () => {
        // The items never heard the block change: they rendered with its value, and what it held is in the tell.
        mount({
            view: 'Col',
            items: [
                { view: 'Input', name: 'open', label: 'Open' },
                { view: 'Input', name: 'reveal', label: 'Reveal' },
                { ...block, showIf: { name: 'open', relativeData: false } },
                { view: 'Col', showIf: { name: 'reveal', relativeData: false }, items: [{ view: 'List', name: 'rows', renderItem: gated }] },
            ],
        }, { open: 'yes', rows: [{ id: 0 }, { id: 1 }] }, renders)
        type('inner', 'yes')
        type('reveal', 'yes')
        expect(screen.queryAllByText('Gated')).toHaveLength(2)

        type('open', '')
        expect(screen.queryAllByText('Gated')).toHaveLength(0)
    })

    it('a node and a list\'s items hide as a block that started with the value is cleared', () => {
        // The block's form registers with its value before any of them listens.
        const named = { ...block, name: 'sub' }
        mount({ view: 'Col', items: [named, gated, { view: 'List', name: 'rows', renderItem: gated }] },
            { sub: { inner: 'yes' }, rows: [{ id: 0 }] }, renders)
        expect(screen.queryAllByText('Gated')).toHaveLength(2)

        type('inner', '')
        expect(screen.queryAllByText('Gated')).toHaveLength(0)
    })

    // A list's items in the next two: a node outside one is set right by its document's next render, and the items are
    // not, so a decision they miss stays.
    it('a list\'s items that mount as the block they read goes decide without the block', () => {
        // They render while the block's form is still there, and the block goes in the same commit, before they listen.
        mount({
            view: 'Col',
            items: [
                { view: 'Input', name: 'mode', label: 'Mode' },
                { ...block, showIf: { name: 'mode', equal: 'a', relativeData: false } },
                { view: 'Col', showIf: { name: 'mode', equal: 'b', relativeData: false }, items: [{ view: 'List', name: 'rows', renderItem: gated }] },
            ],
        }, { mode: 'a', rows: [{ id: 0 }] }, renders)
        type('inner', 'yes')
        type('mode', 'b')
        expect(screen.queryByLabelText('Inner')).toBeNull()
        expect(screen.queryAllByText('Gated')).toHaveLength(0)
    })

    it('a list\'s items that mount with a block holding the value show', () => {
        // The block's form registers after they rendered, and before they listen.
        mount({
            view: 'Col',
            items: [
                { view: 'Input', name: 'reveal', label: 'Reveal' },
                {
                    view: 'Col',
                    showIf: { name: 'reveal', relativeData: false },
                    items: [{ ...block, name: 'sub' }, { view: 'List', name: 'rows', renderItem: gated }],
                },
            ],
        }, { sub: { inner: 'yes' }, rows: [{ id: 0 }] }, renders)
        expect(gatedShown()).toBe(false)

        type('reveal', 'yes')
        expect(screen.getByLabelText('Inner')).toHaveValue('yes')
        expect(screen.queryAllByText('Gated')).toHaveLength(1)
    })
})

it('a node whose `useForm` block under it decides it the other way settles', () => {
    // The block's values merge over the document's, `status` included: as the node shows, the block's form comes and
    // hides it, and as it hides, the form goes and shows it. It stops, rather than render until React gives up.
    const meta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'status', label: 'Status' },
            {
                view: 'Col',
                showIf: { name: 'status', equal: 'open', relativeData: false },
                items: [{ view: 'Data', useForm: true, name: 'details', meta: { view: 'Col', items: [{ view: 'Input', name: 'note', label: 'Note' }] } }],
            },
        ],
    }
    const data = { status: 'draft', details: { status: 'archived', note: 'x' } }
    mount(meta, data, 'once')

    type('status', 'open')
    expect(screen.getByLabelText('Status')).toHaveValue('open')
})

it('a node whose `useForm` block under it decides it the other way settles where the block changes a value as it comes', () => {
    // A select whose value is none of its options picks the first as it mounts: a change of the tree's values in each
    // turn of the flips.
    const meta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'status', label: 'Status' },
            {
                view: 'Col',
                showIf: { name: 'status', equal: 'open', relativeData: false },
                items: [{
                    view: 'Data', useForm: true, name: 'details',
                    meta: { view: 'Col', items: [{ view: 'Select', name: 'kind', label: 'Kind', options: ['a', 'b'] }] },
                }],
            },
        ],
    }
    mount(meta, { status: 'draft', details: { status: 'archived', kind: 'none' } }, 'once')

    type('status', 'open')
    expect(screen.getByLabelText('Status')).toHaveValue('open')
})

it('a node follows a block in a tab through every switch of the tabs', () => {
    // The block comes and goes with its tab, and no value of the document changes: each switch is a task of its own.
    const meta = {
        view: 'Col',
        items: [
            gated,
            {
                view: 'Tabs',
                items: [
                    { tab: 'A', content: { ...block, name: 'sub' } },
                    { tab: 'B', content: { view: 'Text', children: 'Nothing here' } },
                ],
            },
        ],
    }
    mount(meta, { sub: { inner: 'yes' } }, 'once')
    expect(gatedShown()).toBe(true)
    const pick = name => {
        act(() => { fireEvent.click(screen.getByRole('tab', { name })) })
        act(() => { jest.runOnlyPendingTimers() })
    }
    for (let round = 0; round < 8; round += 1) {
        pick('B')
        expect(gatedShown()).toBe(false)
        pick('A')
        expect(gatedShown()).toBe(true)
    }
})

it('a node beside a block shows as the block adopts the value a host hands it', () => {
    // The block's form is reset to its new initial values while the document renders on, and the node decides with it.
    const meta = { view: 'Col', items: [{ ...block, name: 'sub' }, gated] }
    const initialValues = { sub: { inner: '' } }
    const { rerender } = render(<UIRender meta={meta} data={initialValues} initialValues={initialValues}/>)
    act(() => { jest.runOnlyPendingTimers() })
    expect(gatedShown()).toBe(false)

    rerender(<UIRender meta={meta} data={{ sub: { inner: 'yes' } }} initialValues={initialValues}/>)
    act(() => { jest.runOnlyPendingTimers() })
    expect(screen.getByLabelText('Inner')).toHaveValue('yes')
    expect(gatedShown()).toBe(true)
})
