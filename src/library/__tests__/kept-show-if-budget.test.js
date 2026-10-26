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
 * Measured on React 16.14, 17.0.2, 18.3.1 and 19.3.0, which agree. A number that falls is progress: lower
 * it here. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'

/** Every decision of a `showIf` (`shouldRender` given one), and every render of a `Text`. */
const mockCounts = { decisions: 0, texts: 0 }
jest.mock('../../core/engine/showIf', () => {
    const actual = jest.requireActual('../../core/engine/showIf')
    return {
        ...actual,
        shouldRender: args => {
            if (args.showIf != null) mockCounts.decisions += 1
            return actual.shouldRender(args)
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

/** What typing `value` into the field `name` costs. */
function keystroke (name, value) {
    Object.assign(mockCounts, { decisions: 0, texts: 0 })
    act(() => { fireEvent.change(document.querySelector(`input[name="${name}"]`), { target: { value } }) })
    act(() => { jest.runOnlyPendingTimers() })
    return { ...mockCounts }
}

const shownItems = container => Array.from(container.querySelectorAll('.text'), text => text.textContent).filter(text => text === 'Gated').length

describe('a 50-item list whose items read a field in their `showIf`', () => {
    it('decides nothing and renders none of them for a keystroke in another field', () => {
        render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        expect(keystroke('note', 'x')).toEqual({ decisions: 0, texts: 0 })
    })

    it('decides each once for a keystroke in the field they read, and renders each it shows', () => {
        const { container } = render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        // Each decides, and renders, which decides it again.
        expect(keystroke('flag', 'y')).toEqual({ decisions: ROWS * 2, texts: ROWS })
        expect(shownItems(container)).toBe(ROWS)
        // The same answer: each decides, and none renders.
        expect(keystroke('flag', 'yes')).toEqual({ decisions: ROWS, texts: 0 })
        expect(keystroke('flag', '')).toEqual({ decisions: ROWS * 2, texts: 0 })
        expect(shownItems(container)).toBe(0)
    })

    it('decides nothing more at mount than each item\'s render does', () => {
        // Each item renders twice as the document mounts, on every React version, and decides its `showIf` each time:
        // 100 before the items followed the form, measured on the four.
        Object.assign(mockCounts, { decisions: 0, texts: 0 })
        render(<UIRender meta={meta} data={data} initialValues={data}/>)
        act(() => { jest.runOnlyPendingTimers() })

        expect(mockCounts.decisions).toBe(ROWS * 2)
    })
})
