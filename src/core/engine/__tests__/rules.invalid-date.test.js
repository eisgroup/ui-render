/**
 * A DATE FIELD LEFT WITH TEXT THAT IS NO DATE (2026-10-23).
 * =============================================================================================
 *
 * Measured in Chromium on the period table of the demo, with dates as `MM-DD-YYYY`: `11-31-2021` or `02-29-2021`
 * typed in an empty required field was wiped when the field was left, and the field said `Required`. Typed over a
 * date, it was replaced by that date again, and nothing was said. rc-picker reads typed text strictly and hands on only
 * a date, and it showed the date it had again once the field was left.
 *
 * The field keeps the text now and says `Invalid date`, required or not. Its value stays the date it had, or none:
 * that is what `getFormData` returns, and a submit and an `onApplyPeriods` send nothing while the error shows. The
 * `reset` action shows the value again in place of the text.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { cloneDeep } from '../../utils'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const popup = { ...initialAppState, setPopupState: jest.fn() }
const config = { ...initialConfigState, dateFormat: 'MM-DD-YYYY' }

afterEach(() => {
    cleanup()
    formsStorage.clear()
    popup.setPopupState.mockClear()
})

// The rows' periods may not overlap, as in the demo: the check reads the field's state, which final-form hands a
// validator that asks for it, and so does the field's validator around it.
const verify = { dataKind: 'periods', validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }] }
const rowCells = [
    { view: 'Input', name: 'startDate', type: 'date', validate: 'required', verify },
    { view: 'Input', name: 'endDate', type: 'date', verify },
    { view: 'Button', children: 'Remove', onClick: 'removeData' },
]
const addRowCells = [
    { view: 'Input', name: 'startDate', type: 'date', validate: 'required', label: 'New start' },
    { view: 'Input', name: 'endDate', type: 'date', label: 'New end' },
    { view: 'Button', children: 'Add', onClick: 'addData' },
]

const meta = {
    view: 'Col',
    items: [
        {
            view: 'Table',
            name: 'dataKind.periods',
            headers: [{ id: 'startDate', label: 'Start' }, { id: 'endDate', label: 'End' }, { id: 'null', label: '' }],
            renderItemCells: { view: 'Data', kind: 'periods', embedded: true, meta: { view: 'TableCells', items: rowCells } },
            renderExtraItem: { view: 'Data', kind: 'periods', embedded: true, initialValues: {}, meta: { view: 'TableCells', items: addRowCells } },
        },
        { view: 'Button', children: 'Submit', onClick: 'submit' },
        { view: 'Button', children: 'Apply', onClick: { name: 'onApplyPeriods' } },
        { view: 'Button', children: 'Reset', onClick: 'reset' },
    ],
}

const data = { dataKind: { periods: [{ startDate: '2022-01-01', endDate: '2022-03-31' }] } }

/** Mounts the document; the host records what reaches it, and keeps the reader `getFormData` hands it. */
function mount () {
    const sent = []
    const submitted = []
    const host = {}
    const view = render(
        <ConfigContext.Provider value={config}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)}
                    apiCalls={{ updateData: values => { sent.push(cloneDeep(values)); return Promise.resolve() } }}
                    onSubmit={values => { submitted.push(cloneDeep(values)) }}
                    getFormData={read => { host.read = read }}/>
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...view, sent, submitted, host }
}

const field = name => document.querySelector(`input[name="${name}"]`)
/** The message a field shows: what its input is described by, an element there only while it shows one. */
const shown = name => {
    const help = field(name).getAttribute('aria-describedby')
    return help ? document.getElementById(help).textContent : ''
}

/** Types as a user does, and lets rc-picker close and confirm, a frame or two after the field is left. */
const typeAndLeave = async (name, text) => {
    const input = field(name)
    act(() => input.focus())
    fireEvent.change(input, { target: { value: text } })
    act(() => input.blur())
    await act(() => new Promise(resolve => setTimeout(resolve, 100)))
}

const click = name => act(async () => {
    fireEvent.click(screen.getByRole('button', { name }))
    await new Promise(resolve => setTimeout(resolve, 0))
})

