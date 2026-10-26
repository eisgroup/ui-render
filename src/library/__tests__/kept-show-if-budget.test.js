/**
 * WHAT A `showIf` IN A LIST'S ITEMS COSTS ON A CHANGE OF THE FORM, pinned (2026-10-23).
 * =============================================================================================
 *
 * A node in a list's items, or in a popup, follows the form its `showIf` reads by itself: its document's render does
 * not reach it (`engine/showIfFollowsForm.ts`). A decision merges every form of the document with its data, so it is
 * made only where the value the `showIf` reads changed, and the node renders again only where the decision is another:
 *
 * - a keystroke in another field decides nothing and renders none of the items, as before they followed the form;
 * - a keystroke in the field they read decides each item once, and one that shows them renders each, which decides it
 *   once more as it renders, as every node decides its `showIf`;
 * - the mount decides nothing more than each item's render does.
 *
 * The decisions of a document tree share one merge of its forms while they hold the same (`keptRawFormsData`,
 * 2026-10-26): a keystroke merges once, and a mount twice, once before the forms register and once after. Each decision
 * merged them until then, which made a mount and a keystroke cost the square of the items.
 *
 * Measured on React 16.14, 17.0.2, 18.3.1 and 19.3.0, which agree. A number that falls is progress: lower
 * it here. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'

/** Every decision of a `showIf` (`shouldRender` given one), every render of a `Text`, and every merge of the forms. */
const mockCounts = { decisions: 0, texts: 0, merges: 0 }
jest.mock('../../core/engine/formData', () => {
    const actual = jest.requireActual('../../core/engine/formData')
    return {
        ...actual,
        getRawFormsData: forms => {
            mockCounts.merges += 1
            return actual.getRawFormsData(forms)
        },
    }
})
jest.mock('../../core/engine/showIf', () => {
    const actual = jest.requireActual('../../core/engine/showIf')
    return {
        ...actual,
        shouldRender: (args, found) => {
            if (args.showIf != null) mockCounts.decisions += 1
            return actual.shouldRender(args, found)
        },
    }
})
jest.mock('../../core/components/Text', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Text')
    // Memoised as `Text` is, and calling its function rather than rendering it, so that a render a context brings
    // about is counted too.
    const Text = React.memo(props => {
        mockCounts.texts += 1
        return actual.default.type(props)
    })
    return { __esModule: true, ...actual, default: Text }
})

const ROWS = 50
const meta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'flag', label: 'Flag' },
        { view: 'Input', name: 'note', label: 'Note' },
        { view: 'List', name: 'rows', renderItem: { view: 'Text', children: 'Gated', showIf: { name: 'flag', relativeData: false } } },
    ],
}
const data = { flag: '', note: '', rows: Array.from({ length: ROWS }, (_, i) => ({ id: i })) }

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

/** Counts from zero. */
const counting = () => Object.assign(mockCounts, { decisions: 0, texts: 0, merges: 0 })

/** What typing `value` into the field `name` costs. */
function keystroke (name, value) {
    counting()
    act(() => { fireEvent.change(document.querySelector(`input[name="${name}"]`), { target: { value } }) })
    act(() => { jest.runOnlyPendingTimers() })
    return { ...mockCounts }
}

const shownItems = container => Array.from(container.querySelectorAll('.text'), text => text.textContent).filter(text => text === 'Gated').length

describe('a 50-item list whose items read a field in their `showIf`', () => {
    it('decides nothing and renders none of them for a keystroke in another field', () => {
        render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        expect(keystroke('note', 'x')).toEqual({ decisions: 0, texts: 0, merges: 0 })
    })

    it('decides each once for a keystroke in the field they read, and renders each it shows', () => {
        const { container } = render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        // Each decides, and renders, which decides it again.
        expect(keystroke('flag', 'y')).toEqual({ decisions: ROWS * 2, texts: ROWS, merges: 1 })
        expect(shownItems(container)).toBe(ROWS)
        // The same answer: each decides, and none renders.
        expect(keystroke('flag', 'yes')).toEqual({ decisions: ROWS, texts: 0, merges: 1 })
        expect(keystroke('flag', '')).toEqual({ decisions: ROWS * 2, texts: 0, merges: 1 })
        expect(shownItems(container)).toBe(0)
    })

    it('decides nothing more at mount than each item\'s render does', () => {
        // Each item renders twice as the document mounts, on every React version, and decides its `showIf` each time:
        // 100 before the items followed the form, measured on the four. Each decision merged the forms until 2026-10-26.
        counting()
        render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        expect(mockCounts.decisions).toBe(ROWS * 2)
        expect(mockCounts.merges).toBe(2)
    })
})

