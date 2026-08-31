import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
// Force form module to fully load before TableView pulls react-final-form-arrays through the cycle
import '../../../../modules/form/utils'
import TableView from '../TableView'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <Form
            onSubmit={() => {}}
            mutators={{ ...arrayMutators }}
            initialValues={{}}
            render={() => ui}
        />
    </ConfigContext.Provider>
)

const defaults = {
    additionalCellsStyles: [],
    translate: (v) => v,
}

const items = [
    { id: 1, name: 'Alpha', amount: 10 },
    { id: 2, name: 'Beta', amount: 20 },
]

const headers = [
    { id: 'name', label: 'Name' },
    { id: 'amount', label: 'Amount' },
]

describe('TableView', () => {
    it('renders a <table> with headers and rows', () => {
        const { container } = render(wrap(<TableView items={items} headers={headers} {...defaults} />))
        expect(container.querySelector('table')).toBeInTheDocument()
        expect(container.textContent).toContain('Name')
        expect(container.textContent).toContain('Alpha')
        expect(container.textContent).toContain('Beta')
    })

    // Semantic's Table spreads what it does not recognise onto <table>, where `name` is not a
    // valid attribute — 23 occurrences in the DOM baseline. `this.props.name` still decides
    // whether rows are wrapped in a FieldArray, so the strip is at the DOM edge only.
    it('keeps engine props and `name` off the <table> while still binding the FieldArray', () => {
        const { container } = render(wrap(
            <TableView
                items={items}
                headers={headers}
                name="orders"
                view="Table"
                index="1"
                symbol="$"
                _comment="a note to the next meta author"
                {...defaults}
            />
        ))

        const table = container.querySelector('table')
        expect(table.getAttributeNames().sort()).toEqual(['class'])
        // A FieldArray renders its children only once it has registered against the form, so
        // visible row content is the proof that `this.props.name` still reached it.
        expect(container.textContent).toContain('Alpha')
    })

    it('renders no rows when items is empty', () => {
        const { container } = render(wrap(<TableView items={[]} headers={headers} {...defaults} />))
        expect(container.querySelectorAll('tbody tr').length).toBe(0)
    })

    it('renders extraHeaders above the regular headers', () => {
        const extraHeaders = [[{ label: 'Group A', colSpan: 2 }]]
        const { container } = render(
            wrap(<TableView items={items} headers={headers} extraHeaders={extraHeaders} {...defaults} />)
        )
        expect(container.textContent).toContain('Group A')
    })

    it('renders sort icons when sorts are configured', () => {
        const onSort = jest.fn()
        const sorts = [{ id: 'name', order: 1 }]
        const { container } = render(
            wrap(<TableView items={items} headers={headers} sorts={sorts} onSort={onSort} {...defaults} />)
        )
        expect(container.querySelector('.app__sort__icon')).toBeInTheDocument()
    })

    it('uses headers derived from items when not provided', () => {
        const { container } = render(wrap(<TableView items={items} {...defaults} />))
        expect(container.textContent).toContain('name')
        expect(container.textContent).toContain('amount')
    })

    it('renders pagination when usePagination=true and items exceed rowsPerPage', () => {
        const manyItems = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }))
        const { container } = render(
            wrap(
                <TableView
                    items={manyItems}
                    headers={[{ id: 'name' }]}
                    usePagination
                    rowsPerPage={10}
                    {...defaults}
                />
            )
        )
        expect(container.querySelector('.app__pagination')).toBeInTheDocument()
    })

    it('renders a custom renderCell for a header', () => {
        const headersWithRender = [{ id: 'name', renderCell: (v) => `[${v}]` }]
        const { container } = render(
            wrap(<TableView items={items} headers={headersWithRender} {...defaults} />)
        )
        expect(container.textContent).toContain('[Alpha]')
    })

    it('respects showEmptyAs when a cell value is falsey', () => {
        const sparseItems = [{ id: 1, name: 'X', amount: 0 }, { id: 2, name: 'Y' }]
        const { container } = render(
            wrap(<TableView items={sparseItems} headers={headers} showEmptyAs="-" {...defaults} />)
        )
        expect(container.textContent).toContain('-')
    })

    it('renders vertical layout (rows as columns)', () => {
        const { container } = render(
            wrap(<TableView items={items} headers={headers} vertical {...defaults} />)
        )
        expect(container.querySelector('table')).toBeInTheDocument()
    })

    it('applies itemClassNames based on matching values', () => {
        const itemClassNames = [{ id: 'amount', values: { 10: 'red-row', 20: 'green-row' } }]
        const { container } = render(
            wrap(<TableView items={items} headers={headers} itemClassNames={itemClassNames} {...defaults} />)
        )
        expect(container.querySelector('.red-row')).toBeInTheDocument()
        expect(container.querySelector('.green-row')).toBeInTheDocument()
    })

    it('does NOT render renderItem expansion rows by default', () => {
        const renderItem = (item) => <span data-testid="expanded">{`exp:${item.name}`}</span>
        const { container } = render(
            wrap(<TableView items={items} headers={headers} renderItem={renderItem} {...defaults} />)
        )
        expect(container.querySelectorAll('[data-testid="expanded"]').length).toBe(0)
    })

    it('renders renderItem rows when itemsExpanded=true', () => {
        const renderItem = (item) => <span data-testid="expanded">{`exp:${item.name}`}</span>
        const { container } = render(
            wrap(
                <TableView
                    items={items}
                    headers={headers}
                    renderItem={renderItem}
                    itemsExpanded
                    {...defaults}
                />
            )
        )
        expect(container.querySelectorAll('[data-testid="expanded"]').length).toBe(2)
    })

    it('uses renderItemCells when provided', () => {
        const renderItemCells = (item, i) => (
            <td key={i} data-testid={`custom-${i}`}>custom:{item.name}</td>
        )
        const { container } = render(
            wrap(
                <TableView
                    items={items}
                    headers={headers}
                    renderItemCells={renderItemCells}
                    {...defaults}
                />
            )
        )
        expect(container.querySelector('[data-testid="custom-0"]')).toBeInTheDocument()
        expect(container.textContent).toContain('custom:Alpha')
    })

    it('sorts items by header when sorts is set', () => {
        const { container } = render(
            wrap(
                <TableView
                    items={[{ name: 'B' }, { name: 'A' }, { name: 'C' }]}
                    headers={[{ id: 'name' }]}
                    sorts={[{ id: 'name', order: 1 }]}
                    {...defaults}
                />
            )
        )
        const cells = container.querySelectorAll('tbody tr td')
        const texts = Array.from(cells).map(c => c.textContent)
        expect(texts[0]).toContain('A')
        expect(texts[1]).toContain('B')
        expect(texts[2]).toContain('C')
    })

    it('clicking a sortable header cycles the sort order', () => {
        const onSort = jest.fn()
        const { container } = render(
            wrap(
                <TableView
                    items={items}
                    headers={[{ id: 'name', label: 'Name' }]}
                    sorts={[{ id: 'name', order: 1 }]}
                    onSort={onSort}
                    {...defaults}
                />
            )
        )
        // Sortable row uses class `sort` together with header layout classes
        const sortable = container.querySelector('.sort')
        expect(sortable).toBeInTheDocument()
        fireEvent.click(sortable)
        expect(onSort).toHaveBeenCalled()
    })

    it('renders renderHeader function when provided', () => {
        const headers = [{
            id: 'name',
            label: 'Name',
            renderHeader: () => <span data-testid="custom-header">CUSTOM</span>,
        }]
        const { container } = render(
            wrap(<TableView items={items} headers={headers} {...defaults} />)
        )
        expect(container.querySelector('[data-testid="custom-header"]')).toBeInTheDocument()
    })

    it('renders nothing for items that do not have id field in header', () => {
        // Section divider: header with no id renders empty cell
        const headers = [{ label: 'Group' }, { id: 'name' }]
        const { container } = render(
            wrap(<TableView items={items} headers={headers} {...defaults} />)
        )
        expect(container.querySelector('table')).toBeInTheDocument()
    })

    it('uses translate function for header label', () => {
        const translate = (v) => `tr:${v}`
        const { container } = render(
            wrap(
                <TableView
                    items={items}
                    headers={[{ id: 'name', label: 'Name' }]}
                    {...defaults}
                    translate={translate}
                />
            )
        )
        expect(container.textContent).toContain('tr:Name')
    })

    it('toggles row expansion via handleItemExpand handler', () => {
        const renderItem = (item) => <span data-testid="exp">exp:{item.name}</span>
        const itemsWithId = [{ name: 'Alpha' }, { name: 'Beta' }]
        const headers = [{
            id: 'name',
            renderCell: (val, idx, props, self) => (
                <button
                    data-testid={`expand-${idx}`}
                    onClick={() => self.handleItemExpand({ index: idx, expanded: true })}
                >
                    {val}
                </button>
            ),
        }]
        const { container } = render(
            wrap(<TableView items={itemsWithId} headers={headers} renderItem={renderItem} {...defaults} />)
        )
        // Initially no expanded children
        expect(container.querySelectorAll('[data-testid="exp"]').length).toBe(0)
        fireEvent.click(container.querySelector('[data-testid="expand-0"]'))
        expect(container.querySelectorAll('[data-testid="exp"]').length).toBe(1)
    })

    it('paginates and updates active page', () => {
        const items = Array.from({ length: 30 }, (_, i) => ({ name: `R${i}` }))
        const { container } = render(
            wrap(
                <TableView
                    items={items}
                    headers={[{ id: 'name' }]}
                    usePagination
                    rowsPerPage={10}
                    {...defaults}
                />
            )
        )
        expect(container.querySelectorAll('tbody tr').length).toBe(10)
    })
})

