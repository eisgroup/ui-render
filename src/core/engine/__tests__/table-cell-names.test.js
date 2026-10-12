/**
 * A FIELD IN A TABLE CELL IS NAMED BY ITS COLUMN'S HEADER, when it names nothing itself (2026-10-09).
 * =============================================================================================
 *
 * A field in a cell rarely has a `label`: the header above it says what it is. A screen reader names a field by
 * its label, `aria-label` or `aria-labelledby`, and the header is none of these, so such a field had no name at all:
 * 46 of the 60 nameless controls the demo examples rendered. It takes the header's label as its `aria-label` now, by
 * whichever way the row is drawn: a header's `renderCell`, a `TableCells` row, or the draft row a `localDraft`
 * `Data` adds. A field that names itself keeps its name, and a cell that is not a field takes nothing.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../../../library/main'
import LocalDraftTableRow from '../components/LocalDraftTableRow'
import { TableColumnsContext } from '../../contexts'

const mount = (meta, data) => render(<UIRender meta={meta} data={data} initialValues={data} />)

describe('a field in a table cell', () => {
    it('is named by its column through `renderCell`, unless it names itself or is not a field', () => {
        mount({
            view: 'Table',
            name: 'rows',
            headers: [
                { id: 'qty', label: 'Quantity', renderCell: { view: 'Input', name: 'qty' } },
                { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note', 'aria-label': 'Its own' } },
                { id: 'go', label: 'Action', renderCell: { view: 'Button', children: 'Run' } },
            ],
        }, { rows: [{ qty: '1', note: 'x' }] })

        expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('aria-label', 'Quantity')
        expect(screen.getByRole('textbox', { name: 'Its own' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Run' })).not.toHaveAttribute('aria-label')
    })

    it('is named by its column in a `TableCells` row with a cell per header', () => {
        mount({
            view: 'Table',
            name: 'rows',
            headers: [{ id: 'qty', label: 'Quantity' }, { id: 'note', label: 'Note' }],
            renderItemCells: { view: 'TableCells', items: [{ view: 'Input', name: 'qty' }, { view: 'Input', name: 'note' }] },
        }, { rows: [{ qty: '1', note: 'x' }] })

        expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Note' })).toBeInTheDocument()
    })

    it('is renamed in a `TableCells` row when its column\'s header changes', () => {
        const meta = label => ({
            view: 'Table',
            name: 'rows',
            headers: [{ id: 'qty', label }],
            renderItemCells: { view: 'TableCells', items: [{ view: 'Input', name: 'qty' }] },
        })
        const data = { rows: [{ qty: '1' }] }
        const { rerender } = render(<UIRender meta={meta('Quantity')} data={data} initialValues={data} />)
        expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeInTheDocument()

        rerender(<UIRender meta={meta('Amount')} data={data} initialValues={data} />)
        expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument()
    })

    it('is not named in a `TableCells` row whose cells do not line up with the headers', () => {
        mount({
            view: 'Table',
            name: 'rows',
            headers: [{ id: 'qty', label: 'Quantity' }, { id: 'note', label: 'Note' }, { id: 'extra', label: 'Extra' }],
            renderItemCells: { view: 'TableCells', items: [{ view: 'Input', name: 'qty' }, { view: 'Input', name: 'note' }] },
        }, { rows: [{ qty: '1', note: 'x' }] })

        expect(screen.getAllByRole('textbox').map(box => box.getAttribute('aria-label'))).toEqual([null, null])
    })

    it('is named by its column in a draft row, the cells of a column layout included', () => {
        const meta = {
            items: [
                { view: 'Input', name: 'qty' },
                { view: 'VerticalLayout', items: [{ view: 'Input', name: 'note' }] },
                { view: 'Input', name: 'when', type: 'date', label: 'Its own' },
                { view: 'Button', onClick: 'addData', children: 'Add' },
            ],
        }
        render(
            <TableColumnsContext.Provider value={['Quantity', 'Note', 'When', undefined]}>
                <table><tbody><tr><LocalDraftTableRow meta={meta} /></tr></tbody></table>
            </TableColumnsContext.Provider>
        )

        expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Note' })).toBeInTheDocument()
        expect(screen.getByLabelText('Its own')).not.toHaveAttribute('aria-label')
        expect(screen.getByRole('button', { name: 'Add' })).not.toHaveAttribute('aria-label')
    })

    it('is not named in a draft row outside a table, or with a cell more than the headers', () => {
        const meta = { items: [{ view: 'Input', name: 'qty' }, { view: 'Input', name: 'note' }] }
        const { unmount } = render(<table><tbody><tr><LocalDraftTableRow meta={meta} /></tr></tbody></table>)
        expect(screen.getAllByRole('textbox').map(box => box.getAttribute('aria-label'))).toEqual([null, null])
        unmount()

        render(
            <TableColumnsContext.Provider value={['Quantity']}>
                <table><tbody><tr><LocalDraftTableRow meta={meta} /></tr></tbody></table>
            </TableColumnsContext.Provider>
        )
        expect(screen.getAllByRole('textbox').map(box => box.getAttribute('aria-label'))).toEqual([null, null])
    })
})
