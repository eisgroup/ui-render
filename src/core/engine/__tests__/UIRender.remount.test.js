/**
 * A VALUE THE USER ENTERED OUTLIVES THE FIELD THEY ENTERED IT IN.
 * =============================================================================================
 *
 * A value lives in the form, not in its field. A tab switch unmounts the fields of the tab it
 * leaves, and final-form forgets a field's state when the field's last instance unmounts. The value
 * stays in the form, and a field that mounts later for the same name shows it.
 *
 * react-final-form 7.0.1 breaks this. Its pull request #1069 made a field that mounts while
 * final-form holds no state for its name set the value back to the initial one. Upstream tracks it
 * as final-form/react-final-form#1095, and the fix, #1096, is not released.
 *
 * Each test here passes on the installed 6.5.9 and fails on 7.0.1. The form-stack upgrade waits for
 * that fix (docs/UPGRADE-PLAN.md §9.7-F4). AutoSave's part of the same upgrade is in
 * `modules/form/views/__tests__/AutoSave.test.js`.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { AppProvider } from '../../providers'

afterEach(() => {
    cleanup()
    formsStorage.clear()
})

/** Mounts a form document, and returns the reader `getFormData` hands a host. */
function mount (meta, values) {
    let readFormData
    render(
        <AppProvider>
            <UIRender form meta={meta} data={values} initialValues={values} onSubmit={() => {}}
                getFormData={getter => { readFormData = getter }}/>
        </AppProvider>
    )
    return () => readFormData()
}

/** Types a value as a user does: focus, change, blur. */
function edit (input, value) {
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value } })
    fireEvent.blur(input)
}

/** Clicks a tab and waits out the tabs' 50 ms transition, inside act, as `UIRender.form-flows` does. */
const switchTo = label => act(async () => {
    fireEvent.click(screen.getByText(label))
    await new Promise(resolve => setTimeout(resolve, 100))
})

describe('a value the user entered', () => {
    it('is still in its field after a tab switch away and back', async () => {
        const readFormData = mount({
            view: 'Tabs',
            items: [
                { tab: 'One', content: { view: 'Input', name: 'first', label: 'First' } },
                { tab: 'Two', content: { view: 'Text', children: 'Second tab' } },
            ],
        }, { first: 'A' })

        edit(screen.getByLabelText('First'), 'B')
        await switchTo('Two')
        await switchTo('One')

        expect(screen.getByLabelText('First')).toHaveValue('B')
        expect(readFormData().first).toBe('B')
    })

    it('shows in a field bound to the same name that mounts later', async () => {
        // A review tab shows, read-only, what the first tab edits. Unlike a remount, the switch unmounts
        // the first field and mounts this one in the same commit: the old field unregisters, and
        // final-form drops the name's state, after this one has rendered and before it registers.
        const readFormData = mount({
            view: 'Tabs',
            items: [
                { tab: 'Edit', content: { view: 'Input', name: 'title', label: 'Title' } },
                { tab: 'Review', content: { view: 'Input', name: 'title', label: 'Title as entered', readonly: true } },
            ],
        }, { title: 'Draft' })

        edit(screen.getByLabelText('Title'), 'Final')
        await switchTo('Review')

        expect(screen.getByLabelText('Title as entered')).toHaveValue('Final')
        expect(readFormData().title).toBe('Final')
    })

    it('is still in its table row after the table remounts', async () => {
        // A table bound by `name` renders its rows inside a FieldArray, which 7.0.1 resets as it does a
        // field: an upgrade has to keep both the row's field and the array.
        const readFormData = mount({
            view: 'Tabs',
            items: [
                {
                    tab: 'Rows',
                    content: {
                        view: 'Table',
                        name: 'rows',
                        headers: [
                            { id: 'label', label: 'Label' },
                            { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
                        ],
                    },
                },
                { tab: 'Other', content: { view: 'Text', children: 'Other tab' } },
            ],
        }, { rows: [{ label: 'first', note: 'n0' }, { label: 'second', note: 'n1' }] })
        const notes = () => screen.getAllByRole('textbox').map(input => input.value)

        edit(screen.getAllByRole('textbox')[0], 'edited')
        await switchTo('Other')
        await switchTo('Rows')

        expect(notes()).toEqual(['edited', 'n1'])
        expect(readFormData().rows.map(row => row.note)).toEqual(['edited', 'n1'])
    })
})
