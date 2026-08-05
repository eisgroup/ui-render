import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Upload from '../Upload'
import { AppContext } from '../../../../contexts'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

const renderUpload = (props = {}, app = { setPopupState: jest.fn() }) => {
    const result = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={app}>
                <Upload fileType="image" name="attachment" {...props} />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...result, app }
}

describe('Upload interaction contracts', () => {
    it('reports a rejected file format instead of invoking the change callback', () => {
        const onChange = jest.fn()
        const { container, app } = renderUpload({ formats: ['png'], onChange })
        const invalidFile = new File(['plain text'], 'notes.txt', { type: 'text/plain' })

        fireEvent.drop(container.querySelector('.upload__dropzone'), {
            dataTransfer: { files: [invalidFile] },
        })

        expect(onChange).not.toHaveBeenCalled()
        expect(app.setPopupState).toHaveBeenCalledWith(expect.objectContaining({
            title: expect.any(String),
            content: expect.any(Object),
        }))
    })

    it('exposes drag focus state and balances focus/blur callbacks', () => {
        const onFocus = jest.fn()
        const onBlur = jest.fn()
        const { container } = renderUpload({ onFocus, onBlur })
        const zone = container.querySelector('.upload__dropzone')

        fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })
        expect(zone).toHaveClass('active')
        expect(onFocus).toHaveBeenCalledTimes(1)

        fireEvent.dragLeave(zone, { dataTransfer: { files: [] } })
        expect(zone).not.toHaveClass('active')
        expect(onBlur).toHaveBeenCalledTimes(1)
    })

    it.each(['disabled', 'readonly'])('makes a %s upload unfocusable and inert', mode => {
        const onChange = jest.fn()
        const { container } = renderUpload({ [mode]: true, onChange })
        const zone = container.querySelector('.upload__dropzone')
        const input = container.querySelector('input[type="file"]')

        expect(zone).toHaveAttribute('tabindex', '-1')
        expect(zone).toHaveClass(mode)
        expect(input).toBeDisabled()

        fireEvent.drop(zone, {
            dataTransfer: {
                files: [new File(['image'], 'photo.png', { type: 'image/png' })],
            },
        })
        expect(onChange).not.toHaveBeenCalled()
    })

    it('derives route defaults and does not open the picker for unrelated keys', () => {
        const { container } = renderUpload({ fileType: undefined, location: { pathname: '/json' } })
        const zone = container.querySelector('.upload__dropzone')
        const input = container.querySelector('input[type="file"]')
        const click = jest.spyOn(input, 'click')

        expect(input).toHaveAttribute('accept', '.json')
        expect(screen.getAllByText('json', { exact: false })).not.toHaveLength(0)

        fireEvent.keyPress(zone, { key: 'Space', code: 'Space', charCode: 32 })
        expect(click).not.toHaveBeenCalled()
    })

    it('renders a custom hover instruction without replacing the format list', () => {
        const { container } = renderUpload({
            formats: ['csv', 'json'],
            labelOnHover: 'Drop a report here',
        })

        expect(screen.getByText('Drop a report here')).toBeInTheDocument()
        expect(container.querySelector('.dropzone__hover')).toHaveTextContent('csv, json')
    })
})
