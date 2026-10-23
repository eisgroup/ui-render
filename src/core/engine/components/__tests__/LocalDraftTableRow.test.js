import React from 'react'
import { act, render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'
import LocalDraftTableRow from '../LocalDraftTableRow'

const mockPush = jest.fn()

jest.mock('../../dataKindPush', () => {
    const actual = jest.requireActual('../../dataKindPush')
    return {
        ...actual,
        pushDataKindRow: (...args) => mockPush(...args),
    }
})

function renderDraft (props) {
    return render(
        <ConfigContext.Provider value={initialConfigState}>
            <table>
                <tbody>
                    <tr>
                        <LocalDraftTableRow {...props} />
                    </tr>
                </tbody>
            </table>
        </ConfigContext.Provider>
    )
}

const simpleMeta = {
    view: 'TableCells',
    items: [
        { view: 'Input', name: 'periodName', type: 'text', validate: 'required' },
        { view: 'Input', name: 'weight', type: 'number', validate: 'required' },
        {
            view: 'VerticalLayout',
            items: [
                {
                    view: 'Button',
                    onClick: { name: 'addData' },
                    children: 'Add row',
                },
            ],
        },
    ],
}

describe('LocalDraftTableRow', () => {
    beforeEach(() => {
        mockPush.mockClear()
    })

    it('does not call pushDataKindRow when required fields are empty', () => {
        renderDraft({
            meta: simpleMeta,
            kind: 'experiencePeriods',
            parentInstance: { getDataKind: () => [] },
        })
        fireEvent.click(screen.getByRole('button', { name: /add row/i }))
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('calls pushDataKindRow with parsed row when validation passes', () => {
        renderDraft({
            meta: simpleMeta,
            kind: 'experiencePeriods',
            parentInstance: { getDataKind: () => [] },
        })
        fireEvent.change(document.querySelector('input[name="periodName"]'), { target: { value: 'New' } })
        fireEvent.change(document.querySelector('input[name="weight"]'), { target: { value: '0.5' } })
        fireEvent.click(screen.getByRole('button', { name: /add row/i }))
        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush.mock.calls[0][0]).toMatchObject({
            kind: 'experiencePeriods',
            rowObject: { periodName: 'New', weight: 0.5 },
        })
    })

    it('runs verify notWithinRange using getDataKind and blocks overlapping period', () => {
        const meta = {
            view: 'TableCells',
            items: [
                {
                    view: 'Input',
                    name: 'startDate',
                    type: 'text',
                    validate: 'required',
                    verify: {
                        dataKind: 'experiencePeriods',
                        validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }],
                    },
                },
                {
                    view: 'Input',
                    name: 'endDate',
                    type: 'text',
                    validate: 'required',
                    verify: {
                        dataKind: 'experiencePeriods',
                        validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }],
                    },
                },
                {
                    view: 'VerticalLayout',
                    items: [{ view: 'Button', onClick: { name: 'addData' }, children: 'Add' }],
                },
            ],
        }
        const parentInstance = {
            getDataKind: () => [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
        }
        renderDraft({ meta, kind: 'experiencePeriods', parentInstance })
        fireEvent.change(document.querySelector('input[name="startDate"]'), { target: { value: '2025-06-01' } })
        fireEvent.change(document.querySelector('input[name="endDate"]'), { target: { value: '2025-06-30' } })
        fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('allows add when verify passes for non-overlapping dates', () => {
        const meta = {
            view: 'TableCells',
            items: [
                {
                    view: 'Input',
                    name: 'startDate',
                    type: 'text',
                    validate: 'required',
                    verify: {
                        dataKind: 'experiencePeriods',
                        validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }],
                    },
                },
                {
                    view: 'Input',
                    name: 'endDate',
                    type: 'text',
                    validate: 'required',
                    verify: {
                        dataKind: 'experiencePeriods',
                        validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }],
                    },
                },
                {
                    view: 'VerticalLayout',
                    items: [{ view: 'Button', onClick: { name: 'addData' }, children: 'Add' }],
                },
            ],
        }
        const parentInstance = {
            getDataKind: () => [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
        }
        renderDraft({ meta, kind: 'experiencePeriods', parentInstance })
        fireEvent.change(document.querySelector('input[name="startDate"]'), { target: { value: '2026-01-01' } })
        fireEvent.change(document.querySelector('input[name="endDate"]'), { target: { value: '2026-12-31' } })
        fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
        expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it('renders InputDate for type date (picker path)', () => {
        const meta = {
            view: 'TableCells',
            items: [
                { view: 'Input', name: 'startDate', type: 'date', format: 'date', validate: 'required' },
                {
                    view: 'VerticalLayout',
                    items: [{ view: 'Button', onClick: { name: 'addData' }, children: 'Add' }],
                },
            ],
        }
        const { container } = renderDraft({
            meta,
            kind: 'experiencePeriods',
            parentInstance: { getDataKind: () => [] },
        })
        expect(container.querySelector('.ui-render-picker')).toBeInTheDocument()
    })

    describe('a date cell left with text that is no date', () => {
        const meta = {
            view: 'TableCells',
            items: [
                { view: 'Input', name: 'startDate', type: 'date', validate: 'required' },
                { view: 'Input', name: 'endDate', type: 'date' },
                { view: 'VerticalLayout', items: [{ view: 'Button', onClick: { name: 'addData' }, children: 'Add' }] },
            ],
        }
        // As a user types, and as long as rc-picker takes to confirm a date once the field is left.
        const typeAndLeave = async (name, text) => {
            const input = document.querySelector(`input[name="${name}"]`)
            act(() => input.focus())
            fireEvent.change(input, { target: { value: text } })
            act(() => input.blur())
            await act(() => new Promise(resolve => setTimeout(resolve, 100)))
        }
        const shown = name => document.querySelector(`input[name="${name}"]`).closest('.input--wrapper').querySelector('.field-help')

        it('holds Add back, and says Invalid date, in an optional cell too', async () => {
            renderDraft({ meta, kind: 'experiencePeriods', parentInstance: { getDataKind: () => [] } })
            await typeAndLeave('startDate', '03-01-2026')
            await typeAndLeave('endDate', '02-30-2026')

            fireEvent.click(screen.getByRole('button', { name: /^add$/i }))

            expect(mockPush).not.toHaveBeenCalled()
            expect(document.querySelector('input[name="endDate"]')).toHaveValue('02-30-2026')
            expect(shown('endDate')).toHaveTextContent('Invalid date')
            expect(shown('startDate')).toBeNull()
        })

        it('adds the row once the text is corrected', async () => {
            renderDraft({ meta, kind: 'experiencePeriods', parentInstance: { getDataKind: () => [] } })
            await typeAndLeave('startDate', '03-01-2026')
            await typeAndLeave('endDate', '02-30-2026')
            fireEvent.click(screen.getByRole('button', { name: /^add$/i }))

            await typeAndLeave('endDate', '03-31-2026')
            expect(shown('endDate')).toBeNull()
            fireEvent.click(screen.getByRole('button', { name: /^add$/i }))

            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush.mock.calls[0][0].rowObject).toEqual({ startDate: '2026-03-01', endDate: '2026-03-31' })
        })
    })

    it('returns null when meta has no items', () => {
        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                <LocalDraftTableRow meta={{ view: 'TableCells' }} kind="k" parentInstance={{}} />
            </ConfigContext.Provider>
        )
        expect(container).toBeEmptyDOMElement()
    })
})
