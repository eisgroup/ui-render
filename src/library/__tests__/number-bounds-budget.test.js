/**
 * WHAT ONE EDIT COSTS IN A TABLE OF BOUNDED NUMBER FIELDS, pinned (2026-10-12).
 * =============================================================================================
 *
 * A number field's `min` and `max` wrapped its `validate` in a new function on every render, so every
 * such field rendered again on each change of its document, a blur included. The bounds cost no render
 * now: each field renders as often as it does without them, and an edit or a blur renders the one field
 * it touched (`boundedValidator` in `engine/mapper.tsx`). What they check, and in which order, is the same.
 *
 * Measured in jsdom on React 18 with 200 rows of two bounded fields, two runs each: 1200 renders at
 * mount, 400 for an edit and 400 for a blur, an edit taking 61 and 59 ms and a blur 62 and 67; now 400,
 * 1 and 1, an edit taking 26 and 26 ms and a blur 30 and 30, as the same table without bounds does. A
 * number here that falls is progress: lower it. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every render of `InputNumber`, the element of each number field. Not memoised, as it is not. */
const mockRenders = { count: 0 }
jest.mock('../../core/components/InputNumber', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/InputNumber')
    const Counted = props => {
        mockRenders.count += 1
        return React.createElement(actual.default, props)
    }
    return { __esModule: true, ...actual, default: Counted }
})

const ROWS = 50
const table = withBounds => ({
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', ...withBounds && { min: 0, max: 1000 } } },
        { id: 'price', label: 'Price', renderCell: { view: 'Input', type: 'number', name: 'price', validate: 'required', ...withBounds && { min: 0 } } },
    ],
})
const data = () => ({ rows: Array.from({ length: ROWS }, (_, i) => ({ qty: i, price: i * 2 })) })

/** Mounts the table, and returns its form with the renders the mount took. */
function mountTable (withBounds = true) {
    mockRenders.count = 0
    const view = render(<UIRender meta={table(withBounds)} data={data()} initialValues={data()} />)
    act(() => { jest.runOnlyPendingTimers() })
    const form = [...formsStorage.values()].map(entry => entry.form)
        .find(candidate => (candidate.getState().values.rows || []).length === ROWS)
    return { ...view, form, atMount: mockRenders.count }
}

/** How many number fields an action renders. */
function rendersOf (action) {
    mockRenders.count = 0
    act(action)
    act(() => { jest.runOnlyPendingTimers() })
    return mockRenders.count
}

/** What `name` holds after it is set to `value`. */
function errorFor (form, name, value) {
    act(() => { form.change(name, value) })
    act(() => { jest.runOnlyPendingTimers() })
    return form.getFieldState(name).error || null
}

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('a 50-row table of number fields with min and max', () => {
    it('renders as often as the same table without them, and an edit or a blur renders one field', () => {
        const { atMount: withoutThem, unmount } = mountTable(false)
        unmount()

        const { form, atMount, container } = mountTable()
        const onEdit = rendersOf(() => { form.change('rows[1].qty', 5) })
        const field = container.querySelector('input[name="rows[1].qty"]')
        const onBlur = rendersOf(() => { fireEvent.focus(field); fireEvent.blur(field) })
        // All three at once, so a failure shows all three. Before 2026-10-12 they read 300, 100 and 100.
        expect({ atMount, onEdit, onBlur }).toEqual({ atMount: withoutThem, onEdit: 1, onBlur: 1 })
    })

    it('checks the bounds first, then the field\'s own rule, with the same messages', () => {
        const { form } = mountTable()
        expect([
            errorFor(form, 'rows[2].qty', 5000),
            errorFor(form, 'rows[2].qty', -1),
            errorFor(form, 'rows[2].qty', 10),
            errorFor(form, 'rows[2].price', -1),
            errorFor(form, 'rows[2].price', ''),
            errorFor(form, 'rows[2].price', 5),
        ]).toEqual(['Must be maximum 1000', 'Must be minimum 0', null, 'Must be minimum 0', 'Required', null])
    })
})
