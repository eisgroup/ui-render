import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../../pages/main/rules'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

/**
 * A layout that declares `relativeData: false` must not force that flag onto a child
 * that declares `relativeData: true` — the child still resolves its own `name` into data.
 *
 * Regression: nested `RowList` blocks rendered empty while a sibling `Table` bound to the
 * same path kept working, because only `view: 'Table'` was exempt from the inherited flag.
 */
// `rules.js` registers the global `fetch` as a field action while building its config,
// and jsdom does not provide one.
if (typeof global.fetch === 'undefined') global.fetch = () => Promise.resolve()

const data = {
    Groups: [
        {
            Group: 'Group 1',
            Items: [
                { ItemType: 'Basic', NumberOfUnits: 1100 },
                { ItemType: 'Extended', NumberOfUnits: 4 },
            ],
        },
    ],
}

const meta = {
    view: 'VerticalLayout',
    relativeData: false,
    items: [
        {
            view: 'VerticalLayout',
            items: [
                {
                    view: 'RowList',
                    name: 'Groups[0].Items',
                    relativeData: true,
                    renderItem: {
                        view: 'VerticalLayout',
                        items: [
                            { view: 'Text', children: { name: 'ItemType', relativeData: true } },
                            { view: 'Text', children: { name: 'NumberOfUnits', relativeData: null } },
                            { view: 'Text', label: 'Enrolled Units' },
                        ],
                    },
                },
                {
                    view: 'Table',
                    name: 'Groups[0].Items',
                    headers: [
                        { id: 'ItemType', label: 'Item' },
                        { id: 'NumberOfUnits', label: 'Number of Units' },
                    ],
                    vertical: true,
                    itemsExpanded: true,
                },
            ],
        },
    ],
}

describe('relativeData inheritance', () => {
    it('renders RowList items nested under a `relativeData: false` layout', () => {
        const { getAllByText, queryAllByText } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <UIRender data={data} meta={meta} initialValues={data} translate={(v) => v}/>
            </ConfigContext.Provider>
        )

        // One block per item, each with its own values
        expect(queryAllByText('Enrolled Units')).toHaveLength(2)
        expect(getAllByText('1100').length).toBeGreaterThan(0)
        expect(getAllByText('4').length).toBeGreaterThan(0)
        // Sibling Table bound to the same path keeps working
        expect(getAllByText('Number of Units').length).toBeGreaterThan(0)
    })
})
