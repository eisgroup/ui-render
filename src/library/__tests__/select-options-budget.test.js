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
 * What still renders a Select again is its document's meta being built anew, when a new state changes
 * what the meta read (`meta` in `engine/rules.tsx`, `engine/metaStateReads.ts`). Nothing here reads the
 * state, so no edit does. A Select in a table cell renders with its table: its cell is kept per row
 * (`BuiltCell` in `engine/transforms.ts`).
 *
 * Measured in jsdom on React 18 with a form of 100 such Selects, two runs: 300 renders at mount and 100 for
 * each later edit or blur of another field, an edit taking 16 and 22 ms; then 200, and none, an edit taking
 * 7 and 5 ms. 100 at mount since the meta is kept across a state it does not read. A number here that falls
 * is progress: lower it. One that rises is a regression.
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

        // The first edit changes the document's state (its `canSave`), which nothing in the meta reads.
        act(() => { form.change('other', 'first') })
        settle()
        const onFirstEdit = rendersSince()
        act(() => { form.change('other', 'second') })
        settle()
        const onEdit = rendersSince()
        act(() => { fireEvent.focus(other); fireEvent.blur(other) })
        settle()
        const onBlur = rendersSince()
        const none = { byValue: 0, byIndex: 0, plain: 0 }
        // Before their options were kept (2026-10-12) the two mapped Selects read 3 at mount, and 1 for each
        // later edit and for the blur.
        // Each read 2 at mount, and 1 for the first edit, until the meta was kept across a state it does not read.
        expect({ atMount, onFirstEdit, onEdit, onBlur }).toEqual({ atMount: { byValue: 1, byIndex: 1, plain: 1 }, onFirstEdit: none, onEdit: none, onBlur: none })
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
