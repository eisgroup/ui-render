/**
 * NESTED FORMS AND THE VALIDATION-ERROR CHANNEL (2026-10-09).
 * =============================================================================================
 *
 * A document's `getValidationErrors` hears the errors of every form in its document tree: its own,
 * and each nested document's that has a form of its own, which is a `useForm` block or a table's draft
 * row (a `renderExtraItem` declaration sets `useForm`). 0.34.x reported them through its one map for
 * the whole page. The per-form split of §9.3 step 3 reported the root form alone, so these errors
 * showed on screen and never reached the host. Measured on the published bundles: 0.34.3 reported
 * `['inner', 'outer']` for the first case below, master `['outer']`.
 *
 * Another `UIRender` on the page is another tree, and stays out: `rules.two-instances-errors.test.js`.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const appContext = { ...initialAppState, setPopupState: () => {} }
const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

afterEach(() => {
    cleanup()
    formsStorage.clear()
})

const required = (name, label) => ({ view: 'Input', name, label, validate: 'required', required: true })

const touch = label => {
    const input = screen.getByLabelText(label)
    fireEvent.focus(input)
    fireEvent.blur(input)
}

describe('a document reports the errors of the forms nested in it', () => {
    it('reports a `useForm` block\'s error beside its own form\'s', async () => {
        const calls = []
        const meta = {
            view: 'Col',
            items: [
                { view: 'Data', useForm: true, meta: { view: 'Row', items: [required('inner', 'Inner')] } },
                required('outer', 'Outer'),
            ],
        }
        render(withProviders(
            <UIRender form meta={meta} data={{ inner: '', outer: '' }} initialValues={{ inner: '', outer: '' }}
                onSubmit={() => {}} getValidationErrors={errors => calls.push(Object.keys(errors).sort())}/>
        ))

        touch('Inner')
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['inner']))

        touch('Outer')
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['inner', 'outer']))
    })

    it('stops reporting a nested form\'s error once it is fixed, and once its block is gone', async () => {
        const calls = []
        const meta = withBlock => ({
            view: 'Col',
            items: [
                ...(withBlock ? [{ view: 'Data', useForm: true, meta: { view: 'Row', items: [required('inner', 'Inner')] } }] : []),
                required('outer', 'Outer'),
            ],
        })
        const document = withBlock => withProviders(
            <UIRender form meta={meta(withBlock)} data={{ inner: '', outer: '' }} initialValues={{ inner: '', outer: '' }}
                onSubmit={() => {}} getValidationErrors={errors => calls.push(Object.keys(errors).sort())}/>
        )
        const view = render(document(true))

        touch('Inner')
        touch('Outer')
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['inner', 'outer']))

        fireEvent.change(screen.getByLabelText('Inner'), { target: { value: 'filled' } })
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['outer']))

        fireEvent.change(screen.getByLabelText('Inner'), { target: { value: '' } })
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['inner', 'outer']))

        view.rerender(document(false))
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['outer']))
    })
})

describe('a table\'s draft row reports its errors too', () => {
    it('reports the draft row\'s required field, which 0.34.3 reported and the split dropped', async () => {
        // The tracked example `nestedDataKind`: its `renderExtraItem` is a draft row with a required
        // "Phase title". Measured on the published bundles after typing into and clearing it: 0.34.3's last
        // report held `dataKind.phases[3].title`, the draft's slot after the three phases; master's did not.
        const meta = require('../../../demo/examples/nested-datakind_meta.json')
        const data = require('../../../demo/examples/nested-datakind_data.json')
        const calls = []
        render(withProviders(
            <UIRender form meta={meta} data={data} initialValues={data}
                onSubmit={() => {}} getValidationErrors={errors => calls.push(Object.keys(errors))}/>
        ))

        const drafts = screen.getAllByLabelText('Phase title')
        const draft = drafts[drafts.length - 1]
        fireEvent.focus(draft)
        fireEvent.change(draft, { target: { value: 'x' } })
        fireEvent.change(draft, { target: { value: '' } })
        fireEvent.blur(draft)

        await waitFor(() => expect(calls.length).toBeGreaterThan(0))
        await waitFor(() => expect(calls[calls.length - 1]).toContain('dataKind.phases[3].title'))
    })
})

describe('how often, and when, the host hears', () => {
    it('hears one change once, however many nested documents re-render with it', async () => {
        // Every nested document that re-rendered in a commit reported before the owner's state showed the
        // last report, so one change reached the host once per nested document, table rows included.
        // Measured before the snapshot: 4 calls here, and 11 for one change in the `nestedDataKind` example.
        const calls = []
        const block = name => ({ view: 'Data', meta: { view: 'Row', items: [{ view: 'Input', name, label: name }] } })
        const meta = { view: 'Col', items: [required('owner', 'Owner'), block('a'), block('b'), block('c')] }
        render(withProviders(
            <UIRender form meta={meta} data={{ owner: '' }} initialValues={{ owner: '' }}
                onSubmit={() => {}} getValidationErrors={errors => calls.push(Object.keys(errors))}/>
        ))

        touch('Owner')
        await waitFor(() => expect(calls).toEqual([['owner']]))
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(calls).toEqual([['owner']])
    })

    it('hears that a nested form\'s error went with it, when a tab switch takes the form away', async () => {
        // A tab switch unmounts the block on the tab's own state: no document re-renders, so nothing reported
        // that the block's error had gone, and the host kept it until some unrelated edit.
        const calls = []
        const meta = {
            view: 'Col',
            items: [
                {
                    view: 'Tabs',
                    items: [
                        { tab: 'A', content: { view: 'Data', useForm: true, meta: { view: 'Col', items: [required('inner', 'Inner')] } } },
                        { tab: 'B', content: { view: 'Text', children: 'Nothing here' } },
                    ],
                },
                required('always', 'Always'),
            ],
        }
        render(withProviders(
            <UIRender form meta={meta} data={{ inner: 'x', always: 'z' }} initialValues={{ inner: 'x', always: 'z' }}
                onSubmit={() => {}} getValidationErrors={errors => calls.push(Object.keys(errors))}/>
        ))

        fireEvent.change(screen.getByLabelText('Inner'), { target: { value: '' } })
        touch('Inner')
        await waitFor(() => expect(calls[calls.length - 1]).toEqual(['inner']))

        fireEvent.click(screen.getByRole('tab', { name: 'B' }))
        // The tab changes after its 50 ms transition (`Tabs.tsx`), from a timer: inside `act`, which React 16
        // and 17 otherwise warn about.
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)) })
        expect(screen.queryByLabelText('Inner')).toBeNull()
        expect(calls[calls.length - 1]).toEqual([])
    })
})

