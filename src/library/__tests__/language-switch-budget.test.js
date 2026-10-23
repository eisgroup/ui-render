/**
 * WHAT A SWITCH OF LANGUAGE COSTS IN A 50-ROW TABLE, AND WHAT A HOST'S RENDER COSTS, pinned (2026-10-23).
 * =============================================================================================
 *
 * A switch renders again what shows a translated text, and nothing else: each field once, as its translator
 * is a new prop, and each `Text` once, as it reads the document's translator from the context. The document
 * commits once, and the host hears nothing: no `onDataChanged`, and no `getValidationErrors` while no field
 * shows an error. A keystroke after it costs what it cost before it (`render-budget.test.js`).
 *
 * A host's render that hands the document the same props renders none of it. Until 2026-10-23 `AppProvider`
 * made new context values on every render, and every `Text` rendered again: measured on this table, 52 of
 * them, its 50 cells and its 2 headers, on every render of the host.
 *
 * Measured on React 16.14, 17.0.2, 18.3.1 and 19.3.0, which agree. A number that falls is progress: lower it
 * here. One that rises is a regression.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'

/** Every render of each text field's `Input`, and of each `Text`. */
const mockRenders = { input: 0, text: 0 }
jest.mock('../../core/components/Input', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Input')
    const Input = props => {
        mockRenders.input += 1
        return React.createElement(actual.Input, props)
    }
    return { __esModule: true, ...actual, Input }
})
jest.mock('../../core/components/Text', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Text')
    // Memoised as `Text` is, and calling its function rather than rendering it: the contexts it reads are then
    // read here, so a render a context brings about is counted too.
    const Text = React.memo(props => {
        mockRenders.text += 1
        return actual.default.type(props)
    })
    return { __esModule: true, ...actual, default: Text }
})

const ROWS = 50
const meta = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'title', label: 'Title', renderCell: { view: 'Input', name: 'title', placeholder: 'Type a title' } },
        { id: 'note', label: 'Note' },
    ],
}
const data = { rows: Array.from({ length: ROWS }, (_, i) => ({ title: `row ${i}`, note: `note ${i}` })) }

const RESOURCES = { en: {}, de: { Note: 'Notiz', Title: 'Titel', 'Type a title': 'Titel eingeben' } }
const i18n = { language: 'en' }
/** An i18next-based host's `t`: one function, which answers in the language its i18n is in now. */
const t = key => (key in RESOURCES[i18n.language] ? RESOURCES[i18n.language][key] : key)

beforeEach(() => {
    jest.useFakeTimers()
    i18n.language = 'en'
})

afterEach(() => {
    jest.useRealTimers()
})

/** The document, mounted as a host mounts it, and what each step costs. */
function mount () {
    const counts = { commits: 0, changed: 0, reported: 0 }
    const onDataChanged = () => { counts.changed += 1 }
    const getValidationErrors = () => { counts.reported += 1 }
    const host = language => (
        <React.Profiler id="document" onRender={() => { counts.commits += 1 }}>
            <UIRender
                meta={meta} data={data} initialValues={data} translate={t} language={language}
                onDataChanged={onDataChanged} getValidationErrors={getValidationErrors}
            />
        </React.Profiler>
    )
    const view = render(host('en'))
    act(() => { jest.runOnlyPendingTimers() })
    /** What `step` costs. */
    const cost = step => {
        Object.assign(mockRenders, { input: 0, text: 0 })
        Object.assign(counts, { commits: 0, changed: 0, reported: 0 })
        step()
        act(() => { jest.runOnlyPendingTimers() })
        return { fields: mockRenders.input, texts: mockRenders.text, ...counts }
    }
    return { cost, rerender: language => view.rerender(host(language)) }
}

describe('a 50-row table of fields, with a column of text', () => {
    it('renders each field and each text once for a switch of language, and tells the host nothing', () => {
        const { cost, rerender } = mount()

        const switched = cost(() => {
            i18n.language = 'de'
            rerender('de')
        })

        // 50 cells and 2 headers.
        expect(switched).toEqual({ fields: ROWS, texts: ROWS + 2, commits: 1, changed: 0, reported: 0 })
        expect(screen.getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Titel', 'Notiz'])
        expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('placeholder', 'Titel eingeben')
    })

    it('costs a keystroke after the switch what it cost before it', () => {
        const { cost, rerender } = mount()
        const keystroke = () => { fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'row 0!' } }) }
        const before = cost(keystroke)

        cost(() => {
            i18n.language = 'de'
            rerender('de')
        })

        expect(cost(() => { fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'row 1!' } }) })).toEqual(before)
        expect(before).toEqual({ fields: 1, texts: 0, commits: 1, changed: 1, reported: 0 })
    })

    it('renders none of the document for a host\'s render that hands it the same props', () => {
        const { cost, rerender } = mount()

        expect(cost(() => { rerender('en') })).toEqual({ fields: 0, texts: 0, commits: 1, changed: 0, reported: 0 })
    })
})
