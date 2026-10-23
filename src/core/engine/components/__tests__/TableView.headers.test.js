/**
 * WHAT A HEADER SHOWS, AND WHAT A SCREEN READER HEARS (meta contract 2, 2026-10-23).
 * =============================================================================================
 *
 * A header in `headers` or `extraHeaders` shows its `children`, else its `label`. Without either it
 * showed its `id` until contract 2, so a meta that left the label out to mean a blank put a technical
 * name on screen. Now it shows no text, and the `id` is hidden text (`.sr-only`), which names the
 * column, and a sortable column's button, as the visible `id` did. A blank label (`''`) names nothing.
 * Headers a table derives from its first row's keys still show the keys.
 *
 * Visible text is the text outside `.sr-only`: jsdom loads no stylesheet, so the class is what hides it.
 * Accessible names come from Testing Library's computation, which reads the hidden text, as Chromium
 * was measured to.
 */
import React from 'react'
import { fireEvent, render, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
// Force form module to fully load before TableView pulls react-final-form-arrays through the cycle
import '../../../modules/form/utils'
import { Active } from '../../../utils'
import TableView from '../TableView'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <Form onSubmit={() => {}} mutators={{ ...arrayMutators }} initialValues={{}} render={() => ui}/>
    </ConfigContext.Provider>
)

const defaults = {
    additionalCellsStyles: [],
    translate: value => value,
}

const items = [{ name: 'Alpha', note: 'first' }, { name: 'Beta', note: 'second' }]

const hiddenText = cell => Array.from(cell.querySelectorAll('.sr-only'), hidden => hidden.textContent).join('')
const visibleText = (cell) => {
    const copy = cell.cloneNode(true)
    copy.querySelectorAll('.sr-only').forEach(hidden => hidden.remove())
    return copy.textContent
}
const headerCells = container => Array.from(container.querySelectorAll('thead th'))

describe('a header without a label', () => {
    it.each([
        ['missing', { id: 'note' }],
        ['null', { id: 'note', label: null }],
    ])('shows no text when its label is %s, and keeps its id for a screen reader', (_, header) => {
        const { container, getByRole } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, header]} {...defaults}/>
        ))
        const [, cell] = headerCells(container)

        expect(visibleText(cell)).toBe('')
        expect(hiddenText(cell)).toBe('note')
        expect(getByRole('columnheader', { name: 'note' })).toBe(cell)
    })

    it('shows nothing and names nothing when its label is blank, as an action column declares', () => {
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, { id: 'note', label: '' }]} {...defaults}/>
        ))
        const [, cell] = headerCells(container)

        expect(cell.textContent).toBe('')
        expect(cell.querySelector('.sr-only')).toBeNull()
    })

    it('shows a label 0, which the contract allows as a number', () => {
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 0 }]} {...defaults}/>
        ))
        const [cell] = headerCells(container)

        expect(visibleText(cell)).toBe('0')
        expect(hiddenText(cell)).toBe('')
    })

    it('shows nothing and names nothing without an id either', () => {
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, {}]} {...defaults}/>
        ))
        const [, cell] = headerCells(container)

        expect(cell.textContent).toBe('')
        expect(cell.querySelector('.sr-only')).toBeNull()
    })

    // `table.less` gives the empty text a line, so a row of such headers keeps its height: measured in Chromium,
    // 36 px, where the hidden text inside the empty text left the row at 17. The rule selects this exact shape.
    it('puts the hidden id before its empty text, where the stylesheet gives that text a line', () => {
        const { container } = render(wrap(<TableView items={items} headers={[{ id: 'note' }]} {...defaults}/>))
        const [cell] = headerCells(container)

        expect(cell.querySelector('th > *:only-child > .sr-only:first-child + *:last-child:empty')).not.toBeNull()
    })

    describe('in a sortable column', () => {
        const sortable = header => (
            <TableView items={items} headers={[header]} sorts={[{ id: 'note' }]} {...defaults}/>
        )

        it('names the sort button by its id, and the button still sorts', () => {
            const { container, getByRole } = render(wrap(sortable({ id: 'note' })))
            const [cell] = headerCells(container)

            const button = getByRole('button', { name: 'note' })
            expect(visibleText(cell)).toBe('')
            fireEvent.click(button)
            expect(cell).toHaveAttribute('aria-sort', 'descending')
        })

        it('leaves the button unnamed for a blank label', () => {
            const { getByRole } = render(wrap(sortable({ id: 'note', label: '' })))

            expect(getByRole('button')).toHaveAccessibleName('')
        })
    })

    it('shows no text in the vertical layout, where headers head rows', () => {
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, { id: 'note' }]} vertical {...defaults}/>
        ))
        const rowHeaders = Array.from(container.querySelectorAll('tbody th'))

        expect(rowHeaders.map(visibleText)).toEqual(['Name', ''])
        expect(rowHeaders.map(hiddenText)).toEqual(['', 'note'])
    })

    it('shows no text in `extraHeaders`', () => {
        const extraHeaders = [[{ id: 'group', colSpan: 1 }, { label: 'Notes' }]]
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, { id: 'note', label: 'Note' }]}
                       extraHeaders={extraHeaders} {...defaults}/>
        ))
        const extraRow = Array.from(container.querySelectorAll('thead tr')[0].children)

        expect(extraRow.map(visibleText)).toEqual(['', 'Notes'])
        expect(extraRow.map(hiddenText)).toEqual(['group', ''])
    })
})

