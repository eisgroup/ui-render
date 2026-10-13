/**
 * A document's fields register silently while its first render mounts (`createBatchedForm`, 2026-10-13). A field
 * that goes later must still tell the form's listeners what final-form tells them when a field that is not silent
 * goes: that its validator went with it, and with it the field's error.
 *
 * A tab switch is the case where nothing else does. It changes no value, so the field going is the only thing that
 * happens to the form, and a field unregistered silently would leave the form's listeners with a form that is not
 * valid. Removing a row is not such a case, and is checked too: the removal changes the form's values, and its
 * listeners hear the state that follows from that.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../../../../library/main'
import { formsStorage } from '../../../state/formRegistry'

/** The one form in the registry whose values hold `key`, and the `valid` its listeners last heard. */
function formHolding (key) {
    const form = [...formsStorage.values()].map(entry => entry.form).find(candidate => key in candidate.getState().values)
    const heard = []
    act(() => { form.subscribe(state => { heard.push(state.valid) }, { valid: true }) })
    return { form, heard }
}

describe('a document whose fields registered silently as it mounted', () => {
    it('tells the form\'s listeners it is valid when a tab switch takes its only invalid field away', async () => {
        const meta = {
            view: 'Tabs',
            items: [
                { tab: 'A', content: { view: 'Input', name: 'a', label: 'A field', validate: 'required' } },
                { tab: 'B', content: { view: 'Text', children: 'Nothing here' } },
            ],
        }
        render(<UIRender meta={meta} data={{ a: '' }} initialValues={{ a: '' }} onSubmit={() => {}} />)
        const { form, heard } = formHolding('a')
        expect(heard).toEqual([false])

        fireEvent.click(screen.getByRole('tab', { name: 'B' }))
        // The tab changes after its 50 ms transition (`Tabs.tsx`), from a timer.
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)) })

        expect(screen.queryByLabelText('A field')).toBeNull()
        expect(form.getState().valid).toBe(true)
        expect(heard[heard.length - 1]).toBe(true)
    })

    it('tells them so when the row with the empty required field is removed', () => {
        jest.useFakeTimers()
        try {
            const meta = {
                view: 'Table',
                name: 'dataKind.items',
                headers: [{ id: 'title', label: 'Title' }, { id: 'remove', label: 'Remove' }],
                renderItemCells: {
                    view: 'Data',
                    kind: 'items',
                    embedded: true,
                    meta: {
                        view: 'TableCells',
                        items: [
                            { view: 'Input', name: 'title', validate: 'required' },
                            { view: 'Button', children: 'Remove', onClick: { name: 'removeData' } },
                        ],
                    },
                },
            }
            const data = () => ({ dataKind: { items: [{ title: 'A' }, { title: '' }, { title: 'C' }] } })
            render(<UIRender meta={meta} data={data()} initialValues={data()} onSubmit={() => {}} />)
            act(() => { jest.runOnlyPendingTimers() })
            const { form, heard } = formHolding('dataKind')
            expect(heard).toEqual([false])

            fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1])
            act(() => { jest.runOnlyPendingTimers() })

            expect(form.getState().values.dataKind.items).toEqual([{ title: 'A' }, { title: 'C' }])
            expect(form.getState().valid).toBe(true)
            expect(heard[heard.length - 1]).toBe(true)
        } finally {
            jest.useRealTimers()
        }
    })
})
