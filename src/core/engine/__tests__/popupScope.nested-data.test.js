/**
 * A POPUP OPENED FROM INSIDE A NESTED `Data` ROW BINDS TO THAT ROW.
 * =============================================================================================
 *
 * The gap this closes was found by measuring, not by reading. §9.3 called the popup scope chain
 * "four dead branches" because none of its sources fire anywhere in the suite. Three of them are
 * reachable all the same: `engine/Data.js` passes `index` AND `relativeIndex` to every nested
 * `UIRender` it renders, so the first source resolves a real scope in a document nobody had a test
 * for. Deleting it on the strength of "no test hits this" would have been a live regression, and
 * this file is what makes that no longer a matter of argument.
 *
 * `popupScope.test.js` covers the resolver as a function. This one drives the whole path: a table
 * whose rows are nested documents, a popup declared inside the row, and a button that opens it —
 * which is the only arrangement where the nested instance has a popup template to find at all. A
 * popup declared on the ROOT document is invisible to the nested one, measured while building this:
 * the click resolves a scope, finds no template, and silently does nothing.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import UIRender from '../rules' // eslint-disable-line import/first
import { AppProvider } from '../../providers' // eslint-disable-line import/first

const inputNames = root => Array.from(root.querySelectorAll('input')).map(input => input.getAttribute('name'))

const meta = {
    view: 'Col',
    items: [
        {
            view: 'Table',
            name: 'dataKind.rows',
            relativeData: false,
            headers: [{ id: 'label', label: 'Label' }, { id: 'act', label: '' }],
            // Each row is its own nested document, which is what puts `relativeIndex` on an engine
            // instance — the prop the first scope source reads.
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

describe('a popup opened from a nested Data row', () => {
    let popupRoot

    beforeEach(() => {
        // The engine renders `Popup` itself and portals it; without the shell publishing a root on
        // the context, `Popup` falls back to this id, which is how the demo supplies one too.
        popupRoot = document.createElement('div')
        popupRoot.id = 'render-popup-root'
        document.body.appendChild(popupRoot)
    })

    afterEach(() => {
        document.body.removeChild(popupRoot)
    })

    const openRow = index => {
        const view = render(
            <AppProvider>
                <UIRender form meta={meta} data={data} initialValues={data} onSubmit={() => {}}/>
            </AppProvider>
        )
        const buttons = Array.from(view.container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Edit'))
        expect(buttons).toHaveLength(data.dataKind.rows.length)

        act(() => { fireEvent.click(buttons[index]) })
        return view
    }

    it('binds its fields to the row whose button was clicked', () => {
        openRow(1)

        expect(document.body.textContent).toContain('Edit row')
        expect(inputNames(document.body)).toEqual(['dataKind.rows[1].note'])
    })

    it('binds to the first row when that is the one clicked — not to a fixed index', () => {
        openRow(0)

        expect(inputNames(document.body)).toEqual(['dataKind.rows[0].note'])
    })
})
