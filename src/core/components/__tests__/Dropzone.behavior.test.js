import React, { createRef } from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dropzone from '../Dropzone'

const makeFile = (name, type = 'text/plain') => new File(['content'], name, { type })

const setInputSelection = (input, files, value = 'selected-file') => {
    Object.defineProperty(input, 'files', {
        configurable: true,
        value: files,
    })
    Object.defineProperty(input, 'value', {
        configurable: true,
        writable: true,
        value,
    })
}

describe('Dropzone imperative and lifecycle contracts', () => {
    it('exposes the live input and honors disabled changes through the current handle', () => {
        const ref = createRef()
        const { container, rerender } = render(<Dropzone ref={ref}>zone</Dropzone>)
        const input = container.querySelector('input[type="file"]')
        const click = jest.spyOn(input, 'click')

        expect(ref.current.fileInputEl).toBe(input)
        ref.current.open()
        expect(click).toHaveBeenCalledTimes(1)

        rerender(<Dropzone ref={ref} disabled>zone</Dropzone>)
        ref.current.open()
        expect(click).toHaveBeenCalledTimes(1)

        rerender(<Dropzone ref={ref}>zone</Dropzone>)
        ref.current.open()
        expect(click).toHaveBeenCalledTimes(2)
        click.mockRestore()
    })

    it('removes the cancel listener and leaves a captured handle safe after unmount', () => {
        const ref = createRef()
        const onFileDialogCancel = jest.fn()
        const { container, unmount } = render(
            <Dropzone ref={ref} onFileDialogCancel={onFileDialogCancel}>zone</Dropzone>
        )
        const input = container.querySelector('input')
        const handle = ref.current

        input.dispatchEvent(new Event('cancel'))
        expect(onFileDialogCancel).toHaveBeenCalledTimes(1)

        unmount()
        expect(ref.current).toBeNull()
        expect(handle.fileInputEl).toBeNull()
        expect(() => handle.open()).not.toThrow()

        input.dispatchEvent(new Event('cancel'))
        expect(onFileDialogCancel).toHaveBeenCalledTimes(1)
    })

    it('replaces and removes cancel callbacks without retaining stale listeners', () => {
        const first = jest.fn()
        const second = jest.fn()
        const { container, rerender } = render(
            <Dropzone onFileDialogCancel={first}>zone</Dropzone>
        )
        const input = container.querySelector('input')

        rerender(<Dropzone onFileDialogCancel={second}>zone</Dropzone>)
        input.dispatchEvent(new Event('cancel'))
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)

        rerender(<Dropzone>zone</Dropzone>)
        input.dispatchEvent(new Event('cancel'))
        expect(second).toHaveBeenCalledTimes(1)
    })
})

describe('Dropzone accept and input-selection contracts', () => {
    it('matches mixed extensions, exact MIME types, and wildcards case-insensitively', () => {
        const onDrop = jest.fn()
        const pdf = makeFile('REPORT.PDF', '')
        const image = makeFile('photo.bin', 'IMAGE/JPEG')
        const json = makeFile('payload.bin', 'APPLICATION/JSON')
        const text = makeFile('notes.txt', 'text/plain')
        const { container } = render(
            <Dropzone
                accept=" .pdf, IMAGE/*, application/json "
                onDrop={onDrop}
            >zone</Dropzone>
        )

        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [pdf, image, json, text] },
        })

        expect(onDrop).toHaveBeenCalledWith([pdf, image, json])
    })

    it('treats an accept list containing only separators and spaces as unrestricted', () => {
        const onDrop = jest.fn()
        const file = makeFile('notes.txt')
        const { container } = render(
            <Dropzone accept=" , , " onDrop={onDrop}>zone</Dropzone>
        )

        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [file] },
        })

        expect(onDrop).toHaveBeenCalledWith([file])
    })

    it('filters file-dialog selections and resets for choosing the same file again', () => {
        const onDrop = jest.fn()
        const csv = makeFile('REPORT.CSV', 'text/csv')
        const text = makeFile('notes.txt', 'text/plain')
        const { container } = render(
            <Dropzone accept=".csv" onDrop={onDrop}>zone</Dropzone>
        )
        const input = container.querySelector('input')
        setInputSelection(input, [csv, text])

        fireEvent.change(input)
        expect(onDrop).toHaveBeenLastCalledWith([csv])
        expect(input).toHaveValue('')

        input.value = 'selected-file-again'
        fireEvent.change(input)
        expect(onDrop).toHaveBeenCalledTimes(2)
        expect(onDrop).toHaveBeenLastCalledWith([csv])
        expect(input).toHaveValue('')
    })

    it('accepts an extension pattern by mime type when the spelling differs', () => {
        // Upload builds `accept` from `formats`, so `formats: ['jpeg']` becomes `.jpeg` — which by a
        // pure name check rejects `photo.jpg`, a file the browser itself typed as `image/jpeg`.
        const onDrop = jest.fn()
        const jpg = makeFile('photo.jpg', 'image/jpeg')
        const { container } = render(
            <Dropzone accept=".jpeg" onDrop={onDrop}>zone</Dropzone>
        )
        const input = container.querySelector('input')
        setInputSelection(input, [jpg])

        fireEvent.change(input)

        expect(onDrop).toHaveBeenLastCalledWith([jpg])
    })

    it('accepts an extensionless file whose mime type matches the extension pattern', () => {
        const onDrop = jest.fn()
        const typed = makeFile('scan', 'application/pdf')
        const wrong = makeFile('other', 'text/plain')
        const { container } = render(
            <Dropzone accept=".pdf" onDrop={onDrop}>zone</Dropzone>
        )
        const input = container.querySelector('input')
        setInputSelection(input, [typed, wrong])

        fireEvent.change(input)

        expect(onDrop).toHaveBeenLastCalledWith([typed])
    })

    it('resets an empty file selection without emitting a drop', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone onDrop={onDrop}>zone</Dropzone>)
        const input = container.querySelector('input')
        setInputSelection(input, undefined)

        fireEvent.change(input)

        expect(input).toHaveValue('')
        expect(onDrop).not.toHaveBeenCalled()
    })

    it('keeps a disabled input selection inert while still resetting the native input', () => {
        const onDrop = jest.fn()
        const { container } = render(<Dropzone disabled onDrop={onDrop}>zone</Dropzone>)
        const input = container.querySelector('input')
        setInputSelection(input, [makeFile('report.csv', 'text/csv')])

        fireEvent.change(input)

        expect(input).toHaveValue('')
        expect(onDrop).not.toHaveBeenCalled()
    })

    it('returns an empty accepted list when file metadata matches no pattern', () => {
        const onDrop = jest.fn()
        const unknownFile = { name: null, type: null }
        const { container } = render(
            <Dropzone accept=".txt, text/plain" onDrop={onDrop}>zone</Dropzone>
        )

        fireEvent.drop(container.querySelector('div'), {
            dataTransfer: { files: [unknownFile] },
        })

        expect(onDrop).toHaveBeenCalledWith([])
    })

    it('treats a drop without DataTransfer as an empty selection', () => {
        const onDrop = jest.fn()
        const { container, rerender } = render(<Dropzone onDrop={onDrop}>zone</Dropzone>)

        fireEvent.drop(container.querySelector('div'))

        expect(onDrop).toHaveBeenCalledWith([])

        rerender(<Dropzone>zone</Dropzone>)
        expect(() => fireEvent.drop(container.querySelector('div'))).not.toThrow()
    })
})

