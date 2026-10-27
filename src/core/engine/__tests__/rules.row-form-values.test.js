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
    // before: the fields empty, and a submit after an edit of the second of three rows sent the first two, unedited.
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

        type('dataKind.items[1].detail', 'edited')
        await click('Submit')

        expect(host.submitted).toEqual([{ dataKind: { items: [rows[0], { kind: 'other', detail: 'edited' }, rows[2]] } }])
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

// The rows' cells have a form of their own, which starts from the whole row (`engine/Data.tsx`), and what a row shows
// below them, its expanded content, renders in the document, whose form holds its fields. Until 2026-10-26 a row's form
// gave every merge all of its row, so the row as it started came back over an edit the expanded content made: found in
// review, in what `getFormData` reads, what a submit sends, what a `showIf` reads and what a cross-row check compares.
// 0.35.0 had none of it: there the row's form held only what was typed in it.
describe('a `useForm` row whose expanded content has a field of the document\'s form', () => {
    const table = {
        view: 'Table',
        name: 'dataKind.items',
        headers: [{ id: 'kind', label: 'Kind' }],
        itemsExpanded: true,
        renderItemCells: {
            view: 'Data', kind: 'items', embedded: true, useForm: true,
            meta: { view: 'TableCells', items: [{ view: 'Input', name: 'kind', type: 'text' }] },
        },
        renderItem: {
            view: 'Col',
            items: [
                { view: 'Input', name: 'note', type: 'text' },
                { view: 'Text', children: 'The note is new', showIf: { name: 'note', equal: 'new' } },
            ],
        },
    }
    const meta = { view: 'Col', items: [table, { view: 'Button', children: 'Submit', onClick: 'submit' }] }
    const data = { dataKind: { items: [{ kind: 'a', note: 'old' }] } }

    it('has the content\'s edit in getFormData and in a submit', async () => {
        const { host } = mount(meta, data)

        type('dataKind.items[0].note', 'new')
        expect(host.reader()).toEqual({ dataKind: { items: [{ kind: 'a', note: 'new' }] } })

        await click('Submit')
        expect(host.submitted).toEqual([{ dataKind: { items: [{ kind: 'a', note: 'new' }] } }])
    })

    it('shows a node whose `showIf` reads the content\'s edit', () => {
        mount(meta, data)

        type('dataKind.items[0].note', 'new')

        expect(screen.queryByText('The note is new')).toBeInTheDocument()
    })

    it('has both edits, the row\'s and the content\'s, in a submit', async () => {
        const { host } = mount(meta, data)

        type('dataKind.items[0].kind', 'typed')
        type('dataKind.items[0].note', 'new')
        await click('Submit')

        expect(host.submitted).toEqual([{ dataKind: { items: [{ kind: 'typed', note: 'new' }] } }])
    })
})

describe('a table in the expanded rows of a table whose cells have `useForm` forms', () => {
    const meta = {
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.phases',
            headers: [{ id: 'title', label: 'Phase' }],
            itemsExpanded: true,
            renderItemCells: {
                view: 'Data', kind: 'phases', embedded: true, useForm: true,
                meta: { view: 'TableCells', items: [{ view: 'Input', name: 'title', type: 'text' }] },
            },
            renderItem: {
                view: 'Col',
                items: [{
                    view: 'Table',
                    name: 'dataKind.lineItems',
                    headers: [{ id: 'sku', label: 'SKU' }, { id: 'note', label: 'Note' }],
                    renderItemCells: {
                        view: 'Data', kind: 'lineItems', embedded: true,
                        meta: {
                            view: 'TableCells',
                            items: [
                                { view: 'Input', name: 'sku', type: 'text' },
                                { view: 'Input', name: 'note', type: 'text', showIf: { name: 'sku' } },
                            ],
                        },
                    },
                }],
            },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    }
    const data = { dataKind: { phases: [{ title: 'Design', dataKind: { lineItems: [{ sku: '' }] } }] } }
    const sku = 'dataKind.phases.0.dataKind.lineItems[0].sku'
    const note = 'dataKind.phases.0.dataKind.lineItems[0].note'
    const edited = { dataKind: { phases: [{ title: 'Design', dataKind: { lineItems: [{ sku: 'X-1' }] } }] } }

    it('has an edit of its rows in getFormData and in a submit', async () => {
        const { host } = mount(meta, data)

        type(sku, 'X-1')
        expect(host.reader()).toEqual(edited)

        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })

    it('shows the field a `showIf` in its row gates on that row\'s edit', () => {
        mount(meta, data)
        expect(field(note)).toBeNull()

        type(sku, 'X-1')

        expect(field(note)).not.toBeNull()
    })
})

