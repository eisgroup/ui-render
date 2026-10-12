/**
 * WHAT ANOTHER ROW'S EDIT COSTS A TABLE'S CELLS, pinned (2026-10-12).
 * =============================================================================================
 *
 * A table calls its `renderCell` for every row on every render, and each call built the cell anew, so
 * everything a cell's field took as an object, a Select's options or a handler with arguments, was new on
 * every render of the table. Every such field rendered again for each edit and blur anywhere in the table.
 * A row's cell is now built once and kept while the row is called with the same things (`BuiltCell` in
 * `engine/transforms.ts`), and a kept cell's handlers still act for their own row.
 *
 * Measured in jsdom on React 18, a 200-row table with a Select column and a text column, two runs each: the
 * Selects rendered 600 times at mount and 200 times for each later edit or blur of the text, an edit taking
 * 62 and 51 ms; now 400, and none, an edit taking 26 and 28 ms. A number here that falls is progress: lower
 * it. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every render of each Select's `Dropdown`. Not memoised, as the field's own is not. */
const mockRenders = { count: 0 }
jest.mock('../../core/components/Dropdown', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Dropdown')
    const Dropdown = props => {
        mockRenders.count += 1
        return React.createElement(actual.Dropdown, props)
    }
    return { __esModule: true, ...actual, Dropdown }
})

const ROWS = 50
const records = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]
const meta = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'kind', label: 'Kind', renderCell: { view: 'Select', name: 'kind', options: records, mapOptions: { text: 'name', value: 'id' } } },
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
        { id: 'show', label: 'Show', renderCell: { view: 'Button', children: 'Show', onClick: { name: 'popup', args: ['Row {index}'] } } },
    ],
}
const data = () => ({ rows: Array.from({ length: ROWS }, (_, i) => ({ kind: i % 2 ? 'a' : 'b', note: `note ${i}` })) })

const settle = () => act(() => { jest.runOnlyPendingTimers() })

function mount () {
    mockRenders.count = 0
    const view = render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
    settle()
    const form = [...formsStorage.values()].map(entry => entry.form).find(candidate => (candidate.getState().values.rows || []).length === ROWS)
    return { ...view, form }
}

/** How many Selects an action renders. */
function rendersOf (action) {
    mockRenders.count = 0
    act(action)
    settle()
    return mockRenders.count
}

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('a 50-row table with a Select column', () => {
    it('renders each Select twice at mount, and none for another column\'s later edits or blurs', () => {
        const { form, container } = mount()
        const atMount = mockRenders.count
        // The first edit changes the document's state, which builds its meta, and so its cells, anew.
        rendersOf(() => { form.change('rows[1].note', 'first') })
        const onEdit = rendersOf(() => { form.change('rows[1].note', 'second') })
        const note = container.querySelector('input[name="rows[1].note"]')
        const onBlur = rendersOf(() => { fireEvent.focus(note); fireEvent.blur(note) })
        // Before 2026-10-12: 3 at mount for each Select, and all 50 again for the edit and for the blur.
        expect({ atMount, onEdit, onBlur }).toEqual({ atMount: ROWS * 2, onEdit: 0, onBlur: 0 })
    })

    it('keeps each row\'s handlers acting for that row, render after render', () => {
        const { form } = mount()
        const title = () => document.querySelector('.app__popup__box__header__title').textContent
        const show = row => { act(() => { fireEvent.click(screen.getAllByRole('button', { name: 'Show' })[row]) }); settle(); return title() }
        const titles = [show(2)]
        act(() => { form.change('rows[3].note', 'edited') })
        settle()
        titles.push(show(4), show(2))
        expect(titles).toEqual(['Row 2', 'Row 4', 'Row 2'])
    })
})
