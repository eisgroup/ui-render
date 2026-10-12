/**
 * WHAT ANOTHER FIELD'S CHANGE COSTS A SELECT WHOSE OPTIONS ARE MAPPED, pinned (2026-10-12).
 * =============================================================================================
 *
 * The mapper mapped a field's `options` through its `mapOptions` on every render, so a Select was handed a
 * new array each time and rendered again on every change of its document, a blur included. `toOpenLConfig`
 * gives a named Select with no `onChange` of its own a `mapOptions` whenever its options are not a declared
 * option list, so many Selects did. The mapped options are now kept while they are
 * mapped from the same options by the same mapping (`keptMappedOptions` in `engine/mapper.tsx`), and so is
 * the handler a stable-value Select's `onChange` is wrapped in, which searches them.
 *
 * What still renders a Select again is its document's meta being built anew, when the document's state
 * changes (`meta` in `engine/rules.tsx`): here, once, for the first edit, as for a Select whose options are
 * not mapped. A Select in a table cell still renders with its table too: the cell's renderer builds the
 * cell's meta anew, options included, for every row on every render (`engine/transforms.ts`), which this
 * does not change.
 *
 * Measured in jsdom on React 18 with a form of 100 such Selects, two runs: 300 renders at mount and 100 for
 * each later edit or blur of another field, an edit taking 16 and 22 ms; now 200, and none, an edit taking
 * 7 and 5 ms. A number here that falls is progress: lower it. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every render of each Select's `Dropdown`, by the field's name, and the options it was last handed. */
const mockSeen = { renders: {}, options: {} }
jest.mock('../../core/components/Dropdown', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Dropdown')
    const Dropdown = props => {
        mockSeen.renders[props.name] = (mockSeen.renders[props.name] || 0) + 1
        mockSeen.options[props.name] = props.options
        return React.createElement(actual.Dropdown, props)
    }
    return { __esModule: true, ...actual, Dropdown }
})

const records = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]
const SELECTS = {
    byValue: { view: 'Select', name: 'byValue', options: records, mapOptions: { text: 'name', value: 'id' } },
    byIndex: { view: 'Select', name: 'byIndex', options: records, mapOptions: 'name' },
    plain: { view: 'Select', name: 'plain', options: [{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }] },
}
const meta = { view: 'Col', items: [...Object.values(SELECTS), { view: 'Input', name: 'other' }] }
const data = () => ({ byValue: 'a', byIndex: '0', plain: 'a', other: 'o' })

/** The renders of the three Selects, by name, since the last call. */
function rendersSince () {
    const counts = Object.fromEntries(Object.keys(SELECTS).map(name => [name, mockSeen.renders[name] || 0]))
    mockSeen.renders = {}
    return counts
}

const settle = () => act(() => { jest.runOnlyPendingTimers() })

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('Selects whose options are mapped', () => {
    it('render no more than a Select whose options are not, and not at all for another field\'s later changes', () => {
        rendersSince()
        const { container } = render(<UIRender meta={meta} data={data()} initialValues={data()} />)
        settle()
        const atMount = rendersSince()
        const form = [...formsStorage.values()].map(entry => entry.form).find(candidate => 'other' in candidate.getState().values)
        const other = container.querySelector('input[name="other"]')

        // The first edit changes the document's state, which builds its meta anew: every Select renders once.
        act(() => { form.change('other', 'first') })
        settle()
        rendersSince()
        act(() => { form.change('other', 'second') })
        settle()
        const onEdit = rendersSince()
        act(() => { fireEvent.focus(other); fireEvent.blur(other) })
        settle()
        const onBlur = rendersSince()
        const none = { byValue: 0, byIndex: 0, plain: 0 }
        // Before 2026-10-12 the two mapped Selects read 3 at mount, and 1 for the edit and for the blur.
        expect({ atMount, onEdit, onBlur }).toEqual({ atMount: { byValue: 2, byIndex: 2, plain: 2 }, onEdit: none, onBlur: none })
    })

    it('are handed the options their mapping makes', () => {
        render(<UIRender meta={meta} data={data()} initialValues={data()} />)
        settle()
        expect([mockSeen.options.byValue, mockSeen.options.byIndex]).toEqual([
            [{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }],
            [{ text: 'A', value: '0' }, { text: 'B', value: '1' }],
        ])
    })
})