describe('a period table in the expanded rows of a table whose cells have `useForm` forms', () => {
    const verify = () => ({ dataKind: 'periods', validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }] })
    const meta = {
        view: 'Table',
        name: 'dataKind.phases',
        headers: [{ id: 'title', label: 'Phase' }],
        itemsExpanded: true,
        renderItemCells: {
            view: 'Data', kind: 'phases', embedded: true, useForm: true,
            meta: { view: 'TableCells', items: [{ view: 'Input', name: 'title', type: 'text' }] },
        },
        renderItem: {
            view: 'Col',
            items: [{
                view: 'Table',
                name: 'dataKind.periods',
                headers: [{ id: 'startDate', label: 'Start' }, { id: 'endDate', label: 'End' }],
                renderItemCells: {
                    view: 'Data', kind: 'periods', embedded: true,
                    meta: {
                        view: 'TableCells',
                        items: [
                            { view: 'Input', name: 'startDate', type: 'text', verify: verify() },
                            { view: 'Input', name: 'endDate', type: 'text', verify: verify() },
                        ],
                    },
                },
            }],
        },
    }
    const data = {
        dataKind: {
            phases: [{
                title: 'Design',
                dataKind: { periods: [{ startDate: '2020-01-01', endDate: '2020-06-30' }, { startDate: '2021-01-01', endDate: '2021-06-30' }] },
            }],
        },
    }
    const at = (row, name) => `dataKind.phases.0.dataKind.periods[${row}].${name}`

    it('shows an overlap on both rows when an edit of one makes it overlap the other', async () => {
        mount(meta, data)
        fireEvent.focus(field(at(1, 'startDate')))
        fireEvent.blur(field(at(1, 'startDate')))

        type(at(0, 'endDate'), '2021-03-01')
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })

        expect(shown(at(0, 'endDate'))).toBe('Periods cannot overlap')
        expect(shown(at(1, 'startDate'))).toBe('Periods cannot overlap')
    })
})

// For a `null` row the `Data` view is handed the document's data (`mapper.tsx`). Until 2026-10-26 a `useForm` row's form
// put that at the row: found in review, `getFormData` and a submit had a copy of the document as the row, and a field of
// the row showed a value of the document's own of its name. 0.35.0 had none of it.
describe('an empty row with a `useForm` form', () => {
    const table = {
        view: 'Table',
        name: 'dataKind.items',
        headers: [{ id: 'kind', label: 'Kind' }],
        renderItemCells: {
            view: 'Data', kind: 'items', embedded: true, useForm: true,
            meta: { view: 'TableCells', items: [{ view: 'Input', name: 'kind', type: 'text' }] },
        },
    }
    const meta = { view: 'Col', items: [table, { view: 'Button', children: 'Submit', onClick: 'submit' }] }

    it('is no row in getFormData, and goes back to a submit as it came', async () => {
        const { host } = mount(meta, { title: 'T', dataKind: { items: [{ kind: 'a' }, null] } })
        expect(host.reader()).toEqual({ title: 'T', dataKind: { items: [{ kind: 'a' }] } })

        await click('Submit')
        expect(host.submitted).toEqual([{ title: 'T', dataKind: { items: [{ kind: 'a' }, null] } }])
    })

    it('shows nothing of the document in its fields', () => {
        mount(meta, { kind: 'of the document', dataKind: { items: [{ kind: 'a' }, null] } })

        expect(field('dataKind.items[1].kind')).toHaveValue('')
    })
})

