/**
 * AN `onApplyPeriods` ACTION WAITS FOR THE ERRORS ITS FIELDS SHOW (2026-10-23).
 * =============================================================================================
 *
 * It sent a table that showed errors: measured on a period table with required cells, a user emptied
 * a number field, the field showed `Required`, the host's `getValidationErrors` heard it, and the
 * action still sent the row, with `""` in it. A `submit` in the same state reached no `onSubmit`.
 *
 * Now nothing is sent while a field the user can change shows its error, and nothing new is shown.
 * What it must not wait for is pinned as well: a column the host computes in its answer, disabled and
 * required, is empty in a row added through the table's add row, and a failed submit shows its error.
 * Waiting for it, the action would never send the row the host has to compute it for.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { cloneDeep } from '../../utils'
import { phraseMessage } from '../../utils/phrases'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const popup = { ...initialAppState, setPopupState: jest.fn() }

afterEach(() => {
    cleanup()
    formsStorage.clear()
    popup.setPopupState.mockClear()
})

const rowCells = [
    { view: 'Input', name: 'periodName', type: 'text', validate: 'required' },
    { view: 'Input', name: 'weight', type: 'number', validate: 'required' },
    // Computed by the host from the other columns, in its answer to the action.
    { view: 'Input', name: 'numberOfMonths', type: 'number', disabled: true, validate: 'required' },
    { view: 'Button', children: 'Remove', onClick: 'removeData' },
]
const addRowCells = [
    { view: 'Input', name: 'periodName', type: 'text', validate: 'required', label: 'New period' },
    { view: 'Input', name: 'weight', type: 'number', validate: 'required', label: 'New weight' },
    { view: 'Input', name: 'numberOfMonths', type: 'number', disabled: true, label: 'New months' },
    { view: 'Button', children: 'Add', onClick: 'addData' },
]

/** A period table with its add row, and the nodes given put before it. */
const periodMeta = (...before) => ({
    view: 'Col',
    items: [
        ...before,
        {
            view: 'Table',
            name: 'dataKind.periods',
            headers: [
                { id: 'periodName', label: 'Period' },
                { id: 'weight', label: 'Weight' },
                { id: 'numberOfMonths', label: 'Months' },
                { id: 'null', label: '' },
            ],
            renderItemCells: { view: 'Data', kind: 'periods', embedded: true, meta: { view: 'TableCells', items: rowCells } },
            renderExtraItem: { view: 'Data', kind: 'periods', embedded: true, initialValues: {}, meta: { view: 'TableCells', items: addRowCells } },
        },
        { view: 'Button', children: 'Submit', onClick: 'submit' },
        { view: 'Button', children: 'Apply', onClick: { name: 'onApplyPeriods' } },
    ],
})

const current = { periodName: 'Current', weight: 0.5, numberOfMonths: 12 }

/** Mounts the document; the host records what reaches it, and answers the action with `answer(values)`. */
function mount ({ meta = periodMeta(), data = { dataKind: { periods: [current] } }, answer = () => undefined } = {}) {
    const sent = []
    const submitted = []
    const updateData = function (values) {
        sent.push(cloneDeep(values))
        return Promise.resolve(answer(values))
    }
    const onSubmit = function (values) { submitted.push(cloneDeep(values)) }
    const view = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)}
                    apiCalls={{ updateData }} onSubmit={onSubmit} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...view, sent, submitted }
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

