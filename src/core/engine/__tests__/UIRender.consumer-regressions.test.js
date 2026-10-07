import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import util from 'util'
import UIRender from '../../../library'

/**
 * Regression guards driven through the published `UIRender` entry rather than a leaf component,
 * because each of these only misbehaves once the engine supplies the surrounding context.
 */

const inputNames = root => Array.from(root.querySelectorAll('input')).map(i => i.getAttribute('name'))

describe('UI Render consumer-level regression guards', () => {
    afterEach(() => {
        jest.restoreAllMocks()
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

    it('keeps the fields of a named Data block under their own names, the keys its payload carries', () => {
        // `name` selects what the block's views display, and its fields keep their own names from the
        // root of the form's values: this one shows and writes `field`, not `nested.field`, while the
        // Text beside it shows the nested value. That reads as a defect, and was reported as one on
        // 2026-10-06; it stays, because those names are the keys a host receives, as the guard above
        // pins for a block whose bound value is null.
        const meta = {
            view: 'Col',
            items: [{
                view: 'Data', kind: 'sect', name: 'nested',
                meta: {view: 'Col', items: [{view: 'Text', name: 'field', className: 'shown'}, {view: 'Input', name: 'field'}]},
            }],
        }
        const data = {field: 'ROOT', nested: {field: 'Inner'}}
        let getFormData
        const {container} = render(<UIRender meta={meta} data={data} initialValues={data} getFormData={f => { getFormData = f }}/>)

        expect(inputNames(container)).toEqual(['field'])
        expect(container.querySelector('input')).toHaveValue('ROOT')
        expect(container.querySelector('.shown')).toHaveTextContent('Inner')
        const input = container.querySelector('input')
        fireEvent.focus(input)
        fireEvent.change(input, {target: {value: 'typed'}})
        fireEvent.blur(input)
        expect(getFormData()).toEqual({field: 'typed', nested: {field: 'Inner'}})
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
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
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
        // The button's `{index}` is its row since 2026-10-06, as a nested button's always was, so the
        // engine says what it says of any row popup with no path: its field binds at the root.
        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('POPUP_OPEN: "edit.1"'))
    })

    it('gives a handler at the root of a `render*` definition its row, as one nested in it has', () => {
        // The root's handlers were bound once, outside any row, so `{index}` stayed as written: this
        // popup opened with no row, and its field bound to `rows.note` instead of `rows[1].note`.
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
                                onClick: {name: 'popupOpen', args: ['edit.{index}', {relativePath: 'rows'}]},
                            },
                        },
                    ],
                },
            ],
        }
        const data = {rows: [{a: 'x', note: 'n0'}, {a: 'y', note: 'n1'}]}
        const {container} = render(<UIRender meta={meta} data={data} initialValues={data}/>)

        const openButtons = Array.from(container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Open'))
        act(() => { fireEvent.click(openButtons[1]) })

        expect(inputNames(document.body)).toContain('rows[1].note')
        expect(document.querySelector('input[name="rows[1].note"]')).toHaveValue('n1')
    })

    it('never scopes a popup to a path that only exists in the data', () => {
        const meta = {
            view: 'Col',
            items: [
                {view: 'Popup', id: 'edit.{index}', title: 'Edit', items: [{view: 'Input', name: 'note'}]},
                {
                    view: 'Table', name: 'rows',
                    headers: [{id: 'a', label: 'A'}, {id: 'act', label: 'Act'}],
                    // The button must sit in the row cells, not in a header's renderCell: only this path
                    // interpolates the clicked row index, which is what the removed guess keyed on.
                    renderItemCells: {
                        view: 'TableCells',
                        items: [
                            {view: 'Text', name: 'a'},
                            {
                                view: 'Button', children: 'Open',
                                onClick: {name: 'popupOpen', args: ['edit.{index}']},
                            },
                        ],
                    },
                },
            ],
        }
        // These two paths are quoted verbatim because they are exactly what the removed fallback probed.
        // A neutral name here would leave the guess dormant and the test would pass either way.
        const data = {
            rows: [{a: 'x', note: 'n0'}, {a: 'y', note: 'n1'}],
            experienceRatingInputs: {
                overrideOptions: [{note: 'other0'}, {note: 'other1'}],
                uwOverridesCommon: [{note: 'more0'}, {note: 'more1'}],
            },
        }
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const {container} = render(<UIRender meta={meta} data={data} initialValues={data}/>)

        const openButtons = Array.from(container.querySelectorAll('button'))
            .filter(button => button.textContent.includes('Open'))
        act(() => { fireEvent.click(openButtons[1]) })

        // The engine used to guess the popup's scope by probing the data for those two field names.
        // With this data present the guess "succeeded" and bound the popup to a table the button had
        // nothing to do with, so the user's edit landed in that other table's row.
        const names = inputNames(document.body)
        expect(names).toContain('note')
        expect(names.some(name => name && name.startsWith('experienceRatingInputs'))).toBe(false)
        // Unresolved scope is reported instead of guessed.
        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('POPUP_OPEN: "edit.1"'))
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

    it('applies a click on a controlled ProgressSteps even when data re-renders inside the transition', () => {
        jest.useFakeTimers()
        const meta = {
            view: 'ProgressSteps',
            activeIndex: {name: '{state.step,0}'},
            onChange: {name: 'setState', args: ['step']},
            items: [
                {label: 'One', content: {view: 'Text', children: 'S1'}},
                {label: 'Two', content: {view: 'Text', children: 'S2'}},
                {label: 'Three', content: {view: 'Text', children: 'S3'}},
            ],
        }
        const view = render(<UIRender meta={meta} data={{n: 1}}/>)

        fireEvent.click(view.container.querySelectorAll('.app__progress__step button')[2])
        act(() => { jest.advanceTimersByTime(10) })
        // Controlled, every parent render used to supersede the pending click, even with the
        // index unchanged, so the host's new data dropped it; the step never reached the state.
        view.rerender(<UIRender meta={meta} data={{n: 2}}/>)
        act(() => { jest.advanceTimersByTime(200) })

        expect(view.container.querySelector('.tabs__content')).toHaveTextContent('S3')
        jest.useRealTimers()
    })

    it('submits a form whose host passes no onSubmit without printing its values', async () => {
        // The default was `console.warn` until 2026-10-06: every value of the form, on the console.
        const printed = []
        for (const level of ['log', 'info', 'warn', 'error']) {
            jest.spyOn(console, level).mockImplementation((...args) => { printed.push(util.inspect(args, {depth: 3})) })
        }
        const meta = {view: 'Col', items: [
            {view: 'Input', name: 'secret'},
            {view: 'Button', children: 'Send', onClick: 'submit'},
        ]}
        const values = {secret: 'kept-off-the-console'}
        const {getByText} = render(<UIRender form meta={meta} data={values} initialValues={values}/>)

        await act(async () => { fireEvent.click(getByText('Send')) })

        expect(printed.filter(line => line.includes('kept-off-the-console'))).toEqual([])
    })
})