describe('an empty row with a `useForm` form, edited', () => {
    const meta = {
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.items',
            headers: [{ id: 'kind', label: 'Kind' }],
            renderItemCells: {
                view: 'Data', kind: 'items', embedded: true, useForm: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Input', name: 'kind', type: 'text' },
                        { view: 'Text', children: 'Typed here', showIf: { name: 'kind', equal: 'typed' } },
                    ],
                },
            },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    }

    it.each([['a `null` row', null], ['a `{}` row', {}]])('has the edit of %s in getFormData, a `showIf` and a submit', async (_, row) => {
        const { host } = mount(meta, { title: 'T', dataKind: { items: [{ kind: 'a' }, row] } })
        const edited = { title: 'T', dataKind: { items: [{ kind: 'a' }, { kind: 'typed' }] } }

        type('dataKind.items[1].kind', 'typed')

        expect(host.reader()).toEqual(edited)
        expect(screen.queryByText('Typed here')).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })
})

// final-form drops a value set to `undefined`, which a field with `normalize: 'date'` sets for an empty date. Until
// 2026-10-26 a `useForm` row's form gave nothing for a value it no longer held, so the document's copy showed the date
// again: found in review, in `getFormData`, a submit and a `showIf`.
describe('a value cleared in a `useForm` row', () => {
    const withSubmit = cells => ({
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.items',
            headers: cells.map(({ name }) => ({ id: name || 'null', label: name || '' })),
            renderItemCells: { view: 'Data', kind: 'items', embedded: true, useForm: true, meta: { view: 'TableCells', items: cells } },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    })

    it('is gone from getFormData, a `showIf` and a submit, for a date field', async () => {
        const meta = withSubmit([
            { view: 'Input', name: 'kind', type: 'text' },
            { view: 'Input', name: 'when', type: 'text', normalize: 'date' },
            { view: 'Text', children: 'Has a date', showIf: { name: 'when' } },
        ])
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'a', when: '2020-01-01' }] } })
        expect(screen.queryByText('Has a date')).toBeInTheDocument()

        type('dataKind.items[0].when', '')

        expect(host.reader()).toEqual({ dataKind: { items: [{ kind: 'a' }] } })
        expect(screen.queryByText('Has a date')).not.toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([{ dataKind: { items: [{ kind: 'a' }] } }])
    })

    it('is empty, or off, where the field keeps a value for it', async () => {
        const meta = withSubmit([
            { view: 'Input', name: 'note', type: 'text' },
            { view: 'Toggle', name: 'on', label: 'On' },
        ])
        const { host } = mount(meta, { dataKind: { items: [{ note: 'old', on: true }] } })

        type('dataKind.items[0].note', '')
        act(() => { fireEvent.click(field('dataKind.items[0].on') || screen.getByLabelText('On')) })

        expect(host.reader()).toEqual({ dataKind: { items: [{ note: '', on: false }] } })
        await click('Submit')
        expect(host.submitted).toEqual([{ dataKind: { items: [{ note: '', on: false }] } }])
    })
})

// A node rendered outside its document's render, such as a cell of a table's `extraItems`, has no document instance.
// Until 2026-10-26 a `Data` view handed an object read that instance's data, and threw there: found in review.
describe('a `useForm` block in a cell of a table\'s `extraItems`', () => {
    it('renders its field', () => {
        const meta = {
            view: 'Table',
            name: 'dataKind.items',
            headers: [{ id: 'kind', label: 'Kind' }],
            extraItems: [{
                kind: { view: 'Data', kind: 'extra', useForm: true, meta: { view: 'Col', items: [{ view: 'Input', name: 'extraNote', type: 'text' }] } },
            }],
        }

        mount(meta, { dataKind: { items: [{ kind: 'a' }] } })

        expect(field('extraNote')).toBeInTheDocument()
    })
})

