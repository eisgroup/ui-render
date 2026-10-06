import React, { createRef } from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dropzone from '../Dropzone'

function makeFile (name, type = 'text/plain', size = 10) {
    const file = new File(['x'.repeat(size)], name, { type })
    return file
}

describe('Dropzone', () => {
    it('renders a div wrapping a hidden file input and children', () => {
        const { container, getByText } = render(
            <Dropzone className="zone">
                <span>drag files here</span>
            </Dropzone>
        )
        expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
        expect(getByText('drag files here')).toBeInTheDocument()
    })

    it('opens the dialog for Enter and Space on the zone, and leaves other keys and inner controls alone', () => {
        const { container, getByText } = render(<Dropzone><button>inner</button></Dropzone>)
        const zone = container.firstChild
        const clickSpy = jest.spyOn(container.querySelector('input'), 'click').mockImplementation(() => {})

        fireEvent.keyDown(zone, { key: 'Enter' })
        fireEvent.keyDown(zone, { key: ' ' })
        fireEvent.keyDown(zone, { key: 'Escape' })
        fireEvent.keyDown(getByText('inner'), { key: 'Enter' })

        expect(clickSpy).toHaveBeenCalledTimes(2)
        clickSpy.mockRestore()
    })

    it('runs a caller\'s onKeyDown first, and does nothing for a key it prevented', () => {
        const seen = []
        const onKeyDown = event => { seen.push(event.key); if (event.key === ' ') event.preventDefault() }
        const { container } = render(<Dropzone onKeyDown={onKeyDown}>x</Dropzone>)
        const clickSpy = jest.spyOn(container.querySelector('input'), 'click').mockImplementation(() => {})

        fireEvent.keyDown(container.firstChild, { key: ' ' })
        fireEvent.keyDown(container.firstChild, { key: 'Enter' })

        expect(seen).toEqual([' ', 'Enter'])
        expect(clickSpy).toHaveBeenCalledTimes(1)
        clickSpy.mockRestore()
    })

    it('is a button in the tab order, and a disabled one says so and leaves it', () => {
        const { container, rerender } = render(<Dropzone>x</Dropzone>)
        expect(container.firstChild).toHaveAttribute('role', 'button')
        expect(container.firstChild).toHaveAttribute('tabindex', '0')
        expect(container.firstChild).not.toHaveAttribute('aria-disabled')

        rerender(<Dropzone disabled>x</Dropzone>)
        const clickSpy = jest.spyOn(container.querySelector('input'), 'click').mockImplementation(() => {})
        fireEvent.keyDown(container.firstChild, { key: 'Enter' })
        expect(container.firstChild).toHaveAttribute('tabindex', '-1')
        expect(container.firstChild).toHaveAttribute('aria-disabled', 'true')
        expect(clickSpy).not.toHaveBeenCalled()
        clickSpy.mockRestore()
    })

    it('forwards open() to click the hidden input', () => {
        const ref = createRef()
        const { container } = render(<Dropzone ref={ref}>x</Dropzone>)
        const input = container.querySelector('input')
        const clickSpy = jest.spyOn(input, 'click')
        ref.current.open()
        expect(clickSpy).toHaveBeenCalled()
        clickSpy.mockRestore()
    })

    it('open() does nothing when disabled', () => {
        const ref = createRef()
        const { container } = render(<Dropzone ref={ref} disabled>x</Dropzone>)
        const input = container.querySelector('input')
        const clickSpy = jest.spyOn(input, 'click')
        ref.current.open()
        expect(clickSpy).not.toHaveBeenCalled()
        clickSpy.mockRestore()
    })

    it('fires onDrop with files from the file input change event', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop}>x</Dropzone>)
        const file = makeFile('a.txt', 'text/plain')
        Object.defineProperty(container.querySelector('input'), 'files', {
            value: [file],
            configurable: true,
        })
        fireEvent.change(container.querySelector('input'))
        expect(onDrop).toHaveBeenCalledWith([file])
    })

    it('fires onDragEnter once on the first enter and onDragLeave on the final leave', () => {
        const onDragEnter = jest.fn()
        const onDragLeave = jest.fn()
        const { container } = render(
            <Dropzone onDragEnter={onDragEnter} onDragLeave={onDragLeave}>x</Dropzone>
        )
        const zone = container.querySelector('div')
        fireEvent.dragEnter(zone)
        fireEvent.dragEnter(zone)
        expect(onDragEnter).toHaveBeenCalledTimes(1)
        fireEvent.dragLeave(zone)
        fireEvent.dragLeave(zone)
        expect(onDragLeave).toHaveBeenCalledTimes(1)
    })

    it('handles drop event and filters by accept extension', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop} accept=".png">x</Dropzone>)
        const goodFile = makeFile('a.png', 'image/png')
        const badFile = makeFile('a.jpg', 'image/jpeg')

        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [goodFile, badFile] },
        })
        expect(onDrop).toHaveBeenCalledWith([goodFile])
    })

    it('drop filters by mime wildcard accept', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop} accept="image/*">x</Dropzone>)
        const png = makeFile('a.png', 'image/png')
        const txt = makeFile('a.txt', 'text/plain')
        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [png, txt] },
        })
        expect(onDrop).toHaveBeenCalledWith([png])
    })

    it('drop with no accept passes all files', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop}>x</Dropzone>)
        const file = makeFile('a.txt')
        fireEvent.drop(container.querySelector('div'), { dataTransfer: { files: [file] } })
        expect(onDrop).toHaveBeenCalledWith([file])
    })

    it('drop does nothing when disabled', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop} disabled>x</Dropzone>)
        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [makeFile('a.txt')] },
        })
        expect(onDrop).not.toHaveBeenCalled()
    })

    it('clicking the zone triggers the hidden input', () => {
        const { container } = render(<Dropzone>x</Dropzone>)
        const input = container.querySelector('input')
        const clickSpy = jest.spyOn(input, 'click')
        fireEvent.click(container.querySelector('div'))
        expect(clickSpy).toHaveBeenCalled()
        clickSpy.mockRestore()
    })

    it('does nothing when clicking the input itself (no recursive click)', () => {
        const { container } = render(<Dropzone>x</Dropzone>)
        const input = container.querySelector('input')
        const clickSpy = jest.spyOn(input, 'click')
        // Simulate click bubble whose target is the input itself
        fireEvent.click(input)
        // Synthetic click counter: the test framework's fireEvent triggers it once on the input,
        // but our wrapper should not re-trigger inputRef.current.click() since target === input.
        // The spy reflects clicks that came from outside the input. Since fireEvent itself doesn't
        // call HTMLElement.click(), the spy is 0 from our handler.
        expect(clickSpy).not.toHaveBeenCalled()
        clickSpy.mockRestore()
    })
})
