import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../../../../library'

/**
 * Regression guards driven through the published `UIRender` entry rather than a leaf component,
 * because each of these only misbehaves once the engine supplies the surrounding context.
 */

const inputNames = root => Array.from(root.querySelectorAll('input')).map(i => i.getAttribute('name'))

describe('UI Render consumer-level regression guards', () => {
    beforeAll(() => {
        global.fetch = () => Promise.resolve({json: () => Promise.resolve({})})
    })

    afterAll(() => {
        delete global.fetch
    })

    it('renders the nested fields of a Data block whose bound value is null', () => {
        const meta = {
            view: 'Col',
            items: [
                {view: 'Input', name: 'topLevel'},
                {
                    view: 'Data', kind: 'sect', name: 'section',
                    meta: {view: 'Col', items: [{view: 'Input', name: 'inner'}]},
                },
            ],
        }
        const {container} = render(
            <UIRender meta={meta} data={{topLevel: 'T', inner: 'ROOT-INNER', section: null}}/>
        )

        // Dropping the fallback made the whole block disappear: its input never mounted, so the
        // user could not fill it and its key never reached the submitted payload.
        expect(inputNames(container)).toEqual(['topLevel', 'inner'])
    })

    it('keeps a root-level popup template off the table row path', () => {
        const meta = {
            view: 'Col',
            items: [
                {view: 'Popup', id: 'edit.{index}', title: 'Edit', items: [{view: 'Input', name: 'note'}]},
                {
                    view: 'Table', name: 'rows',
                    headers: [
                        {id: 'a', label: 'A'},
                        {
                            id: 'act', label: 'Act',
                            renderCell: {
                                view: 'Button', children: 'Open',
                                onClick: {name: 'popupOpen', args: ['edit.{index}']},
                            },
                        },
                    ],
                },
            ],
        }
        const {container} = render(
            <UIRender meta={meta} data={{rows: [{a: 'x', note: 'n0'}, {a: 'y', note: 'n1'}]}}/>
        )

        const openButtons = Array.from(container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Open'))
        act(() => { fireEvent.click(openButtons[1]) })

        // Forwarding the table's relativePath into the popup context renamed the field to
        // `rows.note`, which is neither the root field nor `rows[1].note` — writing to it threw
        // and the user's edit was discarded.
        const names = inputNames(document.body)
        expect(names).toContain('note')
        expect(names.some(name => name && name.startsWith('rows.note'))).toBe(false)
    })

    it('applies a tab click even when data re-renders inside the transition window', () => {
        jest.useFakeTimers()
        const meta = {
            view: 'Tabs',
            items: [
                {tab: 'T1', content: {view: 'Text', children: 'C1'}},
                {tab: 'T2', content: {view: 'Text', children: 'C2'}},
                {tab: 'T3', content: {view: 'Text', children: 'C3'}},
            ],
        }
        const view = render(<UIRender meta={meta} data={{n: 1}}/>)

        fireEvent.click(view.container.querySelectorAll('.tabs__item')[2])
        act(() => { jest.advanceTimersByTime(10) })
        // The mapper rebuilds `items` on every render, so this looked like an items change and
        // used to cancel the pending 50 ms transition — silently dropping the click.
        view.rerender(<UIRender meta={meta} data={{n: 2}}/>)
        act(() => { jest.advanceTimersByTime(200) })

        expect(view.container.querySelector('.tabs__content')).toHaveTextContent('C3')
        jest.useRealTimers()
    })
})
