import React, { createRef } from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Upload from '../Upload'
import { AppContext } from '../../../../contexts'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

const wrap = (ui, appCtx = { setPopupState: jest.fn() }) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appCtx}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

function makeFile (name, type = 'image/png', size = 10) {
    return new File(['x'.repeat(size)], name, { type })
}

describe('Upload', () => {
    it('renders the upload wrapper', () => {
        const { container } = render(wrap(<Upload fileType="image" name="img" />))
        expect(container.querySelector('.app__upload')).toBeInTheDocument()
    })

    it('renders header when hasHeader is true', () => {
        const { container } = render(wrap(<Upload fileType="image" hasHeader name="img" />))
        expect(container.querySelector('h2')).toBeInTheDocument()
    })

    it('renders close button when onClose is given', () => {
        const onClose = jest.fn()
        const { container } = render(wrap(<Upload fileType="image" onClose={onClose} name="img" />))
        const close = container.querySelector('.app__view--close')
        expect(close).toBeInTheDocument()
        fireEvent.click(close)
        expect(onClose).toHaveBeenCalled()
    })

    it('renders types hint when showTypes (default) is true', () => {
        const { container } = render(wrap(<Upload fileType="image" name="img" />))
        expect(container.querySelector('.dropzone__hover')).toBeInTheDocument()
    })

    it('hides types hint when showTypes=false', () => {
        const { container } = render(
            wrap(<Upload fileType="image" name="img" showTypes={false} />)
        )
        expect(container.querySelector('.dropzone__hover')).not.toBeInTheDocument()
    })

    it('renders loading overlay when loading', () => {
        const { container } = render(wrap(<Upload fileType="image" name="img" loading />))
        expect(container.querySelector('.app__loading')).toBeInTheDocument()
    })

    it('invokes onChange via the drop path with accepted files', () => {
        // Use a plain function rather than jest.fn() — the project's isFunction()
        // does a strict `constructor === Function` check that fails for jest mocks
        // because of cross-realm constructor mismatch.
        const calls = []
        const onChange = function (...args) { calls.push(args) }
        const { container } = render(
            wrap(<Upload fileType="image" name="img" formats={['png']} onChange={onChange} />)
        )
        const file = makeFile('a.png')
        fireEvent.drop(container.querySelector('.upload__dropzone'), {
            dataTransfer: { files: [file] },
        })
        expect(calls.length).toBe(1)
        const [filesArg, nameArg] = calls[0]
        expect(filesArg[0]).toBe(file)
        expect(nameArg).toBe('img')
    })

    it('shows popup when file is too large', () => {
        const ctx = { setPopupState: jest.fn() }
        const { container } = render(
            wrap(<Upload fileType="image" name="img" maxSize={5} onChange={() => {}} />, ctx)
        )
        const big = makeFile('big.png', 'image/png', 100)
        fireEvent.drop(container.querySelector('.upload__dropzone'), {
            dataTransfer: { files: [big] },
        })
        expect(ctx.setPopupState).toHaveBeenCalled()
        expect(ctx.setPopupState.mock.calls[0][0].title).toBeTruthy()
    })

    it('renders children when provided', () => {
        const { getByText } = render(
            wrap(
                <Upload fileType="image" name="img">
                    <span>custom</span>
                </Upload>
            )
        )
        expect(getByText('custom')).toBeInTheDocument()
    })

    it('handleKeyPress opens dropzone on Enter', () => {
        const ref = createRef()
        // Render with ref to grab the Upload instance via a wrapper class
        class Wrapper extends React.Component {
            ref = createRef()
            render () {
                return <Upload ref={this.ref} fileType="image" name="img" />
            }
        }
        const wrapper = render(wrap(<Wrapper ref={ref} />))
        const div = wrapper.container.querySelector('.upload__dropzone')
        const input = wrapper.container.querySelector('input[type="file"]')
        const spy = jest.spyOn(input, 'click')
        fireEvent.keyPress(div, { key: 'Enter', code: 'Enter', charCode: 13 })
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})