describe('an onApplyPeriods action', () => {
    it('sends a table whose fields show no error', async () => {
        const { sent } = mount()

        await click('Apply')

        expect(sent).toEqual([{ dataKind: { periods: [current] } }])
    })

    it('sends nothing while a field the user emptied shows Required, shows nothing new, and sends once it is filled', async () => {
        const { sent } = mount()
        type('dataKind.periods[0].weight', '')
        expect(shown('dataKind.periods[0].weight')).toBe('Required')

        await click('Apply')

        expect(sent).toEqual([])
        expect(popup.setPopupState).not.toHaveBeenCalled()
        expect(shown('dataKind.periods[0].weight')).toBe('Required')

        type('dataKind.periods[0].weight', '0.75')
        await click('Apply')

        expect(sent).toEqual([{ dataKind: { periods: [{ ...current, weight: 0.75 }] } }])
    })

    it('does not wait for an error the field does not show yet, and leaves that field untouched', async () => {
        const reference = { view: 'Input', name: 'reference', type: 'text', validate: 'required', label: 'Reference' }
        const { sent } = mount({ meta: periodMeta(reference) })

        await click('Apply')

        expect(sent).toHaveLength(1)
        expect(shown('dataKind.periods[0].weight')).toBe('')
        expect(shown('reference')).toBe('')
        const [root] = [...formsStorage.values()].filter(({ draftRow }) => !draftRow)
        expect(root.form.getFieldState('reference')).toMatchObject({ error: phraseMessage('REQUIRED'), touched: false })
    })

    it('waits for the error of a block with a form of its own, whose values it sends as well', async () => {
        const block = {
            view: 'Data', kind: 'notes', useForm: true,
            meta: { view: 'Col', items: [{ view: 'Input', name: 'note', type: 'text', validate: 'required', label: 'Note' }] },
        }
        const { sent } = mount({ meta: periodMeta(block) })
        type('note', '')
        expect(shown('note')).toBe('Required')

        await click('Apply')
        expect(sent).toEqual([])

        type('note', 'filled')
        await click('Apply')
        expect(sent).toEqual([{ note: 'filled', dataKind: { periods: [current] } }])
    })

    it('does not wait for an error in the add row, whose values it does not send', async () => {
        const { sent } = mount()
        type('dataKind.periods[1].periodName', '')
        expect(shown('dataKind.periods[1].periodName')).toBe('Required')

        await click('Apply')

        expect(sent).toEqual([{ dataKind: { periods: [current] } }])
    })

    describe('a row added through the add row, whose computed column only the host fills', () => {
        const added = { periodName: 'Next', weight: 0.25 }
        // The host's answer: every row with its months, 3 for the row that has none yet.
        const answer = values => ({ dataKind: { periods: values.dataKind.periods.map(row => ({ ...row, numberOfMonths: row.numberOfMonths || 3 })) } })
        const addRow = async () => {
            type('dataKind.periods[1].periodName', 'Next')
            type('dataKind.periods[1].weight', '0.25')
            await click('Add')
            expect(field('dataKind.periods[1].numberOfMonths')).toBeDisabled()
        }

        it('is sent once Add has put it in the rows, and a submit then reaches the host', async () => {
            const { sent, submitted } = mount({ answer })
            await addRow()
            // Empty and required, so no submit gets past it; its error does not show yet.
            expect(shown('dataKind.periods[1].numberOfMonths')).toBe('')

            await click('Apply')
            expect(sent).toEqual([{ dataKind: { periods: [current, added] } }])
            expect(field('dataKind.periods[1].numberOfMonths')).toHaveValue('3')

            await click('Submit')
            expect(submitted).toEqual([{ dataKind: { periods: [current, { ...added, numberOfMonths: 3 }] } }])
        })

        it('is sent after a failed submit, which shows the computed column\'s error', async () => {
            const { sent, submitted } = mount({ answer })
            await addRow()

            // A failed submit marks every field touched: the disabled column shows its error.
            await click('Submit')
            expect(submitted).toEqual([])
            expect(shown('dataKind.periods[1].numberOfMonths')).toBe('Required')

            await click('Apply')
            expect(sent).toEqual([{ dataKind: { periods: [current, added] } }])
            expect(shown('dataKind.periods[1].numberOfMonths')).toBe('')
        })
    })

    it('does not wait for a readonly field, whose error the user cannot fix', async () => {
        const contact = { view: 'Input', name: 'contact', type: 'text', readonly: true, validate: 'email', label: 'Contact' }
        const data = { contact: 'not an address', dataKind: { periods: [current] } }
        const { sent, submitted } = mount({ meta: periodMeta(contact), data })

        await click('Submit')
        expect(submitted).toEqual([])
        expect(shown('contact')).not.toBe('')

        await click('Apply')
        expect(sent).toEqual([data])
    })
})
