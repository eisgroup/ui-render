import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { metaToProps } from '../transforms'
import UIRender from '../../pages/main/rules'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

/**
 * A `{name: ''}` value definition (e.g. a blank Table header label) must resolve to an empty
 * value, not to the whole data object.
 *
 * Regression: `get(data, '')` returned `data` itself, so such a header rendered the root data
 * object as a React child and the whole table crashed with
 * "Objects are not valid as a React child (found: object with keys ...)".
 */
const data = {
    projectTitle: 'Nested groups',
    dataKind: {
        phases: [{ title: 'Design', budget: 5000 }],
    },
}

// `rules.js` registers the global `fetch` as a field action while building its config,
// and jsdom does not provide one.
if (typeof global.fetch === 'undefined') global.fetch = () => Promise.resolve()

describe('empty `name` in a value definition', () => {
    it('resolves to an empty value, not to the data object', () => {
        const meta = metaToProps(
            { headers: [{ id: 'actions', label: { name: '' } }] },
            { data, _data: data }
        )

        expect(meta.headers[0].label).toBe('')
    })

    it('renders a Table with a blank header label', () => {
        const meta = {
            view: 'Table',
            name: 'dataKind.phases',
            headers: [
                { id: 'title', label: { name: 'Phase' } },
                { id: 'actions', label: { name: '' } },
            ],
            itemsExpanded: true,
        }

        const { getByText, container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <UIRender data={data} meta={meta} initialValues={data} translate={(v) => v}/>
            </ConfigContext.Provider>
        )

        // An unresolved header label falls back to its `name` as literal text
        expect(getByText('Phase')).toBeInTheDocument()
        // The blank header renders empty, and the row data still renders
        expect(container.querySelectorAll('thead th')).toHaveLength(2)
        expect(getByText('Design')).toBeInTheDocument()
        expect(container.textContent).not.toContain('projectTitle')
    })
})