// A field of a `useForm` block, a form of its own, which the items hear of through their document tree (2026-10-26):
// what it costs is what a field of their own form costs, above.
describe('a 50-item list whose items read a field of a `useForm` block', () => {
    const otherMeta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'note', label: 'Note' },
            { view: 'Data', useForm: true, meta: { view: 'Col', items: [{ view: 'Input', name: 'inner', label: 'Inner' }] } },
            { view: 'List', name: 'rows', renderItem: { view: 'Text', children: 'Gated', showIf: { name: 'inner', relativeData: false } } },
        ],
    }
    const otherData = { note: '', rows: data.rows }

    it('decides nothing more at mount, and nothing for a keystroke in the document\'s own form', () => {
        counting()
        render(<UIRender meta={otherMeta} data={otherData} initialValues={otherData}/>)
        act(() => { jest.runOnlyPendingTimers() })
        expect(mockCounts.decisions).toBe(ROWS * 2)
        expect(mockCounts.merges).toBe(2)

        expect(keystroke('note', 'x')).toEqual({ decisions: 0, texts: 0, merges: 0 })
    })

    it('decides each once for a keystroke in the block\'s field, and renders each it shows', () => {
        const { container } = render(<UIRender meta={otherMeta} data={otherData} initialValues={otherData}/>)
        act(() => { jest.runOnlyPendingTimers() })

        expect(keystroke('inner', 'y')).toEqual({ decisions: ROWS * 2, texts: ROWS, merges: 1 })
        expect(shownItems(container)).toBe(ROWS)
        expect(keystroke('inner', 'yes')).toEqual({ decisions: ROWS, texts: 0, merges: 1 })
        expect(keystroke('inner', '')).toEqual({ decisions: ROWS * 2, texts: 0, merges: 1 })
        expect(shownItems(container)).toBe(0)
    })

    it('decides nothing more at mount where the block comes after the list, with the value the data gives it', () => {
        // The items listen before the block's form and the document's register, and each tells the value they read.
        const listFirst = { ...otherMeta, items: [otherMeta.items[0], otherMeta.items[2], otherMeta.items[1]] }
        const listData = { ...otherData, inner: '' }
        counting()
        render(<UIRender meta={listFirst} data={listData} initialValues={listData}/>)
        act(() => { jest.runOnlyPendingTimers() })
        expect(mockCounts.decisions).toBe(ROWS * 2)
        expect(mockCounts.merges).toBe(2)

        expect(keystroke('note', 'x')).toEqual({ decisions: 0, texts: 0, merges: 0 })
    })
})

// A table whose rows each have a `useForm` form, the shape `rules.row-form-values.test.js` drives. A row's cell decides
// once more as the document mounts than it renders, where it decided as often until 2026-10-26: its first render reads
// the row's values, the document's form is not registered yet, and decides as if the field were empty. The document's
// form tells its values as it registers, and the cell decides again, where it waited for the rows' next render before.
// Each of these decisions merged every form of the tree until 2026-10-26, so the work grew with the square of the rows:
// measured on React 18.3, 80 merges of 21 forms.
describe('a 20-row table of `useForm` rows whose cell reads its row\'s field', () => {
    const RowCount = 20
    const rowsMeta = {
        view: 'Table',
        name: 'dataKind.items',
        headers: [{ id: 'kind', label: 'Kind' }, { id: 'detail', label: 'Detail' }],
        renderItemCells: {
            view: 'Data', kind: 'items', embedded: true, useForm: true,
            meta: {
                view: 'TableCells',
                items: [
                    { view: 'Input', name: 'kind', type: 'text' },
                    { view: 'Text', children: 'Detail', showIf: { name: 'kind', equal: 'other' } },
                ],
            },
        },
    }
    const rowsData = { dataKind: { items: Array.from({ length: RowCount }, (_, i) => ({ kind: i % 2 ? 'other' : 'plain' })) } }

    it('decides once more a row at mount than the row renders, and once for a keystroke in a row', () => {
        // A row's cell renders three times as the document mounts on React 18.3, and twice on 16.14, 17 and 19, as it
        // did before: measured, 60 and 40 decisions until 2026-10-26.
        const mountRenders = React.version.startsWith('18.') ? 3 : 2
        counting()
        render(<UIRender meta={rowsMeta} data={rowsData} initialValues={rowsData}/>)
        act(() => { jest.runOnlyPendingTimers() })
        expect(mockCounts.decisions).toBe(RowCount * (mountRenders + 1))
        expect(mockCounts.merges).toBe(2)

        expect(keystroke('dataKind.items[0].kind', 'other')).toEqual({ decisions: 1, texts: 1, merges: 1 })
    })
})
