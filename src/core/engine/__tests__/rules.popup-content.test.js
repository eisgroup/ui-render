/**
 * SWITCHING FROM ONE ROW'S POPUP TO ANOTHER'S SHOWS THE SECOND ROW'S VALUES.
 * =============================================================================================
 *
 * `createPopupContent` makes a fresh component type for every template popup, and this is why.
 * Measured while §9.3 step 2 lifted the class out of `POPUP_OPEN`: with ONE shared type, opening
 * row 1's popup while row 0's is still open makes React update the content in place. The input is
 * renamed for row 1 but keeps its DOM value, so it shows row 0's edit. The form data stays right,
 * which is exactly why nothing else in the suite noticed.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import UIRender, { formsStorage } from '../rules' // eslint-disable-line import/first
import { AppProvider } from '../../providers' // eslint-disable-line import/first

const meta = {
    view: 'Col',
    items: [
        {
            view: 'Table',
            name: 'dataKind.rows',
            relativeData: false,
            headers: [{ id: 'label', label: 'Label' }, { id: 'act', label: '' }],
            renderItemCells: {
                view: 'Data',
                kind: 'rows',
                embedded: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Text', name: 'label' },
                        { view: 'Popup', id: 'edit.{index}', title: 'Edit row', items: [{ view: 'Input', name: 'note' }] },
                        { view: 'Button', children: 'Edit', onClick: { name: 'popupOpen', args: ['edit.{index}'] } },
                    ],
                },
            },
        },
    ],
}

const data = { dataKind: { rows: [{ label: 'first', note: 'n0' }, { label: 'second', note: 'n1' }] } }

describe('the content of a template popup', () => {
    let popupRoot

    beforeEach(() => {
        formsStorage.clear()
        popupRoot = document.createElement('div')
        popupRoot.id = 'render-popup-root'
        document.body.appendChild(popupRoot)
    })

    afterEach(() => {
        popupRoot.remove()
    })

    const popupInputs = () => Array.from(popupRoot.querySelectorAll('input'))
        .map(input => [input.getAttribute('name'), input.value])

    it('shows the second row once it replaces an edited first row without closing', () => {
        let readFormData
        const { container } = render(
            <AppProvider>
                <UIRender form meta={meta} data={data} initialValues={data} onSubmit={() => {}}
                    getFormData={getter => { readFormData = getter }}/>
            </AppProvider>
        )
        const editButtons = () => Array.from(container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Edit'))

        act(() => { fireEvent.click(editButtons()[0]) })
        const input = popupRoot.querySelector('input')
        act(() => {
            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'edited0' } })
        })
        expect(popupInputs()).toEqual([['dataKind.rows[0].note', 'edited0']])

        act(() => { fireEvent.click(editButtons()[1]) })

        expect(popupInputs()).toEqual([['dataKind.rows[1].note', 'n1']])
        expect(readFormData().dataKind.rows.map(row => row.note)).toEqual(['edited0', 'n1'])
    })

    it('shows the edit again when the first row is reopened', () => {
        const { container } = render(
            <AppProvider>
                <UIRender form meta={meta} data={data} initialValues={data} onSubmit={() => {}}/>
            </AppProvider>
        )
        const editButtons = () => Array.from(container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Edit'))

        act(() => { fireEvent.click(editButtons()[0]) })
        const input = popupRoot.querySelector('input')
        act(() => {
            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'edited0' } })
        })
        act(() => { fireEvent.click(editButtons()[1]) })
        act(() => { fireEvent.click(editButtons()[0]) })

        expect(popupInputs()).toEqual([['dataKind.rows[0].note', 'edited0']])
    })
})
