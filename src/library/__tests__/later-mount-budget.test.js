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
 * Now a switch to it computes 11 states per field, and validates each field once, when the bracket closes; a switch
 * away has no field left to tell. Hiding it validates each field once, from the `form.change` that hides it: a field
 * changed with no `validateFields` validates them all.
 *
 * Until 2026-10-14, react-final-form's probe in each field's first render validated every field registered then,
 * before any bracket opened. Here that was each field once more. Beside 100 other required fields, it was 101 times
 * each new field: showing the table there ran 10502 validators, 10201 of them from the probes.
 *
 * Fields can also go when nothing mounts and no `showIf` flips: a popup that closes, an Expand whose collapse ends, rows
 * that collapse, or that go with the host's data. The component that removes them brackets them then: `Modal`,
 * `Expand` and `TableView` (2026-10-14). Before, beside 100 other required fields, each of these validated every
 * field left once for each field that went: closing the popup ran 15150 validators, the Expand's collapse 15150,
 * collapsing the table's rows 6275, and data with 5 of its 50 rows 14307.
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
const MAJOR = Number(React.version.split('.')[0])
// Whether the fields that go are bracketed too: not on React 16 (see above).
const REMOVALS_BRACKETED = MAJOR > 16
const table = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note', validate: 'required' } },
        { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', min: 0, max: 1000 } },
    ],
}
const data = () => ({ show: 'no', rows: Array.from({ length: ROWS }, (_, i) => ({ note: `note ${i}`, qty: i })) })

/** What an action costs the form, with what it sets off within `wait` milliseconds. */
async function costOf (action, wait = 100) {
    mockCount.computed = 0
    mockCount.validated = 0
    await act(async () => {
        action()
        // A tab changes after its 50 ms transition (`Tabs.tsx`).
        await new Promise(resolve => setTimeout(resolve, wait))
    })
    return { ...mockCount }
}

const besideOthers = () => Array.from({ length: 100 }, (_, i) => ({ view: 'Input', name: `other${i}`, validate: 'required' }))
const valuesOf = fields => Object.fromEntries(fields.map(({ name }) => [name, 'x']))

const formHolding = key => [...formsStorage.values()].map(entry => entry.form).find(candidate => key in candidate.getState().values)

