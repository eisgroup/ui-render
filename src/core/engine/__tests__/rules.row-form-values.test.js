/**
 * A TABLE ROW WITH A FORM OF ITS OWN IS READ WHERE ITS FIELDS PUT IT (2026-10-23).
 * =============================================================================================
 *
 * Two kinds of table row have a form of their own: the add row a `renderExtraItem` declaration renders,
 * and a row a `useForm` declaration gives one. Their fields are named by the row's place, such as
 * `dataKind.items[1].kind`, so the form holds the row there already. Where the engine merged the forms,
 * for `getFormData` and for what a `showIf` reads, it placed the form's values at that place a second
 * time, at `dataKind.items[1].dataKind.items[1]`. Measured on the code before this change:
 * - a field the add row gated with a `showIf` on another of its fields never showed;
 * - an edit in a `useForm` row put a copy of the table inside that row in `getFormData`, and a `showIf`
 *   in the row went on reading the row as it was;
 * - while a table in the rows of another had an add row with a form, in a document with more than one
 *   top-level key, what a `showIf` reads held none of the outer table's rows, so a field gated on one of
 *   them never showed.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { cloneDeep } from '../../utils'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const popup = { ...initialAppState, setPopupState: () => {} }

afterEach(() => {
    cleanup()
    formsStorage.clear()
})

/** A row's cells: its `detail` shows while its `kind` is `other`. */
const cells = addRow => [
    { view: 'Input', name: 'kind', type: 'text', ...addRow && { label: 'New kind' } },
    { view: 'Input', name: 'detail', type: 'text', showIf: { name: 'kind', equal: 'other' }, ...addRow && { label: 'New detail' } },
    { view: 'Button', children: addRow ? 'Add' : 'Remove', onClick: addRow ? 'addData' : 'removeData' },
]

const headers = [{ id: 'kind', label: 'Kind' }, { id: 'detail', label: 'Detail' }, { id: 'null', label: '' }]

/** Mounts the meta on the data; the host records what `getFormData` reads. */
function mount (meta, data) {
    const host = { reader: null }
    const view = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)}
                    getFormData={function (reader) { host.reader = reader }}/>
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...view, host }
}

const field = name => document.querySelector(`[name="${name}"]`)

const type = (name, value) => {
    const input = field(name)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value } })
    fireEvent.blur(input)
}

const click = name => act(async () => {
    fireEvent.click(screen.getByRole('button', { name }))
    await new Promise(resolve => setTimeout(resolve, 0))
})

describe('a `showIf` in a table\'s add row', () => {
    const meta = {
        view: 'Table',
        name: 'dataKind.items',
        headers,
        renderItemCells: { view: 'Data', kind: 'items', embedded: true, meta: { view: 'TableCells', items: cells(false) } },
        renderExtraItem: { view: 'Data', kind: 'items', embedded: true, initialValues: {}, meta: { view: 'TableCells', items: cells(true) } },
    }
    const first = { kind: 'other', detail: 'first' }

    it('shows the field it gates once the row\'s field it reads is typed in, and hides it again', () => {
        mount(meta, { dataKind: { items: [first] } })
        expect(field('dataKind.items[0].detail')).toBeInTheDocument()
        expect(field('dataKind.items[1].detail')).not.toBeInTheDocument()

        type('dataKind.items[1].kind', 'other')
        expect(field('dataKind.items[1].detail')).toBeInTheDocument()

        type('dataKind.items[1].kind', 'plain')
        expect(field('dataKind.items[1].detail')).not.toBeInTheDocument()
    })

    it('reads the next add row\'s fields once Add has put the typed row in the table', async () => {
        const { host } = mount(meta, { dataKind: { items: [first] } })
        type('dataKind.items[1].kind', 'other')
        type('dataKind.items[1].detail', 'second')

        await click('Add')

        expect(host.reader()).toEqual({ dataKind: { items: [first, { kind: 'other', detail: 'second' }] } })
        expect(field('dataKind.items[1].detail')).toHaveValue('second')
        expect(field('dataKind.items[2].detail')).not.toBeInTheDocument()

        type('dataKind.items[2].kind', 'other')
        expect(field('dataKind.items[2].detail')).toBeInTheDocument()
    })
})

