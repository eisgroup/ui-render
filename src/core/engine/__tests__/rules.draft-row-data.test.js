/**
 * WHAT A USER TYPES IN A TABLE'S ADD ROW IS NOT DATA UNTIL ADD (2026-10-23).
 * =============================================================================================
 *
 * The add row, the row a `renderExtraItem` declaration renders, has a form of its own, and its fields
 * are named by the row they will be: `dataKind.periods[1].startDate` in a table of one row. Its values
 * were merged into the document's like a nested block's, wrapped in its path a second time, and kept as
 * a row since they had content. Measured on the demo's `tableForm`: typing a start date without pressing
 * Add put `{ dataKind: { period: [null, null, { startDate }] } }` into `getFormData` as a third row, and
 * an `onApplyPeriods` and an upload sent it. A submit sent the typed values as a row when the table had
 * none. Now the add row's form is left out of the data (`dataFormsOf`), and Add is what puts its values
 * in the rows. Its own checks still read the rows: an overlap with one of them shows on the add row.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { cloneDeep } from '../../utils'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const popup = { ...initialAppState, setPopupState: jest.fn() }

afterEach(() => {
    cleanup()
    formsStorage.clear()
})

const verify = () => ({ dataKind: 'periods', validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }] })
const cells = addRow => [
    { view: 'Input', name: 'startDate', type: 'text', verify: verify(), ...addRow && { label: 'New start' } },
    { view: 'Input', name: 'endDate', type: 'text', verify: verify(), ...addRow && { label: 'New end' } },
    { view: 'Button', children: addRow ? 'Add' : 'Remove', onClick: addRow ? 'addData' : 'removeData' },
]

const meta = {
    view: 'Col',
    items: [
        {
            view: 'Table',
            name: 'dataKind.periods',
            headers: [{ id: 'startDate', label: 'Start' }, { id: 'endDate', label: 'End' }, { id: 'null', label: '' }],
            renderItemCells: { view: 'Data', kind: 'periods', embedded: true, meta: { view: 'TableCells', items: cells(false) } },
            renderExtraItem: { view: 'Data', kind: 'periods', embedded: true, initialValues: {}, meta: { view: 'TableCells', items: cells(true) } },
        },
        { view: 'Input', name: 'attachment', type: 'file', formats: ['csv'], multiple: false, onChange: 'upload' },
        { view: 'Button', children: 'Submit', onClick: 'submit' },
        { view: 'Button', children: 'Apply', onClick: { name: 'onApplyPeriods' } },
    ],
}

const first = { startDate: '2020-01-01', endDate: '2020-06-30' }

/** Mounts the table with the rows given; the host records what reaches it, and answers nothing. */
function mount (rows = [first]) {
    const host = { reader: null, sent: [], submitted: [], uploaded: [] }
    const data = { dataKind: { periods: rows } }
    const apiCalls = {
        updateData: function (values) { host.sent.push(cloneDeep(values)); return Promise.resolve(undefined) },
        uploadFile: function (serialized) { host.uploaded.push(JSON.parse(serialized)); return Promise.resolve(undefined) },
    }
    const view = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)} apiCalls={apiCalls}
                    getFormData={function (reader) { host.reader = reader }}
                    onSubmit={function (values) { host.submitted.push(cloneDeep(values)) }} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...view, host }
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

const settle = action => act(async () => {
    action()
    await new Promise(resolve => setTimeout(resolve, 0))
})
const click = name => settle(() => fireEvent.click(screen.getByRole('button', { name })))

describe('what the user types in the add row', () => {
    const typed = { startDate: '2021-01-01', endDate: '2021-06-30' }
    const typeTheAddRow = () => {
        type('dataKind.periods[1].startDate', typed.startDate)
        type('dataKind.periods[1].endDate', typed.endDate)
    }

    it('is in neither getFormData nor what an onApplyPeriods sends, until Add puts it in the rows', async () => {
        const { host } = mount()
        typeTheAddRow()

        expect(host.reader()).toEqual({ dataKind: { periods: [first] } })
        await click('Apply')
        expect(host.sent).toEqual([{ dataKind: { periods: [first] } }])

        await click('Add')

        expect(host.reader()).toEqual({ dataKind: { periods: [first, typed] } })
        await click('Apply')
        expect(host.sent[1]).toEqual({ dataKind: { periods: [first, typed] } })
    })

    it('is not in what an upload sends', async () => {
        const { host, container } = mount()
        typeTheAddRow()

        const file = new File(['a,b\n1,2'], 'rates.csv', { type: 'text/csv' })
        await settle(() => fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } }))

        expect(host.uploaded).toEqual([{ dataKind: { periods: [first] } }])
    })

    it('is not submitted as a row of a table that has none', async () => {
        const { host } = mount([])
        type('dataKind.periods[0].startDate', typed.startDate)
        type('dataKind.periods[0].endDate', typed.endDate)

        await click('Submit')

        expect(host.submitted).toEqual([{ dataKind: { periods: [] } }])
    })

    it('is still checked against the rows: an overlap with one shows on the add row', async () => {
        mount()
        type('dataKind.periods[1].startDate', '2020-03-01')
        type('dataKind.periods[1].endDate', '2020-09-30')

        expect(shown('dataKind.periods[1].endDate')).toBe('Periods cannot overlap')

        type('dataKind.periods[1].startDate', '2020-07-01')

        expect(shown('dataKind.periods[1].endDate')).toBe('')
    })
})
