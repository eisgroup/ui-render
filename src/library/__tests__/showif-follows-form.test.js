/**
 * A `showIf` THAT READS A FIELD, IN A CONTAINER ITS DOCUMENT'S RENDER DOES NOT REACH (2026-10-23).
 * =============================================================================================
 *
 * A node's `showIf` reads the form's values when the node renders (`engine/showIf.ts`), and a node renders with its
 * document, which renders on each change of the form. A `List`, an `ExpandList` and a `TabList` render their items
 * only when their own props change, and a popup shows the content it was opened with: a node in one of them did not
 * render on a change of the form, and its `showIf` stayed as it was. Measured on the code before 2026-10-23, for a host
 * that renders once: typing in the field a `showIf` reads left the node as it was, in each of the places below.
 *
 * A host that rendered again on `onDataChanged` hid part of it: `AppProvider` made new context values on every render,
 * and every node of the document, these ones too, rendered again with them. Measured: such a list's item showed, and
 * stayed when the field went back to what it started as, a change `onDataChanged` is not told of. `AppProvider` made
 * its values once from 2026-10-23, and then the nodes stayed as they were for every host.
 */
import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'

const flagField = { view: 'Input', name: 'flag', label: 'Flag' }
const gated = { view: 'Text', children: 'Gated', showIf: { name: 'flag', relativeData: false } }
const rows = [{ title: 'First' }]

const HOSTS = [
    ['a host that renders once', false],
    ['a host that renders again on `onDataChanged`', true],
]

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

/** The document, mounted by a host that renders again on `onDataChanged` when `rerenders` says so. */
function mount (meta, data, rerenders) {
    function Host () {
        const [, setChanges] = React.useState(0)
        return (
            <UIRender
                meta={meta} data={data} initialValues={data}
                onDataChanged={() => { if (rerenders) setChanges(count => count + 1) }}
            />
        )
    }
    const view = render(<Host/>)
    act(() => { jest.runOnlyPendingTimers() })
    return view
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

const gatedShown = () => screen.queryByText('Gated') !== null

describe.each(HOSTS)('for %s', (_, rerenders) => {
    describe.each([
        ['a List', { view: 'List', name: 'rows', renderItem: gated }],
        ['a RowList', { view: 'RowList', name: 'rows', renderItem: gated }],
        ['a TabList', { view: 'TabList', name: 'rows', renderLabel: { view: 'Text', name: 'title' }, renderItem: gated }],
    ])('a node in %s', (__, container) => {
        it('shows and hides as the field its `showIf` reads changes', () => {
            mount({ view: 'Col', items: [flagField, container] }, { flag: '', rows }, rerenders)
            expect(gatedShown()).toBe(false)

            type('flag', 'yes')
            expect(gatedShown()).toBe(true)

            type('flag', '')
            expect(gatedShown()).toBe(false)
        })
    })

    it('a node in an ExpandList\'s open item shows and hides as the field its `showIf` reads changes', () => {
        const container = { view: 'ExpandList', name: 'rows', renderLabel: { view: 'Text', name: 'title' }, renderItem: gated }
        mount({ view: 'Col', items: [flagField, container] }, { flag: '', rows }, rerenders)
        act(() => { fireEvent.click(screen.getByRole('button', { name: 'First' })) })
        act(() => { jest.runOnlyPendingTimers() })
        expect(gatedShown()).toBe(false)

        type('flag', 'yes')
        expect(gatedShown()).toBe(true)

        type('flag', '')
        expect(gatedShown()).toBe(false)
    })

    it('a node in a popup shows and hides as a field of the popup changes', () => {
        mount({
            view: 'Col',
            items: [
                {
                    view: 'Popup',
                    id: 'details',
                    title: 'Details',
                    items: [
                        { view: 'Input', name: 'inner', label: 'Inner' },
                        { view: 'Text', children: 'Gated', showIf: { name: 'inner', relativeData: false } },
                    ],
                },
                { view: 'Button', children: 'Open', onClick: 'popupOpen,details' },
            ],
        }, {}, rerenders)
        act(() => { fireEvent.click(screen.getByRole('button', { name: 'Open' })) })
        expect(within(screen.getByRole('dialog')).queryByText('Gated')).toBeNull()

        type('inner', 'yes')
        expect(within(screen.getByRole('dialog')).getByText('Gated')).toBeInTheDocument()

        type('inner', '')
        expect(within(screen.getByRole('dialog')).queryByText('Gated')).toBeNull()
    })

    it('a node in a row\'s popup shows and hides as a field of the popup changes', () => {
        // A popup whose id names the row is a template, made into the row's own when it opens (`PopupContent.tsx`).
        mount({
            view: 'Table',
            name: 'notes',
            headers: [{ id: 'text', label: 'Note' }, { id: 'actions', label: 'Actions' }],
            renderItemCells: {
                view: 'TableCells',
                items: [
                    { view: 'Text', name: 'text' },
                    {
                        view: 'Col',
                        items: [
                            { view: 'Button', children: 'Open', onClick: { name: 'popupOpen', args: ['note.{index}'] } },
                            {
                                view: 'Popup',
                                id: 'note.{index}',
                                title: 'Note',
                                items: [
                                    { view: 'Input', name: 'inner', label: 'Inner' },
                                    // A popup's items read a `showIf` from the form's root, where the row's field is.
                                    { view: 'Text', children: 'Gated', showIf: { name: 'notes[0].inner', relativeData: false } },
                                ],
                            },
                        ],
                    },
                ],
            },
        }, { notes: [{ text: 'First' }] }, rerenders)
        act(() => { fireEvent.click(screen.getByRole('button', { name: 'Open' })) })
        const dialog = () => screen.getByRole('dialog')
        expect(within(dialog()).queryByText('Gated')).toBeNull()

        type('notes[0].inner', 'yes')
        expect(within(dialog()).getByText('Gated')).toBeInTheDocument()

        type('notes[0].inner', '')
        expect(within(dialog()).queryByText('Gated')).toBeNull()
    })
})
