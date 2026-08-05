import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'
import LocalDraftTableRow from '../LocalDraftTableRow'

const mockPush = jest.fn()

jest.mock('../../dataKindPush', () => ({
    ...jest.requireActual('../../dataKindPush'),
    pushDataKindRow: (...args) => mockPush(...args),
}))

const renderDraft = props => render(
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

const inputMeta = (definition, onClick = 'addData') => ({
    view: 'TableCells',
    relativePath: 'dataKind.rows',
    items: [
        definition,
        { view: 'Button', onClick, children: 'Add draft' },
    ],
})

describe('LocalDraftTableRow edge contracts', () => {
    beforeEach(() => {
        mockPush.mockReset()
        mockPush.mockReturnValue(true)
    })

    it('retains the draft when the parent form cannot append the row', () => {
        mockPush.mockReturnValue(false)
        renderDraft({
            meta: inputMeta({ view: 'Input', name: 'label', validate: 'required' }),
            kind: 'rows',
            parentInstance: {},
        })
        const input = document.querySelector('input[name="label"]')
        fireEvent.change(input, { target: { value: 'Unsaved draft' } })

        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(input).toHaveValue('Unsaved draft')
    })

    it('clears the draft only after a successful append', () => {
        renderDraft({
            meta: inputMeta({ view: 'Input', name: 'label', validate: 'required' }),
            kind: 'rows',
            parentInstance: {},
        })
        const input = document.querySelector('input[name="label"]')
        fireEvent.change(input, { target: { value: 'Saved draft' } })

        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))

        expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
            kind: 'rows',
            rowObject: { label: 'Saved draft' },
            fallbackDataKindPath: '',
        }))
        expect(input).toHaveValue('')
    })

    it('parses integer input nested in Col3 and ignores unsupported sibling meta', () => {
        const meta = {
            view: 'TableCells',
            items: [
                {
                    view: 'Col3',
                    items: [
                        { view: 'Input', name: 'quantity', type: 'number', format: 'integer' },
                        { view: 'Text', children: 'Ignored decoration' },
                    ],
                },
                { view: 'UnknownWidget' },
                { view: 'Button', onClick: { name: 'addData' }, children: 'Add draft' },
            ],
        }
        renderDraft({ meta, kind: 'rows', parentInstance: {} })

        fireEvent.change(document.querySelector('input[name="quantity"]'), {
            target: { value: '7.8' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))

        expect(mockPush.mock.calls[0][0].rowObject).toEqual({ quantity: 7 })
    })

    it('shows a custom validator error and clears it as soon as the field changes', () => {
        const validate = value => value === 'allowed' ? undefined : 'Value is blocked'
        renderDraft({
            meta: inputMeta({ view: 'Input', name: 'status', validate }),
            kind: 'rows',
            parentInstance: {},
        })
        const input = document.querySelector('input[name="status"]')
        fireEvent.change(input, { target: { value: 'blocked' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))

        expect(screen.getByText('Value is blocked')).toBeInTheDocument()
        expect(mockPush).not.toHaveBeenCalled()

        fireEvent.change(input, { target: { value: 'allowed' } })
        expect(screen.queryByText('Value is blocked')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))
        expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it.each([
        ['an unknown name', 'unknownRule'],
        ['a malformed object', { name: 'required' }],
    ])('treats %s validator as optional instead of blocking add', (_, validate) => {
        renderDraft({
            meta: inputMeta({ view: 'Input', name: 'legacy', validate }),
            kind: 'rows',
            parentInstance: {},
        })

        fireEvent.click(screen.getByRole('button', { name: 'Add draft' }))

        expect(mockPush.mock.calls[0][0].rowObject).toEqual({ legacy: undefined })
    })

    it('does not render or execute a button whose action is not addData', () => {
        const { container } = renderDraft({
            meta: inputMeta(
                { view: 'Input', name: 'label' },
                { name: 'removeData' }
            ),
            kind: 'rows',
            parentInstance: {},
        })

        expect(container.querySelector('button')).not.toBeInTheDocument()
        expect(mockPush).not.toHaveBeenCalled()
    })
})
