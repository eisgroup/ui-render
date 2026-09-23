/**
 * EVERY LAYOUT ALIAS, AND WHICH DIRECTION IT LAYS OUT.
 * =============================================================================================
 *
 * Ten documented `view` names resolve to three components through five `case` groups, and the
 * names do not say which direction they produce: `ColList` and `VerticalList` are COLUMN lists
 * while `HorizontalList` is a ROW list, and `Column` and `VerticalLayout` are aliases of `Col`.
 * A decomposition that moved one name into the wrong group would be invisible — the component
 * still renders, the DOM still has a flex container, and only the axis changes.
 *
 * WHY THIS FILE EXISTS (§9.3 step 1, characterize). Branch coverage reported all ten `case`s as
 * taken and that was worthless here: consecutive cases share one body, so istanbul gives the whole
 * fall-through group a single counter — `LIST`, `COL_LIST` and `COL_LIST3` all read exactly 8
 * because ONE of them was exercised. Measured by name instead, `ColList`, `HorizontalList` and
 * `VerticalList` were passed by nothing at all: not by a test, not by a tracked example. `Column`
 * appeared only in the example corpus, which gates a pure refactor and asserts no behaviour.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../modules/form/utils'
import Render from '..'
import { FIELD } from '../../modules/variables'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'
import '../mapper'

const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={{ ...initialAppState, setPopupState: jest.fn() }}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const renderView = (view, extra = {}) => render(withProviders(
    <Render.Component
        view={view}
        items={[{ view: FIELD.TYPE.TEXT, label: 'child' }]}
        data={{}}
        instance={{ state: {}, submit: () => {} }}
        form={{ change: () => {} }}
        {...extra}
    />
))

// The container `List` builds is what carries the axis, so the list cases pass their items through
// `_data` and a `renderItem` — the shape `metaToProps` has already produced by the time the mapper
// sees the node.
const renderList = view => renderView(view, {
    _data: [{ id: 'a' }, { id: 'b' }],
    renderItem: (item, i) => <span key={i} data-testid="item">{item.id}</span>,
})

const axisOf = container => {
    const node = container.querySelector('.flex--row, .flex--col')
    if (!node) throw new Error('no flex container rendered')
    return node.classList.contains('flex--row') ? 'row' : 'col'
}

describe('layout aliases resolve to the direction their name promises', () => {
    it.each([
        ['Col', FIELD.TYPE.COL, 'col'],
        ['Column', FIELD.TYPE.COL2, 'col'],
        ['VerticalLayout', FIELD.TYPE.COL3, 'col'],
        ['Row', FIELD.TYPE.ROW, 'row'],
        ['HorizontalLayout', FIELD.TYPE.ROW2, 'row'],
    ])('%s lays out along the %s axis', (name, view, axis) => {
        expect(view).toBe(name)
        const { container } = renderView(view)
        expect(axisOf(container)).toBe(axis)
        expect(container.textContent).toContain('child')
    })

    it.each([
        ['List', FIELD.TYPE.LIST, 'col'],
        ['ColList', FIELD.TYPE.COL_LIST, 'col'],
        ['VerticalList', FIELD.TYPE.COL_LIST3, 'col'],
        ['RowList', FIELD.TYPE.ROW_LIST, 'row'],
        ['HorizontalList', FIELD.TYPE.ROW_LIST2, 'row'],
    ])('%s builds a list along the %s axis', (name, view, axis) => {
        expect(view).toBe(name)
        const { container, getAllByTestId } = renderList(view)
        expect(axisOf(container)).toBe(axis)
        // `items` comes from `_data`, not from the node's `items` — the list renders one child per
        // datum through `renderItem`, and the node's own `items` are not its children.
        expect(getAllByTestId('item').map(n => n.textContent)).toEqual(['a', 'b'])
    })

    it('renders nothing rather than throwing when a list has no data', () => {
        const { container } = renderView(FIELD.TYPE.COL_LIST, {
            renderItem: item => <span>{item.id}</span>,
        })

        expect(container.querySelector('.flex--row, .flex--col')).toBeNull()
    })
})
