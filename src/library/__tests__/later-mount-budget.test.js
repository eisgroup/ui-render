/**
 * WHAT FIELDS THAT MOUNT AFTER THE FIRST RENDER COST THEIR FORM, pinned (2026-10-13).
 * =============================================================================================
 *
 * A tab switch, a `showIf` that flips, a popup, a row expanded: fields that mount after the document's first
 * render registered one by one while validation ran. Each registration published every field's state and ran
 * every field's validator, and each one that went did the same, so a burst of n fields cost about n²/2 of each.
 * An engine node now brackets the registrations it causes (`RenderComponent`, `engine/mapper.tsx`), and the form
 * tells every field once when the outermost bracket closes (`registrationsOf`, `modules/form/batchedForm.ts`).
 *
 * Counted through each field's `isEqual`, which final-form calls once for the field's own state and twice for
 * each field in the form's, and through each field's validator. Before, with the same 101 fields:
 *  - a tab switch to the table computed 21008 field states and ran 5252 validators, and one away from it 20200 and
 *    5050;
 *  - a `showIf` that showed it computed 21524 and ran 5252, and one that hid it 21322 and 5151.
 * Now a switch to it computes 12 states per field, its own two as it registers and the rest in the passes when the
 * bracket closes, and validates each field twice; a switch away has no field left to tell. Hiding it validates each
 * field once, from the `form.change` that hides it: a field changed with no `validateFields` validates them all.
 *
 * React 16 runs a removed component's effect cleanups during the commit, before any layout effect, so no bracket is
 * open when the table's fields go: there they still go one by one, and cost what they did. A number here that falls
 * is progress: lower it. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

/** Every field state final-form computes, and every validator it runs. */
const mockCount = { computed: 0, validated: 0 }
jest.mock('final-form', () => {
    const actual = jest.requireActual('final-form')
    const createForm = config => {
        const form = actual.createForm(config)
        const registerField = form.registerField
        form.registerField = (name, subscriber, subscription, fieldConfig = {}) => registerField(name, subscriber, subscription, {
            ...fieldConfig,
            isEqual: (a, b) => {
                mockCount.computed += 1
                return fieldConfig.isEqual ? fieldConfig.isEqual(a, b) : a === b
            },
            getValidator: fieldConfig.getValidator && (() => {
                const validator = fieldConfig.getValidator()
                return validator && ((...args) => {
                    mockCount.validated += 1
                    return validator(...args)
                })
            }),
        })
        return form
    }
    return { __esModule: true, ...actual, createForm }
})

const ROWS = 50
// Whether the fields that go are bracketed too: not on React 16 (see above).
const REMOVALS_BRACKETED = Number(React.version.split('.')[0]) > 16
const table = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note', validate: 'required' } },
        { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', min: 0, max: 1000 } },
    ],
}
const data = () => ({ show: 'no', rows: Array.from({ length: ROWS }, (_, i) => ({ note: `note ${i}`, qty: i })) })

/** What an action costs the form. */
async function costOf (action) {
    mockCount.computed = 0
    mockCount.validated = 0
    await act(async () => {
        action()
        // A tab changes after its 50 ms transition (`Tabs.tsx`).
        await new Promise(resolve => setTimeout(resolve, 100))
    })
    return { ...mockCount }
}

const formHolding = key => [...formsStorage.values()].map(entry => entry.form).find(candidate => key in candidate.getState().values)

describe('fields that mount after the first render: a 50-row table of two fields per row', () => {
    it('costs a tab switch to it, and away from it, a few passes over its fields', async () => {
        const meta = { view: 'Tabs', items: [{ tab: 'A', content: { view: 'Text', children: 'Nothing here' } }, { tab: 'B', content: table }] }
        render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
        const to = await costOf(() => fireEvent.click(screen.getByRole('tab', { name: 'B' })))
        const fields = formHolding('rows').getRegisteredFields()
        const away = await costOf(() => fireEvent.click(screen.getByRole('tab', { name: 'A' })))
        expect(fields).toHaveLength(2 * ROWS + 1)
        expect(to).toEqual({ computed: 12 * fields.length, validated: 2 * fields.length })
        expect(away).toEqual(REMOVALS_BRACKETED ? { computed: 0, validated: 0 } : { computed: 20200, validated: 5050 })
        expect(screen.queryByRole('textbox', { name: /Note/ })).toBeNull()
    })

    it('costs a `showIf` that shows it, and hides it again, a few passes over its fields', async () => {
        const meta = { view: 'Col', items: [{ view: 'Input', name: 'show', label: 'Show' }, { ...table, showIf: { name: 'show', equal: 'yes' } }] }
        render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
        const form = formHolding('show')
        const shown = await costOf(() => form.change('show', 'yes'))
        const fields = form.getRegisteredFields()
        const hidden = await costOf(() => form.change('show', 'no'))
        expect(fields).toHaveLength(2 * ROWS + 2)
        expect(shown).toEqual({ computed: 1431, validated: 2 * (fields.length - 1) })
        expect(hidden).toEqual(REMOVALS_BRACKETED ? { computed: 822, validated: fields.length - 1 } : { computed: 21322, validated: 5151 })
        expect(form.getRegisteredFields()).toEqual(['show'])
    })
})