describe('what still shows', () => {
    it('shows `children` and what `renderHeader` renders, with no hidden id', () => {
        const headers = [
            { id: 'name', children: 'Given' },
            { id: 'note', children: <em>Element</em> },
            { id: 'extra', renderHeader: () => <b>Rendered</b> },
        ]
        const { container } = render(wrap(<TableView items={items} headers={headers} {...defaults}/>))
        const cells = headerCells(container)

        expect(cells.map(visibleText)).toEqual(['Given', 'Element', 'Rendered'])
        expect(cells.map(hiddenText)).toEqual(['', '', ''])
    })

    it('shows the keys of the first row in the headers a table derives from it', () => {
        const { container } = render(wrap(<TableView items={items} {...defaults}/>))
        const cells = headerCells(container)

        expect(cells.map(visibleText)).toEqual(['name', 'note'])
        expect(cells.map(hiddenText)).toEqual(['', ''])
    })

    it('shows the derived keys in the vertical layout too', () => {
        const { container } = render(wrap(<TableView items={items} vertical {...defaults}/>))

        expect(Array.from(container.querySelectorAll('tbody th'), visibleText)).toEqual(['name', 'note'])
    })
})

describe('header text is translated once, by the translator the table is given', () => {
    const translate = value => `T(${value})`
    let globalTranslate
    beforeEach(() => {
        // What `Text` translates with when it is given no translator: the last document constructed's.
        globalTranslate = Active.translate
        Active.translate = value => `G(${value})`
    })
    afterEach(() => {
        Active.translate = globalTranslate
    })

    it('translates a label, string `children` and a hidden id once each', () => {
        const headers = [{ id: 'name', label: 'Label' }, { id: 'note', children: 'Given' }, { id: 'hidden' }]
        const { container } = render(wrap(<TableView items={items} headers={headers} {...defaults} translate={translate}/>))
        const cells = headerCells(container)

        expect(cells.map(visibleText)).toEqual(['T(Label)', 'T(Given)', ''])
        expect(cells.map(hiddenText)).toEqual(['', '', 'T(hidden)'])
    })

    it('translates the keys of derived headers once', () => {
        const { container } = render(wrap(<TableView items={items} {...defaults} translate={translate}/>))

        expect(headerCells(container).map(visibleText)).toEqual(['T(name)', 'T(note)'])
    })

    it('translates the rows of `extraHeaders` and of the vertical layout the same way', () => {
        const extraHeaders = [[{ label: 'Group', colSpan: 2 }]]
        const { container } = render(wrap(
            <TableView items={items} headers={[{ id: 'name', label: 'Name' }, { id: 'note' }]} extraHeaders={extraHeaders}
                       vertical {...defaults} translate={translate}/>
        ))

        expect(within(container.querySelector('thead')).getByRole('columnheader')).toHaveTextContent(/^T\(Group\)$/)
        const rowHeaders = Array.from(container.querySelectorAll('tbody th'))
        expect(rowHeaders.map(visibleText)).toEqual(['T(Name)', ''])
        expect(rowHeaders.map(hiddenText)).toEqual(['', 'T(note)'])
    })
})
