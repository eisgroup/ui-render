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

/**
 * Mounts the meta on the data; the host records what `getFormData` reads, and what a submit sends, and can hand the
 * document other data.
 */
function mount (meta, data) {
    const host = { reader: null, submitted: [] }
    const document = values => (
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(values)} initialValues={cloneDeep(values)}
                    getFormData={function (reader) { host.reader = reader }}
                    onSubmit={function (submitted) { host.submitted.push(cloneDeep(submitted)) }}/>
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    const view = render(document(data))
    return { ...view, host, handOver: values => view.rerender(document(values)) }
}

const field = name => document.querySelector(`[name="${name}"]`)
/** The message a field shows: what its input is described by, an element there only while it shows one. */
const shown = name => {
    const help = field(name).getAttribute('aria-describedby')
    return help ? document.getElementById(help).textContent : ''
}

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
    const meta = {
        view: 'Table',
        name: 'dataKind.items',
        headers,
        renderItemCells: { view: 'Data', kind: 'items', embedded: true, useForm: true, meta: { view: 'TableCells', items: cells(false) } },
    }
    const data = { dataKind: { items: [{ kind: 'plain' }, { kind: 'other', detail: 'second' }] } }

    // Until 2026-10-26 its form started from the row's values at the root of its own, where none of its fields reads:
    // every field of the row started empty. And a submit sent the rows as the live merge had them
    // (`getLiveMergedDataKindArray`), which let the document's copy of an edited row win, and kept no more rows than
    // the shortest array of the forms held, which an edited row's form held up to its own index. Measured on the code
    // before: the fields empty, and a submit after an edit of the first of three rows sent that row unedited, alone.
    it('starts its fields from the row\'s values', () => {
        mount(meta, data)

        expect(field('dataKind.items[0].kind')).toHaveValue('plain')
        expect(field('dataKind.items[1].kind')).toHaveValue('other')
        expect(field('dataKind.items[1].detail')).toHaveValue('second')
    })

    it('submits every row, the edited one with its edit', async () => {
        const withSubmit = { view: 'Col', items: [meta, { view: 'Button', children: 'Submit', onClick: 'submit' }] }
        const rows = [{ kind: 'plain' }, { kind: 'other', detail: 'second' }, { kind: 'plain' }]
        const { host } = mount(withSubmit, { dataKind: { items: rows } })

        type('dataKind.items[0].kind', 'other')
        await click('Submit')

        expect(host.submitted).toEqual([{ dataKind: { items: [{ kind: 'other' }, rows[1], rows[2]] } }])
    })

    it('shows the rows a host hands it next, and a `showIf` in them reads them', () => {
        const { handOver } = mount(meta, data)

        handOver({ dataKind: { items: [{ kind: 'other', detail: 'first' }, { kind: 'plain' }] } })

        expect(field('dataKind.items[0].kind')).toHaveValue('other')
        expect(field('dataKind.items[0].detail')).toHaveValue('first')
        expect(field('dataKind.items[1].kind')).toHaveValue('plain')
        expect(field('dataKind.items[1].detail')).not.toBeInTheDocument()
    })

    it('finds an overlap between its period and another row\'s', async () => {
        // A cross-row check reads the other rows from the forms (`getLiveMergedDataKindArray`), and this row's from
        // the values its validator is handed. Before, its form held neither end of its period where the check reads it.
        const verify = () => ({ dataKind: 'periods', validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }] })
        const periods = {
            view: 'Table',
            name: 'dataKind.periods',
            headers: [{ id: 'startDate', label: 'Start' }, { id: 'endDate', label: 'End' }],
            renderItemCells: {
                view: 'Data', kind: 'periods', embedded: true, useForm: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Input', name: 'startDate', type: 'text', verify: verify() },
                        { view: 'Input', name: 'endDate', type: 'text', verify: verify() },
                    ],
                },
            },
        }
        mount(periods, { dataKind: { periods: [{ startDate: '2020-01-01', endDate: '2020-06-30' }, { startDate: '2021-01-01', endDate: '2021-06-30' }] } })

        type('dataKind.periods[1].startDate', '2020-03-01')
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })

        expect(shown('dataKind.periods[1].startDate')).toBe('Periods cannot overlap')
    })

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