// From 2026-10-27 a `useForm` row's form gives every merge the values of its fields, each read and written at the
// field's name, and nothing else (`engine/formData.ts`). From 2026-10-26 it gave what it changed of the row it started
// from, which review found wrong three ways: a field named `length` was taken for an array's length, an object the row
// did not start with was written whole, over a field the expanded content had added to it, and a cleared field took
// away the whole object it left empty in the row's form, with a field the expanded content held in it. 0.35.0 had the
// first two right for `getFormData` and a `showIf`. Each case runs for rows with forms of their own and for rows that
// share the document's form, which give the same.
describe.each([['`useForm` rows', true], ['rows sharing the document\'s form', false]])('a table of %s', (_, useForm) => {
    /** A table of `items` whose cells are `cells`, and whose expanded content is `expanded`, with a Submit button. */
    const tableOf = (cells, expanded) => ({
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.items',
            headers: [{ id: 'kind', label: 'Kind' }],
            ...expanded && { itemsExpanded: true, renderItem: { view: 'Col', items: expanded } },
            renderItemCells: { view: 'Data', kind: 'items', embedded: true, useForm, meta: { view: 'TableCells', items: cells } },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    })

    it('has an edit of a field named `length` in getFormData, a `showIf` and a submit', async () => {
        const meta = tableOf([
            { view: 'Input', name: 'kind', type: 'text' },
            { view: 'Input', name: 'length', type: 'text' },
            { view: 'Text', children: 'Long', showIf: { name: 'length', equal: '5' } },
        ])
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'a', length: '3' }] } })
        const edited = { dataKind: { items: [{ kind: 'a', length: '5' }] } }

        type('dataKind.items[0].length', '5')

        expect(host.reader()).toEqual(edited)
        expect(screen.queryByText('Long')).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })

    it('keeps a field the expanded content adds to an object beside one typed in the cells', async () => {
        // The row starts with no `address`.
        const meta = tableOf(
            [{ view: 'Input', name: 'kind', type: 'text' }, { view: 'Input', name: 'address.city', type: 'text' }],
            [{ view: 'Input', name: 'address.zip', type: 'text' }],
        )
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'a' }] } })
        const edited = { dataKind: { items: [{ kind: 'a', address: { zip: '123', city: 'X' } }] } }

        type('dataKind.items[0].address.zip', '123')
        type('dataKind.items[0].address.city', 'X')

        expect(host.reader()).toEqual(edited)
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })

    it('keeps a field the expanded content holds in an object whose date the cells clear', async () => {
        const meta = tableOf(
            [{ view: 'Input', name: 'kind', type: 'text' }, { view: 'Input', name: 'period.start', type: 'text', normalize: 'date' }],
            [{ view: 'Input', name: 'period.end', type: 'text' }],
        )
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'a', period: { start: '2020-01-01' } }] } })
        const edited = { dataKind: { items: [{ kind: 'a', period: { end: '2020-12-31' } }] } }

        type('dataKind.items[0].period.end', '2020-12-31')
        type('dataKind.items[0].period.start', '')

        expect(host.reader()).toEqual(edited)
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })

    // Found in review, from 2026-10-27, for a day: the row's form wrote the value it started with over the edit, and a
    // submit wrote that back into the document's form, so the expanded content's input lost it too. 0.35.0 had it right.
    it.each([['an input', {}], ['a read-only input', { readonly: true }]])('keeps an edit the expanded content makes of a field the cells show in %s', async (__, shown) => {
        const meta = tableOf(
            [{ view: 'Input', name: 'kind', type: 'text' }, { view: 'Input', name: 'note', type: 'text', ...shown }],
            [{ view: 'Input', name: 'note', type: 'text' }, { view: 'Text', children: 'The note is new', showIf: { name: 'note', equal: 'new' } }],
        )
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'a', note: 'old' }] } })
        const edited = { dataKind: { items: [{ kind: 'a', note: 'new' }] } }
        const expandedNote = () => Array.from(document.querySelectorAll('[name="dataKind.items[0].note"]')).pop()

        fireEvent.focus(expandedNote())
        fireEvent.change(expandedNote(), { target: { value: 'new' } })
        fireEvent.blur(expandedNote())

        expect(host.reader()).toEqual(edited)
        expect(screen.queryByText('The note is new')).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([edited])
        expect(expandedNote()).toHaveValue('new')
    })

    it('keeps an edit the expanded content makes of a field the cells showed and then hid', async () => {
        const meta = tableOf(
            [{ view: 'Input', name: 'kind', type: 'text' }, { view: 'Input', name: 'detail', type: 'text', showIf: { name: 'kind', equal: 'other' } }],
            [{ view: 'Input', name: 'detail', type: 'text' }],
        )
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'plain', detail: 'as loaded' }] } })
        const edited = { dataKind: { items: [{ kind: 'plain', detail: 'new' }] } }

        type('dataKind.items[0].kind', 'other')
        type('dataKind.items[0].kind', 'plain')
        type('dataKind.items[0].detail', 'new')

        expect(document.querySelectorAll('[name="dataKind.items[0].detail"]')).toHaveLength(1)
        expect(host.reader()).toEqual(edited)
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })

    it('keeps the edit of a field that a `showIf` in the cells then hides, as final-form keeps its value', async () => {
        const meta = tableOf([
            { view: 'Input', name: 'kind', type: 'text' },
            { view: 'Input', name: 'detail', type: 'text', showIf: { name: 'kind', equal: 'other' } },
        ])
        const { host } = mount(meta, { dataKind: { items: [{ kind: 'other', detail: 'as loaded' }] } })
        const edited = { dataKind: { items: [{ kind: 'plain', detail: 'edited' }] } }

        type('dataKind.items[0].detail', 'edited')
        type('dataKind.items[0].kind', 'plain')

        expect(field('dataKind.items[0].detail')).not.toBeInTheDocument()
        expect(host.reader()).toEqual(edited)
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })
})

