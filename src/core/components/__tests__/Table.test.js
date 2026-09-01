/**
 * THE IN-HOUSE TABLE FAMILY (UPGRADE-PLAN §9.7-F1 step 1)
 * =============================================================================
 * `Table.js` used to be a 24-line wrapper around `semantic-ui-react`, thin enough that three
 * smoke assertions were a fair trade. It is now the implementation, so what used to be
 * Semantic's contract is ours and has to be pinned here:
 *
 *   1. the root keeps emitting `ui` AND `table`. `src/style/components/table.less` hangs every
 *      cell's padding off `.ui.table`, so this is the single highest-consequence assertion in
 *      the file — dropping either token silently un-pads every table in the product, and no
 *      snapshot would look obviously wrong.
 *   2. the class ORDER: `ui <modifiers> table <className>`. Not cosmetic — it is what keeps the
 *      38-example DOM baseline byte-identical on every `<table>` element.
 *   3. each of the six subcomponents renders its own native element, wherever it sits. A `th`
 *      inside a `tbody` is how `table.no-header.vertical` renders, and the behaviour contract's
 *      role census counts those as `columnheader`.
 *   4. an absent `className` emits NO attribute. Semantic printed `class=""` from its own
 *      `cx()`; 317 of those in the baseline were its, and they go away here.
 *   5. the DOM boundary. `mapper.js` spreads a meta node's whole rest bag onto `Table.Cell`, so
 *      the cell is where `ENGINE_PROPS`/`FIELD_ONLY_PROPS` earn their keep. The corpus tripwires
 *      hold these at zero only because no example happens to use them — this is the direct test.
 *   6. `style`/`colSpan`/`scope` still reach the element. They always did (Semantic did not
 *      handle them either), and losing them would be invisible until a real table looked wrong.
 *
 * @Note: plain functions, never `jest.fn()` — `isFunction()` from core utils rejects cross-realm
 *  functions, and `translate` is exercised through the boundary here.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Table from '../Table'
import { ENGINE_PROPS, FIELD_ONLY_PROPS } from '../domProps'

/** Renders `children` inside a real table, for the parts that need a legal parent. */
const inTable = (children) => render(<table><tbody>{children}</tbody></table>)

/** Every prop the DOM boundary exists to stop, as one bag. */
const noop = () => {}
const ENGINE_BAG = {
    view: 'TableCells',
    index: 3,
    data: { a: 1 },
    _data: { b: 2 },
    symbol: '$',
    _comment: 'author note',
    expanded: true,
    translate: noop,
    onDataChanged: noop,
    currencyCode: 'USD',
    name: 'path[0].field',
    label: 'Visible label',
}