describe('Dropzone drag-state contracts', () => {
    it('balances nested enters and leaves and ignores an unmatched extra leave', () => {
        const onDragEnter = jest.fn()
        const onDragLeave = jest.fn()
        const { container, getByText } = render(
            <Dropzone onDragEnter={onDragEnter} onDragLeave={onDragLeave}>
                <span>child</span>
            </Dropzone>
        )
        const zone = container.querySelector('div')
        const child = getByText('child')

        fireEvent.dragEnter(child)
        fireEvent.dragEnter(zone)
        expect(onDragEnter).toHaveBeenCalledTimes(1)

        fireEvent.dragLeave(child)
        expect(onDragLeave).not.toHaveBeenCalled()
        fireEvent.dragLeave(zone)
        expect(onDragLeave).toHaveBeenCalledTimes(1)

        fireEvent.dragLeave(zone)
        expect(onDragLeave).toHaveBeenCalledTimes(1)
    })

    it('resets the nested counter on drop before starting a fresh drag sequence', () => {
        const onDrop = jest.fn()
        const onDragEnter = jest.fn()
        const onDragLeave = jest.fn()
        const { container } = render(
            <Dropzone
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
            >zone</Dropzone>
        )
        const zone = container.querySelector('div')

        fireEvent.dragEnter(zone)
        fireEvent.dragEnter(zone)
        fireEvent.drop(zone, { dataTransfer: { files: [] } })
        fireEvent.dragLeave(zone)
        expect(onDragLeave).not.toHaveBeenCalled()

        fireEvent.dragEnter(zone)
        fireEvent.dragLeave(zone)
        expect(onDragEnter).toHaveBeenCalledTimes(2)
        expect(onDragLeave).toHaveBeenCalledTimes(1)
    })

    it('prevents and contains drag-over while advertising a copy operation', () => {
        const parentDragOver = jest.fn()
        const dataTransfer = { dropEffect: 'move' }
        const { container } = render(
            <div onDragOver={parentDragOver}>
                <Dropzone>zone</Dropzone>
            </div>
        )
        const zone = container.querySelector('input').parentElement

        expect(fireEvent.dragOver(zone, { dataTransfer })).toBe(false)
        expect(dataTransfer.dropEffect).toBe('copy')
        expect(parentDragOver).not.toHaveBeenCalled()

        expect(() => fireEvent.dragOver(zone)).not.toThrow()
        expect(parentDragOver).not.toHaveBeenCalled()
    })

    it('does not mutate drag state or invoke callbacks while disabled', () => {
        const onDrop = jest.fn()
        const onDragEnter = jest.fn()
        const onDragLeave = jest.fn()
        const dataTransfer = {
            dropEffect: 'move',
            files: [makeFile('report.txt')],
        }
        const { container } = render(
            <Dropzone
                disabled
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
            >zone</Dropzone>
        )
        const zone = container.querySelector('div')
        const input = container.querySelector('input')
        const click = jest.spyOn(input, 'click')

        fireEvent.click(zone)
        fireEvent.dragEnter(zone, { dataTransfer })
        fireEvent.dragOver(zone, { dataTransfer })
        fireEvent.dragLeave(zone, { dataTransfer })
        fireEvent.drop(zone, { dataTransfer })

        expect(dataTransfer.dropEffect).toBe('move')
        expect(onDragEnter).not.toHaveBeenCalled()
        expect(onDragLeave).not.toHaveBeenCalled()
        expect(onDrop).not.toHaveBeenCalled()
        expect(click).not.toHaveBeenCalled()
        click.mockRestore()
    })
})