// A submit writes only the top arrays of the document back, as the live merge gives them (`submit` in `rules.tsx`), and
// until 2026-10-27 that merge left out a row with a form of its own inside another table's row: the edit of a `useForm`
// line in a phase's expanded content reached `getFormData`, and not a submit. 0.35.0 did the same. Found in review.
describe.each([['`useForm` rows', true], ['rows sharing the document\'s form', false]])('a table of `useForm` lines in the expanded rows of a table of %s', (_, useForm) => {
    const meta = {
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.phases',
            headers: [{ id: 'title', label: 'Phase' }],
            itemsExpanded: true,
            renderItemCells: { view: 'Data', kind: 'phases', embedded: true, useForm, meta: { view: 'TableCells', items: [{ view: 'Input', name: 'title', type: 'text' }] } },
            renderItem: {
                view: 'Col',
                items: [{
                    view: 'Table',
                    name: 'dataKind.lineItems',
                    headers: [{ id: 'sku', label: 'SKU' }, { id: 'note', label: 'Note' }],
                    renderItemCells: {
                        view: 'Data', kind: 'lineItems', embedded: true, useForm: true,
                        meta: {
                            view: 'TableCells',
                            items: [{ view: 'Input', name: 'sku', type: 'text' }, { view: 'Input', name: 'note', type: 'text', showIf: { name: 'sku', equal: 'X-1' } }],
                        },
                    },
                }],
            },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    }
    const data = { dataKind: { phases: [{ title: 'Design', dataKind: { lineItems: [{ sku: 'A' }, { sku: 'B' }] } }] } }
    const edited = { dataKind: { phases: [{ title: 'Design 2', dataKind: { lineItems: [{ sku: 'A' }, { sku: 'X-1' }] } }] } }

    it('has the edits of a phase and of a line in getFormData, a `showIf` and a submit', async () => {
        const { host } = mount(meta, data)
        expect(field('dataKind.phases.0.dataKind.lineItems[1].sku')).toHaveValue('B')

        type('dataKind.phases[0].title', 'Design 2')
        type('dataKind.phases.0.dataKind.lineItems[1].sku', 'X-1')

        expect(host.reader()).toEqual(edited)
        expect(field('dataKind.phases.0.dataKind.lineItems[1].note')).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([edited])
    })
})

