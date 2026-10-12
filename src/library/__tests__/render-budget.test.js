/**
 * WHAT ONE EDIT COSTS IN A 50-ROW TABLE, pinned (2026-10-12).
 * =============================================================================================
 *
 * A table of fields is where a render cascade costs most: a change that made every row render again on a keystroke
 * would pass every functional test and make a long table slow to type in. So these pin, through the published entry:
 *
 * - how many fields render: each once at mount, and on a keystroke only the one typed into, because the rows' fields
 *   keep their props and `InputNative` is memoised;
 * - how many commits the document makes and how often it calls `onDataChanged`: none at mount, one for the keystroke,
 *   and one for leaving the field. A form that is not pristine reports every change of its state, `touched`
 *   included, as 0.34.3 did.
 *
 * Measured on React 16.14, 17.0.2, 18.3.1 and 19.3.0. React 18 commits once more at mount than the other three; the
 * cause was not established. A number that falls is progress: lower it here. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../main'

/** Every render of `InputNative`, the element of each text field, counted. */
const mockRenders = { count: 0 }
jest.mock('../../core/components/InputNative', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/InputNative')
    const Counted = React.memo(props => {
        mockRenders.count += 1
        return React.createElement(actual.default, props)
    })
    return { __esModule: true, ...actual, default: Counted }
})

const ROWS = 50
const meta = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'title', label: 'Title', renderCell: { view: 'Input', name: 'title' } },
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
    ],
}
const data = { rows: Array.from({ length: ROWS }, (_, i) => ({ title: `row ${i}`, note: `note ${i}` })) }

const COMMITS_AT_MOUNT = Number(React.version.split('.')[0]) === 18 ? 3 : 2

beforeEach(() => {
    jest.useFakeTimers()
    mockRenders.count = 0
})

afterEach(() => {
    jest.useRealTimers()
})

describe('a 50-row table of fields', () => {
    it('renders each field once at mount, and only the edited one on a keystroke', () => {
        render(<UIRender meta={meta} data={data} initialValues={data} />)
        act(() => { jest.runOnlyPendingTimers() })
        const atMount = mockRenders.count

        mockRenders.count = 0
        act(() => { fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'row 0!' } }) })
        act(() => { jest.runOnlyPendingTimers() })
        // Both at once, so a failure shows both. Without the field decorator's `memo` it reads 300 at mount.
        expect({ atMount, onKeystroke: mockRenders.count }).toEqual({ atMount: ROWS * 2, onKeystroke: 1 })
    })

    it('commits and reports a change as many times as pinned', () => {
        const counts = { commits: 0, changed: 0 }
        render(
            <React.Profiler id="document" onRender={() => { counts.commits += 1 }}>
                <UIRender meta={meta} data={data} initialValues={data} onDataChanged={() => { counts.changed += 1 }} />
            </React.Profiler>
        )
        act(() => { jest.runOnlyPendingTimers() })
        expect(counts).toEqual({ commits: COMMITS_AT_MOUNT, changed: 0 })

        const field = screen.getAllByRole('textbox')[0]
        counts.commits = 0
        act(() => { fireEvent.change(field, { target: { value: 'row 0!' } }) })
        act(() => { jest.runOnlyPendingTimers() })
        expect(counts).toEqual({ commits: 1, changed: 1 })

        counts.commits = 0
        counts.changed = 0
        act(() => { fireEvent.blur(field) })
        act(() => { jest.runOnlyPendingTimers() })
        expect(counts).toEqual({ commits: 1, changed: 1 })
    })
})
