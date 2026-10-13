/**
 * WHAT A DOCUMENT'S MOUNT COSTS ITS FORM, pinned (2026-10-13).
 * =============================================================================================
 *
 * react-final-form pauses validation while the first render's fields register, but each field that registered
 * still published the state of every field before it, so a document of n fields computed about n²/2 field states
 * as it mounted. The form a document renders now registers them silently while validation is paused, and publishes
 * every field's state once when it resumes (`createBatchedForm`, `modules/form/batchedForm.ts`).
 *
 * A field's state is counted where final-form computes it, through the field's `isEqual`, which it calls once for
 * the field's own state and twice for each field in the form's. Here 101 fields register: the table's `rows` and
 * its 100 cells. Each one's state is computed 14 times:
 *  - twice as it registers: react-final-form's probe in its first render, then its effect's registration;
 *  - once in each of the two passes when validation resumes, final-form's own and the batch's;
 *  - twice in each of the form's five recalculations: those two passes, react-final-form's subscription, and two
 *    reads of the form's state.
 * One validation adds 1, for 1415. Before, each registration published every field registered before it, which
 * added 101·102/2 = 5151 for 6162. Measured in Chromium on 2026-10-13, a 200-row table of two fields per row
 * spent about 100 ms of its 215 ms mount there. A number here that falls is progress: lower it. One that rises is
 * a regression.
 */
import React from 'react'
import { act, render } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every field state final-form computes, counted through each field's `isEqual`. */
const mockComputed = { count: 0 }
jest.mock('final-form', () => {
    const actual = jest.requireActual('final-form')
    const createForm = config => {
        const form = actual.createForm(config)
        const registerField = form.registerField
        form.registerField = (name, subscriber, subscription, fieldConfig = {}) => registerField(name, subscriber, subscription, {
            ...fieldConfig,
            isEqual: (a, b) => {
                mockComputed.count += 1
                return fieldConfig.isEqual ? fieldConfig.isEqual(a, b) : a === b
            },
        })
        return form
    }
    return { __esModule: true, ...actual, createForm }
})

const ROWS = 50
const meta = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
        { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty' } },
    ],
}
const data = () => ({ rows: Array.from({ length: ROWS }, (_, i) => ({ note: `note ${i}`, qty: i })) })

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('a 50-row table of two fields per row', () => {
    it('computes each field\'s state a few times as it mounts, not once for every field after it', () => {
        mockComputed.count = 0
        render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
        act(() => { jest.runOnlyPendingTimers() })
        const form = [...formsStorage.values()].map(entry => entry.form).find(candidate => (candidate.getState().values.rows || []).length === ROWS)
        const fields = form.getRegisteredFields()
        expect(fields).toHaveLength(2 * ROWS + 1)
        expect(fields.filter(name => !name.startsWith('rows['))).toEqual(['rows'])
        expect(mockComputed.count).toBe(14 * fields.length + 1)
        // And each field has the state it would have had: its value, and nothing to report.
        expect(form.getFieldState('rows[1].note')).toMatchObject({ value: 'note 1', pristine: true, valid: true })
        expect(form.getFieldState('rows[49].qty')).toMatchObject({ value: 49, pristine: true, valid: true })
    })
})