describe('Table', () => {
    describe('root element', () => {
        it('renders a native <table> that always carries `ui` and `table`', () => {
            // `.ui.table td > :not(.button)` is the ONLY selector giving cells their padding.
            const { container } = render(<Table/>)
            const table = container.querySelector('table')
            expect(table).toBeInTheDocument()
            expect(table).toHaveClass('ui', 'table')
            expect(table.getAttribute('class')).toBe('ui table')
        })

        it('appends `className` last, after `table`', () => {
            const { container } = render(<Table className="full-width vertical"/>)
            expect(container.querySelector('table').getAttribute('class'))
                .toBe('ui table full-width vertical')
        })

        it('emits the modifiers between `ui` and `table`, in Semantic\'s order', () => {
            // `table:not(.as-layout).inverted` and `table.striped tr:nth-child(2n)` are both real
            // rules in table.less, reached from ErrorTable — these two tokens are not decoration.
            const { container } = render(<Table inverted striped className="margin"/>)
            expect(container.querySelector('table').getAttribute('class'))
                .toBe('ui inverted striped table margin')
        })

        it('omits a falsy modifier rather than emitting the token', () => {
            const { container } = render(<Table inverted={false} striped={undefined}/>)
            expect(container.querySelector('table').getAttribute('class')).toBe('ui table')
        })

        it('passes unrecognised attributes through to the <table>', () => {
            const { container } = render(<Table id="t1" style={{ width: '50%' }} data-kind="grid"/>)
            const table = container.querySelector('table')
            expect(table).toHaveAttribute('id', 't1')
            expect(table).toHaveAttribute('data-kind', 'grid')
            expect(table.style.width).toBe('50%')
        })

        it('strips the engine and field-only props at the <table> boundary', () => {
            const { container } = render(<Table {...ENGINE_BAG}/>)
            const table = container.querySelector('table')
            expect(table.getAttributeNames().sort()).toEqual(['class'])
        })
    })

    describe('subcomponents', () => {
        // The element per subcomponent IS the contract: the role census in
        // examples.behavior-contract.test.js counts rowgroup/row/columnheader/cell off these.
        const parts = [
            ['Header', Table.Header, 'thead'],
            ['Body', Table.Body, 'tbody'],
            ['Footer', Table.Footer, 'tfoot'],
            ['Row', Table.Row, 'tr'],
            ['HeaderCell', Table.HeaderCell, 'th'],
            ['Cell', Table.Cell, 'td'],
        ]

        it.each(parts)('Table.%s renders a <%s> with no class attribute when none is given',
            (name, Part, element) => {
                const { container } = render(<table><Part/></table>)
                const node = container.querySelector(element)
                expect(node).toBeInTheDocument()
                // Semantic rendered class="" here. An omitted attribute is the intended change.
                expect(node.hasAttribute('class')).toBe(false)
            })

        it.each(parts)('Table.%s passes `className` through verbatim', (name, Part, element) => {
            const { container } = render(<table><Part className="font-normal left"/></table>)
            expect(container.querySelector(element).getAttribute('class')).toBe('font-normal left')
        })

        it.each(parts)('Table.%s strips the engine and field-only props', (name, Part, element) => {
            const { container } = render(<table><Part {...ENGINE_BAG}/></table>)
            expect(container.querySelector(element).getAttributeNames()).toEqual([])
        })

        it('renders an empty <thead> and an empty <tbody> rather than nothing', () => {
            // Five of the 24 corpus tables have an empty <thead> (the `vertical` ones put their
            // `th`s in the body), and `invalidArray` renders two tables with no cells at all. The
            // behaviour contract pins `rowgroup: 2` per table, which is exactly this.
            const { container } = render(<Table><Table.Header/><Table.Body/></Table>)
            expect(container.querySelector('table > thead')).toBeInTheDocument()
            expect(container.querySelector('table > tbody')).toBeInTheDocument()
        })

        it('renders a HeaderCell as <th> inside a <tbody>, not only inside a <thead>', () => {
            // `table.no-header.vertical > tbody > tr > th` in table.less depends on this, and so
            // does the `tableVertical` census entry (6 rows, 6 columnheaders, all in the body).
            const { container } = render(
                <Table><Table.Body><Table.Row><Table.HeaderCell>H</Table.HeaderCell></Table.Row></Table.Body></Table>
            )
            expect(container.querySelector('tbody tr th')).toBeInTheDocument()
        })

        it('works with no Table ancestor at all', () => {
            // mapper.rendering-edge-cases and both LocalDraftTableRow suites mount a bare
            // Table.Cell inside hand-written markup. There is no context and no provider.
            const { container } = inTable(<tr><Table.Cell>x</Table.Cell></tr>)
            expect(container.querySelector('td')).toHaveTextContent('x')
        })
    })

    describe('cell attributes that were never Semantic\'s to handle', () => {
        it('forwards colSpan, style and scope to the <td>', () => {
            const { container } = inTable(
                <tr><Table.Cell colSpan={3} scope="row" style={{ verticalAlign: 'top' }}>x</Table.Cell></tr>
            )
            const td = container.querySelector('td')
            expect(td).toHaveAttribute('colspan', '3')
            expect(td).toHaveAttribute('scope', 'row')
            expect(td.style.verticalAlign).toBe('top')
        })

        it('forwards colSpan and style to the <th>', () => {
            const { container } = render(
                <table><thead><tr>
                    <Table.HeaderCell colSpan={2} style={{ width: '20%' }}>H</Table.HeaderCell>
                </tr></thead></table>
            )
            const th = container.querySelector('th')
            expect(th).toHaveAttribute('colspan', '2')
            expect(th.style.width).toBe('20%')
        })

        it('renders the children it is given, including a falsy-but-real 0', () => {
            const { container } = inTable(<tr><Table.Cell>{0}</Table.Cell></tr>)
            expect(container.querySelector('td')).toHaveTextContent('0')
        })
    })

    describe('verticalAlign is no longer a prop of this family', () => {
        it('does not emit Semantic\'s `top aligned` classes', () => {
            // THE DECISION, pinned: Semantic turned verticalAlign="top" into the classes
            // `top aligned`, and NO loaded CSS selects on `aligned` (0 occurrences in
            // static/all.css and in src/style) — nor can any `.top` rule match, since every one
            // of them needs a second class on the same element. So the 15 cells that asked for it
            // rendered at the <td> default anyway, and reproducing the classes would have copied
            // dead markup. The prop is gone; both call sites (LocalDraftTableRow) went with it.
            // React warns about the unknown prop, which is the intended signal for a removed one.
            const consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
            try {
                const { container } = inTable(<tr><Table.Cell verticalAlign="top">x</Table.Cell></tr>)
                const td = container.querySelector('td')
                expect(td.className).toBe('')
                expect(td.hasAttribute('class')).toBe(false)
            } finally {
                consoleError.mockRestore()
            }
        })
    })

    describe('isolation', () => {
        it('no longer imports semantic-ui-react', () => {
            // The §9.7-F1 invariant is checked repo-wide by lint:js and by the docs:props scan;
            // asserted here too because THIS file is the one that just stopped importing it, and
            // a re-introduction would otherwise only surface in a generated-page diff.
            // Matched as a module reference, not as the bare string: the file's own header
            // explains what it replaced, and a substring check would fail on the prose.
            const source = require('fs').readFileSync(require.resolve('../Table.js'), 'utf8')
            expect(source).not.toMatch(/(?:from|require\(|import\(|jest\.mock\()\s*['"]semantic-ui-react/)
        })

        it('applies both boundary lists, not a hand-rolled subset', () => {
            // Guards against the failure domProps.js was written to prevent: a component that
            // filters "the props we saw leak" instead of the named list. Every key in both lists
            // must be stripped by the cell, whatever the lists grow to contain.
            const bag = {}
            ENGINE_PROPS.concat(FIELD_ONLY_PROPS).forEach(key => { bag[key] = 'x' })
            const { container } = inTable(<tr><Table.Cell {...bag}>x</Table.Cell></tr>)
            expect(container.querySelector('td').getAttributeNames()).toEqual([])
        })
    })
})

/**
 * Dropped props (§9.7-F1 step 1). A string-valued one used to reach the element as a lowercase
 * attribute — `verticalAlign="top"` rendered `verticalalign="top"` — which is exactly what the
 * DOM contract's FIXED_MARKUP_JUNK tripwires exist to keep out. Stripping silently would be
 * worse: a meta still carrying `celled` would never learn it stopped working. So both halves are
 * pinned here: nothing reaches the DOM, and development says so once.
 */
describe('Table drops the props it no longer supports', () => {
    let warn
    beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => { warn.mockRestore() })

    it('keeps a dropped string prop out of the DOM', () => {
        const { container } = render(
            <Table textAlign="center">
                <Table.Body><Table.Row><Table.Cell verticalAlign="top">x</Table.Cell></Table.Row></Table.Body>
            </Table>
        )
        // Lowercase, so React itself would not have warned about either one.
        expect(container.querySelector('table').hasAttribute('textalign')).toBe(false)
        expect(container.querySelector('td').hasAttribute('verticalalign')).toBe(false)
        // The class contract is untouched by the strip.
        expect(container.querySelector('table')).toHaveClass('ui', 'table')
        expect(container.querySelector('td')).toHaveTextContent('x')
    })

    it('says so in development, naming the component and the prop', () => {
        render(<Table celled><Table.Body><Table.Row><Table.Cell>x</Table.Cell></Table.Row></Table.Body></Table>)
        const said = warn.mock.calls.map(call => call.join(' ')).join('\n')
        expect(said).toContain('Table')
        expect(said).toContain('celled')
        expect(said).toContain('no longer supported')
    })

    it('leaves supported props alone', () => {
        const { container } = render(
            <Table className="full-width" striped>
                <Table.Body><Table.Row>
                    <Table.Cell colSpan={2} style={{ verticalAlign: 'top' }} scope="row" data-x="1">x</Table.Cell>
                </Table.Row></Table.Body>
            </Table>
        )
        const cell = container.querySelector('td')
        expect(container.querySelector('table')).toHaveClass('ui', 'table', 'striped', 'full-width')
        expect(cell).toHaveAttribute('colspan', '2')
        expect(cell).toHaveAttribute('scope', 'row')
        expect(cell).toHaveAttribute('data-x', '1')
        // `style` is how a cell aligns for real, which is what the changelog points consumers at.
        expect(cell.style.verticalAlign).toBe('top')
    })
})