describe('a date field left with text that is no date', () => {
    it.each(['11-31-2021', '02-29-2021', '11/31/2021'])('in an empty required field keeps %s and says Invalid date, not Required', async (text) => {
        mount()

        await typeAndLeave('dataKind.periods[1].startDate', text)

        expect(field('dataKind.periods[1].startDate')).toHaveValue(text)
        expect(shown('dataKind.periods[1].startDate')).toBe('Invalid date')
    })

    it('over a date keeps the text, says Invalid date, and the value is still the date', async () => {
        const { host } = mount()

        await typeAndLeave('dataKind.periods[0].startDate', '02-29-2021')

        expect(field('dataKind.periods[0].startDate')).toHaveValue('02-29-2021')
        expect(shown('dataKind.periods[0].startDate')).toBe('Invalid date')
        expect(host.read().dataKind.periods[0].startDate).toBe('2022-01-01')
    })

    it('in an optional field says Invalid date too, and its value is still none', async () => {
        const { host } = mount()
        await typeAndLeave('dataKind.periods[0].endDate', '')
        expect(host.read().dataKind.periods[0].endDate).toBe(null)

        await typeAndLeave('dataKind.periods[0].endDate', '11-31-2021')

        expect(field('dataKind.periods[0].endDate')).toHaveValue('11-31-2021')
        expect(shown('dataKind.periods[0].endDate')).toBe('Invalid date')
        expect(host.read().dataKind.periods[0].endDate).toBe(null)
    })

    it('holds a submit and an onApplyPeriods back, which send the date once the text is corrected', async () => {
        const { sent, submitted } = mount()
        await typeAndLeave('dataKind.periods[0].startDate', '02-29-2021')

        await click('Submit')
        await click('Apply')
        expect(submitted).toEqual([])
        expect(sent).toEqual([])
        expect(shown('dataKind.periods[0].startDate')).toBe('Invalid date')

        await typeAndLeave('dataKind.periods[0].startDate', '02-28-2021')
        expect(shown('dataKind.periods[0].startDate')).toBe('')
        await click('Submit')
        await click('Apply')

        const corrected = { dataKind: { periods: [{ startDate: '2021-02-28', endDate: '2022-03-31' }] } }
        expect(submitted).toEqual([corrected])
        expect(sent).toEqual([corrected])
    })

    it('in the add row holds Add back', async () => {
        const { host } = mount()
        await typeAndLeave('dataKind.periods[1].startDate', '03-01-2022')
        await typeAndLeave('dataKind.periods[1].endDate', '02-30-2022')

        await click('Add')

        expect(host.read().dataKind.periods).toEqual(data.dataKind.periods)
        expect(shown('dataKind.periods[1].endDate')).toBe('Invalid date')
    })

    it('shows the value again in place of the text when the reset action resets the form', async () => {
        mount()
        await typeAndLeave('dataKind.periods[0].startDate', '02-29-2021')
        expect(shown('dataKind.periods[0].startDate')).toBe('Invalid date')

        await click('Reset')

        expect(field('dataKind.periods[0].startDate')).toHaveValue('01-01-2022')
        expect(shown('dataKind.periods[0].startDate')).toBe('')
    })

    it('keeps the text when a field beside it changes', async () => {
        mount()
        await typeAndLeave('dataKind.periods[0].startDate', '02-29-2021')

        await typeAndLeave('dataKind.periods[0].endDate', '04-30-2022')

        expect(field('dataKind.periods[0].startDate')).toHaveValue('02-29-2021')
        expect(shown('dataKind.periods[0].startDate')).toBe('Invalid date')
    })
})

describe('a date field', () => {
    it('takes a date typed and left by a click elsewhere', async () => {
        const { submitted } = mount()

        await typeAndLeave('dataKind.periods[0].startDate', '11-30-2021')
        await click('Submit')

        expect(submitted).toEqual([{ dataKind: { periods: [{ startDate: '2021-11-30', endDate: '2022-03-31' }] } }])
    })

    it('empties its date with its text, and a required one says Required', async () => {
        const { host, submitted } = mount()

        await typeAndLeave('dataKind.periods[0].startDate', '')

        expect(host.read().dataKind.periods[0].startDate).toBe(null)
        expect(shown('dataKind.periods[0].startDate')).toBe('Required')
        await click('Submit')
        expect(submitted).toEqual([])
    })
})
