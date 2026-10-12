/**
 * WHAT ANOTHER FIELD'S CHANGE COSTS A FIELD THAT SUBMITS ITSELF OR CLEARS ITSELF, pinned (2026-10-12).
 * =============================================================================================
 *
 * `autoSubmit` and `removable` each wrapped the field's own handler in a new function on every render,
 * so such a field rendered again whenever anything else in its document changed, a blur included, and
 * three times at mount. They cost no render now: each field renders as often as it does without them
 * (`keptHandler` in `engine/mapper.tsx`), and still submits, and clears, as it did.
 *
 * Measured in jsdom on React 18, next to a plain field: 3 renders at mount, 1 for the other field's edit
 * and 1 for its blur, against 1, 0 and 0 without them; 1, 0 and 0 with them since. A number here that
 * falls is progress: lower it. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every render of each text field's `Input`, by the field's name. Not memoised, as the field's own is not. */
const mockRenders = {}
jest.mock('../../core/components/Input', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Input')
    const Input = props => {
        mockRenders[props.name] = (mockRenders[props.name] || 0) + 1
        return React.createElement(actual.Input, props)
    }
    return { __esModule: true, ...actual, Input }
})

const FIELDS = ['submitting', 'clearing', 'both']
const meta = withHandlers => ({
    view: 'Col',
    items: [
        { view: 'Input', name: 'submitting', ...withHandlers && { autoSubmit: { delay: 0 } } },
        { view: 'Input', name: 'clearing', ...withHandlers && { removable: true } },
        { view: 'Input', name: 'both', ...withHandlers && { autoSubmit: { delay: 0 }, removable: true } },
        { view: 'Input', name: 'other' },
    ],
})
const data = () => ({ submitting: 'a', clearing: 'b', both: 'c', other: 'd' })

/** The renders of the three fields, by name, since the last call. */
function rendersSince () {
    const counts = Object.fromEntries(FIELDS.map(name => [name, mockRenders[name] || 0]))
    Object.keys(mockRenders).forEach(name => { delete mockRenders[name] })
    return counts
}

function mount (withHandlers = true, props = {}) {
    rendersSince()
    const view = render(<UIRender meta={meta(withHandlers)} data={data()} initialValues={data()} {...props} />)
    act(() => { jest.runOnlyPendingTimers() })
    const form = [...formsStorage.values()].map(entry => entry.form).find(candidate => 'other' in candidate.getState().values)
    return { ...view, form, atMount: rendersSince() }
}

const settle = () => act(() => { jest.runOnlyPendingTimers() })

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('fields with autoSubmit and removable', () => {
    it('render as often as without them, and not at all for another field\'s edit or blur', () => {
        const { atMount: withoutThem, unmount } = mount(false)
        unmount()

        const { form, atMount, container } = mount()
        act(() => { form.change('other', 'changed') })
        settle()
        const onEdit = rendersSince()
        const other = container.querySelector('input[name="other"]')
        act(() => { fireEvent.focus(other); fireEvent.blur(other) })
        settle()
        const onBlur = rendersSince()
        const none = { submitting: 0, clearing: 0, both: 0 }
        // Before 2026-10-12: 3 renders of each at mount, and 1 of each for the edit and for the blur.
        expect({ atMount, onEdit, onBlur }).toEqual({ atMount: withoutThem, onEdit: none, onBlur: none })
    })

    it('still submit on a change, and clear, submitting when they submit', () => {
        const submitted = []
        const { form, container } = mount(true, { onSubmit: values => { submitted.push({ ...values }) } })

        fireEvent.change(container.querySelector('input[name="submitting"]'), { target: { value: 'typed' } })
        settle()
        expect(submitted.map(values => values.submitting)).toEqual(['typed'])

        const iconOf = name => container.querySelector(`input[name="${name}"]`).closest('.input').querySelector('i.appear-on-hover')
        act(() => { fireEvent.click(iconOf('clearing')) })
        settle()
        act(() => { fireEvent.click(iconOf('both')) })
        settle()
        expect({
            clearing: form.getState().values.clearing ?? null,
            both: form.getState().values.both ?? null,
            submits: submitted.length,
        }).toEqual({ clearing: null, both: null, submits: 2 })
    })
})
