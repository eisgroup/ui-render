/**
 * WHAT ONE EDIT COSTS IN A PERIOD TABLE, pinned (2026-10-12).
 * =============================================================================================
 *
 * The `tableForm` example's table checks each row's dates against every other row's, through a
 * `verify` naming `notWithinRange`: what a host declares for periods. Each change cost in proportion to
 * the rows, for two reasons, each pinned here:
 *
 * - the validator a `verify` composes was a new function on every render, so every date field rendered
 *   again on each change, a blur included. The rule costs no render now: each field renders as often as
 *   it does without it, and an edit or a blur renders the one field it touched (`transforms.ts`);
 * - final-form validates every field on a change, and the rule merged every form's rows for each field
 *   it checked, computing each form's whole state to read them. The form being edited is read from the
 *   values final-form hands the validator now, and a merge is kept until a form's rows change
 *   (`formData.ts`). An edit computed the edited form's state once per date field; the rule computes
 *   it for none now.
 *
 * Measured in jsdom on React 18 with 200 rows, two runs each: an edit took 958 and 960 ms and takes 117
 * and 114, a blur took 508 and 520 ms and takes 145 and 81. The same table without the rule: 71 to 82
 * ms an edit, 75 to 84 a blur. A number here that falls is progress: lower it. One that rises is a
 * regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'
import { meta as periodMeta } from '../../demo/examples/data_component'
import { cloneDeep } from '../../core/utils'
import { formsStorage } from '../../core/state/formRegistry'
import { phraseMessage } from '../../core/utils/phrases'

/** Every render of `InputDate`, the element of each date field. Not memoised, as `InputDate` is not. */
const mockRenders = { count: 0 }
jest.mock('../../core/components/InputDate', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/InputDate')
    const Counted = props => {
        mockRenders.count += 1
        return React.createElement(actual.default, props)
    }
    return { __esModule: true, ...actual, default: Counted }
})

/**
 * How often each final-form instance computes its whole state. Counted where the instance is made, so
 * every `{...form, reset}` react-final-form hands over shares the counting `getState`.
 */
const mockStateReads = new Map()
jest.mock('final-form', () => {
    const actual = jest.requireActual('final-form')
    return {
        __esModule: true,
        ...actual,
        createForm: config => {
            const form = actual.createForm(config)
            const getState = form.getState
            form.getState = function () {
                mockStateReads.set(form.getState, (mockStateReads.get(form.getState) || 0) + 1)
                return getState.apply(this, arguments)
            }
            return form
        },
    }
})

const ROWS = 50
const data = { dataKind: { period: Array.from({ length: ROWS }, (_, i) => ({ startDate: `${2000 + i}-01-01`, endDate: `${2000 + i}-06-30` })) } }
const OVERLAP = phraseMessage('PERIODS_CANNOT_OVERLAP')

/** The example's meta without its `verify`: the same table, with no rule to cost anything. */
function withoutRule (node) {
    if (Array.isArray(node)) return node.map(withoutRule)
    if (node === null || typeof node !== 'object') return node
    const { verify, ...rest } = node
    return Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, withoutRule(value)]))
}

/** Mounts the table, and returns the form holding its rows, with the renders and reads it took. */
function mountTable (meta = periodMeta) {
    mockRenders.count = 0
    const view = render(<UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)} />)
    act(() => { jest.runOnlyPendingTimers() })
    // The table's form, not the extra row's: that one holds no rows.
    const form = [...formsStorage.values()].map(entry => entry.form)
        .find(candidate => (candidate.getState().values.dataKind?.period || []).length === ROWS)
    return { ...view, form, atMount: mockRenders.count }
}

/** What an action costs: the date fields it renders, and how often it computes `form`'s whole state. */
function cost (form, action) {
    mockRenders.count = 0
    const reads = mockStateReads.get(form.getState) || 0
    act(action)
    act(() => { jest.runOnlyPendingTimers() })
    return { renders: mockRenders.count, stateReads: (mockStateReads.get(form.getState) || 0) - reads }
}

const edit = (form, value) => () => { form.change('dataKind.period[1].startDate', value) }
const errorsOf = form => [0, 1, 2].map(i => ['startDate', 'endDate'].map(name =>
    form.getFieldState(`dataKind.period[${i}].${name}`).error || null))

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('a 50-row period table checked by notWithinRange', () => {
    it('renders as often as the same table without the rule, and an edit or a blur renders one field', () => {
        const { atMount: withoutIt, unmount } = mountTable(withoutRule(periodMeta))
        unmount()

        const { form, atMount } = mountTable()
        const onEdit = cost(form, edit(form, '2001-02-01')).renders
        const field = document.querySelector('input[name="dataKind.period[1].startDate"]')
        const onBlur = cost(form, () => { fireEvent.focus(field); fireEvent.blur(field) }).renders
        // All three at once, so a failure shows all three. Before 2026-10-12 they read 306, 102 and 102.
        expect({ atMount, onEdit, onBlur }).toEqual({ atMount: withoutIt, onEdit: 1, onBlur: 1 })
    })

    it('finds an overlap and its end, computing the edited form\'s state for none of its fields', () => {
        const { form } = mountTable()
        expect(errorsOf(form)).toEqual([[null, null], [null, null], [null, null]])

        // Row 1 now starts inside row 0, so each of the two overlaps the other.
        const overlapping = cost(form, edit(form, '2000-03-01'))
        expect(errorsOf(form)).toEqual([[OVERLAP, OVERLAP], [OVERLAP, OVERLAP], [null, null]])

        const apart = cost(form, edit(form, '2001-01-01'))
        expect(errorsOf(form)).toEqual([[null, null], [null, null], [null, null]])
        // 100 and 101 before 2026-10-12: once per date field. The one read left is the document's own,
        // not the rule's: with no error left, its render works out whether it can save (`canSave`).
        expect([overlapping.stateReads, apart.stateReads]).toEqual([0, 1])
    })
})