// A submit writes the merged rows into the document's form, in place, before final-form validates (`submit` in
// `rules.tsx`): the document holds a row's edits from then on, whether the submit goes through or not. Measured from the
// values it started with, a `useForm` row's edit set back after it was no change, and the document's copy, holding the
// edit, came back in `getFormData`, a `showIf` and the next submit. Found in review, at 5ffe1898; 0.35.0 sent no edit of
// such a row at all. A row's form now measures its changes from what a submit wrote (`restartWrittenRows`).
describe.each([['`useForm` rows', true], ['rows sharing the document\'s form', false]])('an edit set back after a submit, in a table of %s', (_, useForm) => {
    const tableOf = before => ({
        view: 'Col',
        items: [...before, {
            view: 'Table',
            name: 'dataKind.items',
            headers: [{ id: 'kind', label: 'Kind' }],
            renderItemCells: {
                view: 'Data', kind: 'items', embedded: true, useForm,
                meta: {
                    view: 'TableCells',
                    items: [{ view: 'Input', name: 'kind', type: 'text' }, { view: 'Text', children: 'The kind is b', showIf: { name: 'kind', equal: 'b' } }],
                },
            },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    })

    it('is what getFormData, a `showIf` and the next submit read', async () => {
        const data = { dataKind: { items: [{ kind: 'a' }] } }
        const { host } = mount(tableOf([]), data)

        type('dataKind.items[0].kind', 'b')
        await click('Submit')
        type('dataKind.items[0].kind', 'a')

        expect(host.submitted).toEqual([{ dataKind: { items: [{ kind: 'b' }] } }])
        expect(host.reader()).toEqual(data)
        expect(screen.queryByText('The kind is b')).not.toBeInTheDocument()
        await click('Submit')
        expect(host.submitted[1]).toEqual(data)
    })

    it('is what getFormData reads after a submit that validation stopped', async () => {
        const title = { view: 'Input', name: 'title', type: 'text', validate: 'required', required: true }
        const data = { title: '', dataKind: { items: [{ kind: 'a' }] } }
        const { host } = mount(tableOf([title]), data)

        type('dataKind.items[0].kind', 'b')
        await click('Submit')
        type('dataKind.items[0].kind', 'a')

        expect(host.submitted).toEqual([])
        expect(host.reader()).toEqual(data)
    })
})

describe.each([['`useForm` rows', true], ['rows sharing the document\'s form', false]])('a `useForm` line\'s edit set back after a submit, in the expanded rows of a table of %s', (_, useForm) => {
    const meta = {
        view: 'Col',
        items: [{
            view: 'Table',
            name: 'dataKind.phases',
            headers: [{ id: 'title', label: 'Phase' }],
            itemsExpanded: true,
            renderItemCells: { view: 'Data', kind: 'phases', embedded: true, useForm, meta: { view: 'TableCells', items: [{ view: 'Input', name: 'title', type: 'text' }] } },
            renderItem: {
                view: 'Col',
                items: [{
                    view: 'Table',
                    name: 'dataKind.lineItems',
                    headers: [{ id: 'sku', label: 'SKU' }],
                    renderItemCells: { view: 'Data', kind: 'lineItems', embedded: true, useForm: true, meta: { view: 'TableCells', items: [{ view: 'Input', name: 'sku', type: 'text' }] } },
                }],
            },
        }, { view: 'Button', children: 'Submit', onClick: 'submit' }],
    }
    const data = { dataKind: { phases: [{ title: 'Design', dataKind: { lineItems: [{ sku: 'A' }] } }] } }
    const sku = 'dataKind.phases.0.dataKind.lineItems[0].sku'

    it('is what getFormData and the next submit read', async () => {
        const { host } = mount(meta, data)

        type(sku, 'X-1')
        await click('Submit')
        type(sku, 'A')

        expect(host.submitted).toEqual([{ dataKind: { phases: [{ title: 'Design', dataKind: { lineItems: [{ sku: 'X-1' }] } }] } }])
        expect(host.reader()).toEqual(data)
        await click('Submit')
        expect(host.submitted[1]).toEqual(data)
    })
})
