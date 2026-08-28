/**
 * TABLE BEHAVIOURAL CONTRACT ==================================================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (2) — the gate for §9.7-F1 Step 1, the
 * `Table` replacement (native `<table>` elements preserving the subcomponent API).
 *
 * WHAT WAS MISSING
 * -----------------------------------------------------------------------------
 * `Table` is the cheapest F1 step and the least covered behaviourally. What exists
 * today:
 *   - `components/__tests__/Table.test.js` asserts the SUIR element and two CSS
 *     class names — pure markup, and pure layer (1) material;
 *   - `components/__tests__/TableView.test.js` and `TableView.interactions-rendering`
 *     drive the view directly with props and read back through `querySelector` on
 *     class names;
 *   - `mapper.fields-tables-popups` asserts the `headers`/`extraHeaders`/`items`
 *     PROPS the mapper computes, never the table a user ends up looking at.
 *
 * So nothing checks that a meta `Table` produces a real table: header cells that
 * announce as `columnheader` and carry the meta's labels, body cells that announce
 * as `cell` and carry the data in row order, and a pager that actually pages. That
 * is what this file adds, entirely through roles and visible text — no class
 * names, no element shape — so it survives the rewrite that will change both.
 *
 * NOT COVERED, AND WHY
 * -----------------------------------------------------------------------------
 * Sorting and row expansion: no manifest example enables either (measured —
 * clicking a header on `tablePagination` changes nothing, because `sorts`/`onSort`
 * come from meta the corpus does not carry), so there is nothing to drive from the
 * meta contract. They stay covered at the component level by
 * `TableView.interactions-rendering`, which is markup-coupled; giving them a
 * markup-independent gate needs a manifest example first.
 * -----------------------------------------------------------------------------
 */
import { fireEvent, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EXAMPLES } from '../../../../demo/examples/manifest'
import { clearEngineGlobals, mountExample, noop } from '../../../../demo/testing/mountExample'

const example = id => {
    const found = EXAMPLES.find(entry => entry.id === id)
    if (!found) throw new Error(`manifest has no example "${id}"`)
    return found
}

/**
 * The table as assistive technology sees it: one entry per `row`, each split into
 * its `columnheader` and `cell` texts. Nothing else about the markup is read.
 */
const rowsOf = table => within(table).queryAllByRole('row').map(row => ({
    headers: within(row).queryAllByRole('columnheader').map(cell => cell.textContent),
    cells: within(row).queryAllByRole('cell').map(cell => cell.textContent),
}))

const headerRows = table => rowsOf(table).filter(row => row.headers.length).map(row => row.headers)
const bodyRows = table => rowsOf(table).filter(row => row.cells.length).map(row => row.cells)

const pager = () => screen.getByRole('navigation')
const currentPage = () => within(pager()).queryAllByRole('button')
    .filter(button => button.getAttribute('aria-current') === 'page')
    .map(button => button.textContent)