/**
 * The sticky-column class builder, tested directly because the 38 demo examples do not
 * exercise it at all: the DOM baseline contains zero `sticky` classes, so the corpus could
 * neither catch the bug this fixes nor prove the fix keeps the feature working.
 *
 * `sticky` marks a pinned cell; `sticky-last` marks the final cell of a pinned run, which is
 * what `table.less` draws the separator on (`td.sticky-last::after`). `-last` used to be
 * appended to EVERY cell whose right-hand neighbour is not pinned, producing the junk classes
 * `undefined-last` (no className) and `-last` (empty className) — 210 of them in the baseline.
 */
describe('TableView sticky cell class', () => {
    // The method is an instance arrow property, so read it off a rendered instance rather than
    // the prototype.
    const build = (() => {
        let fn
        return (...args) => {
            if (!fn) {
                let instance
                render(<TableView ref={ref => { instance = ref || instance }} headers={[]} items={[]} />)
                fn = instance.getStickyCellClassName
            }
            return fn(...args)
        }
    })()

    const STICKY = { position: 'sticky' }
    const STATIC = {}

    it('leaves a non-pinned cell alone, whatever its className', () => {
        // The bug: each of these used to come back with `-last` glued on.
        expect(build(STATIC, undefined, STATIC)).toBeUndefined()
        expect(build(STATIC, '', STATIC)).toBe('')
        expect(build(STATIC, 'no-border-right', STATIC)).toBe('no-border-right')
        expect(build(STATIC, 'left', STICKY)).toBe('left')
    })

    it('marks a pinned cell, and only ends the run at the last one', () => {
        expect(build(STICKY, undefined, STICKY)).toBe('sticky')
        expect(build(STICKY, undefined, STATIC)).toBe('sticky-last')
        expect(build(STICKY, 'left', STICKY)).toBe('left sticky')
        expect(build(STICKY, 'left', STATIC)).toBe('left sticky-last')
    })

    it('does not re-append sticky to a className that already carries it', () => {
        expect(build(STICKY, 'sticky', STICKY)).toBe('sticky')
        expect(build(STICKY, 'sticky', STATIC)).toBe('sticky-last')
    })
})