describe('fields that mount after the first render: a 50-row table of two fields per row', () => {
    it('costs a tab switch to it, and away from it, a few passes over its fields', async () => {
        const meta = { view: 'Tabs', items: [{ tab: 'A', content: { view: 'Text', children: 'Nothing here' } }, { tab: 'B', content: table }] }
        render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
        const to = await costOf(() => fireEvent.click(screen.getByRole('tab', { name: 'B' })))
        const fields = formHolding('rows').getRegisteredFields()
        const away = await costOf(() => fireEvent.click(screen.getByRole('tab', { name: 'A' })))
        expect(fields).toHaveLength(2 * ROWS + 1)
        expect(to).toEqual({ computed: 11 * fields.length, validated: fields.length })
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
        expect(shown).toEqual({ computed: 1330, validated: fields.length - 1 })
        expect(hidden).toEqual(REMOVALS_BRACKETED ? { computed: 822, validated: fields.length - 1 } : { computed: 21322, validated: 5151 })
        expect(form.getRegisteredFields()).toEqual(['show'])
    })

    it('costs a `showIf` that shows it beside 100 other required fields a pass over all of them, not one per new field', async () => {
        const others = Array.from({ length: 100 }, (_, i) => ({ view: 'Input', name: `other${i}`, validate: 'required' }))
        const meta = { view: 'Col', items: [{ view: 'Input', name: 'show', label: 'Show' }, ...others, { ...table, showIf: { name: 'show', equal: 'yes' } }] }
        const values = { ...data(), ...Object.fromEntries(others.map(({ name }) => [name, 'x'])) }
        render(<UIRender meta={meta} data={values} initialValues={values} onSubmit={() => {}} />)
        const form = formHolding('show')
        const shown = await costOf(() => form.change('show', 'yes'))
        expect(form.getRegisteredFields()).toHaveLength(2 * ROWS + 102)
        // One pass over the fields already there for the change, and one over them all when the bracket closes.
        expect(shown).toEqual({ computed: 3230, validated: 301 })
    })

    it('costs a popup that opens it beside 100 other required fields, and closes again, a pass over them each', async () => {
        // Nothing mounts when a popup closes, whose node would bracket its fields going: the dialog brackets them.
        const others = Array.from({ length: 100 }, (_, i) => ({ view: 'Input', name: `other${i}`, validate: 'required' }))
        const meta = {
            view: 'Col',
            items: [
                { view: 'Button', children: 'Open details', onClick: { name: 'popupOpen', args: ['details'] } },
                ...others,
                { view: 'Popup', id: 'details', title: 'Details', items: [table] },
            ],
        }
        const values = { ...data(), ...Object.fromEntries(others.map(({ name }) => [name, 'x'])) }
        render(<UIRender meta={meta} data={values} initialValues={values} onSubmit={() => {}} />)
        const form = formHolding('other0')
        const opened = await costOf(() => fireEvent.click(screen.getByRole('button', { name: 'Open details' })))
        expect(form.getRegisteredFields()).toHaveLength(2 * ROWS + 101)
        const closed = await costOf(() => fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }))
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(form.getRegisteredFields()).toHaveLength(100)
        expect(opened).toEqual({ computed: 2212, validated: 201 })
        // Once its fields have gone, every field left is validated and told once. Before, each field that went
        // validated and told every field left, 15150 validators in all, which React 16 still does.
        expect(closed).toEqual(REMOVALS_BRACKETED ? { computed: 600, validated: 100 } : { computed: 60800, validated: 15150 })
    })

    it('costs an Expand that holds it beside 100 other required fields, opening and collapsing, a pass over them each', async () => {
        // The content goes when the collapse's animation ends, 500 ms after the click, from a timer: nothing mounts or
        // changes then that would bracket its fields going, so the Expand brackets them.
        const others = besideOthers()
        const meta = { view: 'Col', items: [...others, { view: 'Expand', title: 'Details', items: [table] }] }
        const values = { ...data(), ...valuesOf(others) }
        render(<UIRender meta={meta} data={values} initialValues={values} onSubmit={() => {}} />)
        const form = formHolding('other0')
        const title = screen.getByRole('button', { name: 'Details' })
        const opened = await costOf(() => fireEvent.click(title))
        expect(form.getRegisteredFields()).toHaveLength(2 * ROWS + 101)
        // The click starts the collapse, and nothing goes yet.
        expect(await costOf(() => fireEvent.click(title))).toEqual({ computed: 0, validated: 0 })
        const collapsed = await costOf(() => {}, 600)
        expect(form.getRegisteredFields()).toHaveLength(100)
        expect(opened).toEqual({ computed: 2011, validated: 201 })
        expect(collapsed).toEqual(REMOVALS_BRACKETED ? { computed: 600, validated: 100 } : { computed: 60800, validated: 15150 })
    })

    it('costs every row of a table expanding beside 100 other required fields, and collapsing again, a pass over them each', async () => {
        // Which rows are expanded is the table's own state: nothing mounts or changes when they collapse that would
        // bracket their fields going, so the table brackets them.
        const others = besideOthers()
        const rows = {
            view: 'Table',
            name: 'rows',
            headers: [
                { id: 'note', label: 'Note' },
                { id: '#', renderHeader: { view: 'Checkbox', label: 'Expand all', onChange: 'handleToggleExpandAll' } },
            ],
            renderItem: { view: 'Input', name: 'detail', label: 'Detail', validate: 'required' },
        }
        const values = { rows: data().rows.map(({ note }, i) => ({ note, detail: `detail ${i}` })), ...valuesOf(others) }
        render(<UIRender meta={{ view: 'Col', items: [...others, rows] }} data={values} initialValues={values} onSubmit={() => {}} />)
        const form = formHolding('other0')
        const expanded = await costOf(() => fireEvent.click(screen.getByLabelText('Expand all')))
        expect(form.getRegisteredFields()).toHaveLength(ROWS + 101)
        const collapsed = await costOf(() => fireEvent.click(screen.getByLabelText('Expand all')))
        expect(form.getRegisteredFields()).toHaveLength(101)
        expect(expanded).toEqual({ computed: 1459, validated: 151 })
        expect(collapsed).toEqual(REMOVALS_BRACKETED ? { computed: 606, validated: 101 } : { computed: 25302, validated: 6275 })
    })

    it('costs data with 5 of its 50 rows, beside 100 other required fields, a pass over what is left', async () => {
        // The table's rows are keyed by their index, so rows go only when there are fewer, and nothing mounts then that
        // would bracket their fields going: the table brackets them.
        const others = besideOthers()
        const meta = { view: 'Col', items: [...others, table] }
        const values = count => ({ rows: data().rows.slice(0, count), ...valuesOf(others) })
        const { rerender } = render(<UIRender meta={meta} data={values(ROWS)} initialValues={values(ROWS)} onSubmit={() => {}} />)
        const form = formHolding('other0')
        const fewer = await costOf(() => rerender(<UIRender meta={meta} data={values(5)} initialValues={values(5)} onSubmit={() => {}} />))
        expect(form.getRegisteredFields()).toHaveLength(2 * 5 + 101)
        // React 18 computes the form's state once more here, two field states for each field left, with the bracket or
        // without it: measured on 18.3.1, against 17.0.2 and 19.3.0.
        const bracketed = MAJOR === 18 ? { computed: 1977, validated: 333 } : { computed: 1755, validated: 333 }
        expect(fewer).toEqual(REMOVALS_BRACKETED ? bracketed : { computed: 57201, validated: 14217 })
    })
})