describe('Table behavioural contract', () => {
    let consoleError
    const originalFetch = global.fetch
    const originalScrollIntoView = Element.prototype.scrollIntoView

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
        // jsdom implements no scrollIntoView, and TableView.handlePaginationChange
        // calls it UNGUARDED before it sets the new page — so without this stub the
        // page change is lost rather than merely unscrolled. Stubbed here rather than
        // worked around, because the paging is the contract under test; the missing
        // guard is recorded as a finding with this change.
        Element.prototype.scrollIntoView = function scrollIntoView () {}
    })

    afterEach(() => {
        clearEngineGlobals()
        consoleError.mockRestore()
        Element.prototype.scrollIntoView = originalScrollIntoView
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    describe('headers and cells', () => {
        it('announces the meta header labels as column headers, in meta order', () => {
            mountExample(example('tablePagination'))

            expect(headerRows(screen.getByRole('table'))).toEqual([
                ['#', 'Title', 'Owner', 'Priority', 'Status'],
            ])
        })

        it('fills body cells from the bound data, in data order, one row per record', () => {
            const { data, meta } = example('tablePagination')
            mountExample(example('tablePagination'))

            // Read the expectation out of the example's own data rather than restating
            // it, so the assertion stays true if the fixture grows a row.
            const expected = data.tasks
                .slice(0, meta.rowsPerPage)
                .map(task => meta.headers.map(header => String(task[header.id])))

            expect(bodyRows(screen.getByRole('table'))).toEqual(expected)
        })

        it('puts formatted values, not raw ones, into the cells a render* method owns', () => {
            // `decimal_meta.json` renders through FIELD.RENDER.PERCENT. The formatting
            // is a cell-text contract, and this is the only place the render* pipeline
            // is checked end to end without reading markup.
            mountExample(example('decimal'))

            expect(bodyRows(screen.getByRole('table'))).toEqual([['71.23%'], ['100.00%']])
        })

        it('keeps a grouped matrix table rectangular: every body row matches the last header row', () => {
            // Structure only, no fixture text: the grouped-header contract is that the
            // two banner rows span the leaf columns and every data row has exactly one
            // cell per leaf column. `mapper.fields-tables-popups` pins the props that
            // produce this; this pins that it survives into the rendered table.
            mountExample(example('tableMatrix'))
            const table = screen.getByRole('table')

            const headers = headerRows(table)
            const leafColumns = headers[headers.length - 1].length
            expect(headers.map(row => row.length)).toEqual([2, 3, leafColumns])

            const body = bodyRows(table)
            expect(body.length).toBeGreaterThan(0)
            expect(body.map(row => row.length)).toEqual(body.map(() => leafColumns))
        })

        it('still announces its headers when the bound data holds no usable rows', () => {
            // `invalid-array_data.json` is the degradation case: the table must remain a
            // table with its headers rather than collapsing or disappearing.
            mountExample(example('invalidArray'))
            const tables = screen.getAllByRole('table')

            expect(tables.length).toBeGreaterThan(0)
            for (const table of tables) {
                expect(headerRows(table).length).toBeGreaterThan(0)
                expect(bodyRows(table)).toEqual([])
            }
        })
    })

    describe('pagination', () => {
        const firstColumn = () => bodyRows(screen.getByRole('table')).map(row => row[0])

        it('shows one page of rows and marks the current page for assistive technology', () => {
            mountExample(example('tablePagination'))

            expect(firstColumn()).toEqual(['1', '2', '3', '4', '5'])
            expect(currentPage()).toEqual(['1'])
        })

        it('replaces the visible rows when a page is chosen by name', () => {
            mountExample(example('tablePagination'))

            fireEvent.click(within(pager()).getByRole('button', { name: 'Page 3' }))

            expect(currentPage()).toEqual(['3'])
            expect(firstColumn()).toEqual(['11', '12', '13', '14', '15'])
        })

        it('steps forward and back through the next/previous controls', () => {
            mountExample(example('tablePagination'))

            fireEvent.click(within(pager()).getByRole('button', { name: 'Next page' }))
            expect(currentPage()).toEqual(['2'])
            expect(firstColumn()).toEqual(['6', '7', '8', '9', '10'])

            fireEvent.click(within(pager()).getByRole('button', { name: 'Previous page' }))
            expect(currentPage()).toEqual(['1'])
            expect(firstColumn()).toEqual(['1', '2', '3', '4', '5'])
        })

        it('disables the step control that would leave the page range', () => {
            const { data, meta } = example('tablePagination')
            const lastPage = Math.ceil(data.tasks.length / meta.rowsPerPage)
            mountExample(example('tablePagination'))

            expect(within(pager()).getByRole('button', { name: 'Previous page' })).toBeDisabled()

            fireEvent.click(within(pager()).getByRole('button', { name: `Page ${lastPage}` }))

            expect(currentPage()).toEqual([String(lastPage)])
            expect(within(pager()).getByRole('button', { name: 'Next page' })).toBeDisabled()
            // The last page carries the remainder, not a full page.
            expect(firstColumn().length).toBe(data.tasks.length % meta.rowsPerPage)
        })
    })
})