describe('a table row with a `useForm` form of its own', () => {
    // Its fields start empty, as they did before this change, and that is not pinned here: its form starts
    // from the row's values at the root of its own, where none of its fields reads.
    const meta = {
        view: 'Table',
        name: 'dataKind.items',
        headers,
        renderItemCells: { view: 'Data', kind: 'items', embedded: true, useForm: true, meta: { view: 'TableCells', items: cells(false) } },
    }
    const data = { dataKind: { items: [{ kind: 'plain' }, { kind: 'other', detail: 'second' }] } }

    it('has its edit in getFormData at the row, with no copy of the table inside it', () => {
        const { host } = mount(meta, data)
        expect(host.reader()).toEqual(data)

        type('dataKind.items[0].kind', 'other')

        expect(host.reader()).toEqual({ dataKind: { items: [{ kind: 'other' }, { kind: 'other', detail: 'second' }] } })
    })

    it('shows a field it gates once its edit makes the `showIf` true', () => {
        mount(meta, data)
        expect(field('dataKind.items[0].detail')).not.toBeInTheDocument()
        expect(field('dataKind.items[1].detail')).toBeInTheDocument()

        type('dataKind.items[0].kind', 'other')

        expect(field('dataKind.items[0].detail')).toBeInTheDocument()
    })
})

describe('a table in the rows of another, whose add row has a form', () => {
    // Each phase row shows its `budget` while it has a title, and each new line its `note` once it has a `sku`.
    const meta = {
        view: 'Table',
        name: 'dataKind.phases',
        headers: [{ id: 'title', label: 'Phase' }, { id: 'budget', label: 'Budget' }],
        itemsExpanded: true,
        renderItemCells: {
            view: 'Data', kind: 'phases', embedded: true,
            meta: {
                view: 'TableCells',
                items: [
                    { view: 'Input', name: 'title', type: 'text' },
                    { view: 'Input', name: 'budget', type: 'number', showIf: { name: 'title' } },
                ],
            },
        },
        renderItem: {
            view: 'Col',
            items: [{
                view: 'Table',
                name: 'dataKind.lineItems',
                headers: [{ id: 'sku', label: 'SKU' }, { id: 'note', label: 'Note' }, { id: 'null', label: '' }],
                renderItemCells: {
                    view: 'Data', kind: 'lineItems', embedded: true,
                    meta: { view: 'TableCells', items: [{ view: 'Input', name: 'sku', type: 'text' }] },
                },
                renderExtraItem: {
                    view: 'Data', kind: 'lineItems', embedded: true, initialValues: {},
                    meta: {
                        view: 'TableCells',
                        items: [
                            { view: 'Input', name: 'sku', type: 'text', label: 'New SKU' },
                            { view: 'Input', name: 'note', type: 'text', label: 'New note', showIf: { name: 'sku' } },
                            { view: 'Button', children: 'Add line', onClick: 'addData' },
                        ],
                    },
                },
            }],
        },
    }
    // Two keys at its root, which makes the document's form the one the others were merged over (`mergeData`).
    const data = {
        project: 'Launch',
        dataKind: {
            phases: [
                { title: 'Design', budget: 5, dataKind: { lineItems: [{ sku: 'D-1' }] } },
                { title: '', dataKind: { lineItems: [] } },
            ],
        },
    }

    it('lets a `showIf` in the outer rows read them', () => {
        mount(meta, data)

        expect(field('dataKind.phases[0].budget')).toBeInTheDocument()
        expect(field('dataKind.phases[1].budget')).not.toBeInTheDocument()
    })

    it('lets a `showIf` in the nested add row read that row, and the outer rows still read theirs', () => {
        mount(meta, data)
        expect(field('dataKind.phases.0.dataKind.lineItems[1].note')).not.toBeInTheDocument()

        type('dataKind.phases.0.dataKind.lineItems[1].sku', 'D-2')

        expect(field('dataKind.phases.0.dataKind.lineItems[1].note')).toBeInTheDocument()
        expect(field('dataKind.phases.1.dataKind.lineItems[0].note')).not.toBeInTheDocument()
        expect(field('dataKind.phases[0].budget')).toBeInTheDocument()
    })
})
