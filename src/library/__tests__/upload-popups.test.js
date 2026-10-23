/**
 * AN UPLOAD THAT REFUSES A FILE SAYS WHY, in its document's popup, mounted through the published entry as a host
 * mounts it.
 * =============================================================================================
 *
 * `Upload` refuses a drop that holds a file larger than its `maxSize`, and a drop with no file of a type its
 * `formats` take, and hands the document's popup a title and a message that say so. Until 2026-10-23 it handed
 * them without `isOpen`, and the popup keeps its `isOpen` when it is not given (`AppProvider`): the popup stayed
 * closed, and the user was refused without a word. 0.34.x did the same. The upload's own suites stub
 * `setPopupState` and read what it is handed, so they could not see it; these tests have the real popup state
 * and `Modal`.
 */
import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'

/** A host's `uploadFile`, and the names of the files each call was handed. Its answer never comes. */
const hostUploads = () => {
    const sent = []
    const uploadFile = (serialized, file, files) => {
        sent.push(files.map(each => each.name))
        return new Promise(() => {})
    }
    return { sent, uploadFile }
}

const mountUpload = (field, uploadFile) => render(
    <UIRender
        meta={{ view: 'Input', type: 'file', name: 'attachment', onChange: 'upload', ...field }}
        data={{}}
        apiCalls={{ uploadFile }}
    />
)

const drop = (container, files) => fireEvent.drop(
    container.querySelector('.upload__dropzone'),
    { dataTransfer: { files } },
)
const csv = (name, size) => new File(['x'.repeat(size)], name, { type: 'text/csv' })
/** Each text the popup's message shows, in order: the file's name and the limit are texts of their own. */
const piecesOf = dialog => Array.from(dialog.querySelectorAll('.app__popup__box__body .text'), text => text.textContent)

describe('an upload that refuses a drop', () => {
    it('opens a popup for a file larger than its `maxSize`, with the file\'s name and the limit, and uploads nothing', () => {
        const { sent, uploadFile } = hostUploads()
        const { container } = mountUpload({ formats: ['csv'], maxSize: 1024 }, uploadFile)

        drop(container, [csv('big.csv', 2048)])

        const dialog = screen.getByRole('dialog', { name: 'Maximum File Size Exceeded!' })
        expect(piecesOf(dialog)).toEqual(['big.csv', 'must be under', '1kB'])
        expect(sent).toEqual([])
    })

    it('refuses every file of a drop that holds one too large, and names that one', () => {
        const { sent, uploadFile } = hostUploads()
        const { container } = mountUpload({ formats: ['csv'], maxSize: 1024 }, uploadFile)

        drop(container, [csv('small.csv', 10), csv('big.csv', 2048)])

        const dialog = screen.getByRole('dialog', { name: 'Maximum File Size Exceeded!' })
        expect(piecesOf(dialog)).toEqual(['big.csv', 'must be under', '1kB'])
        expect(sent).toEqual([])
    })

    it('opens a popup for a drop with no file of a type it takes, with the types it takes, and uploads nothing', () => {
        const { sent, uploadFile } = hostUploads()
        const { container } = mountUpload({ formats: ['png'] }, uploadFile)

        drop(container, [new File(['plain text'], 'notes.txt', { type: 'text/plain' })])

        const dialog = screen.getByRole('dialog', { name: 'File Upload Failed!' })
        expect(piecesOf(dialog)).toEqual(['Upload', '.png', 'files only'])
        expect(sent).toEqual([])
    })

    it('closes the popup on Ok, and opens it again for the next drop it refuses', () => {
        const { uploadFile } = hostUploads()
        const { container } = mountUpload({ formats: ['csv'], maxSize: 1024 }, uploadFile)

        drop(container, [csv('big.csv', 2048)])
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Ok' }))
        expect(screen.queryByRole('dialog')).toBeNull()

        drop(container, [csv('bigger.csv', 4096)])
        expect(piecesOf(screen.getByRole('dialog', { name: 'Maximum File Size Exceeded!' })))
            .toEqual(['bigger.csv', 'must be under', '1kB'])
    })
})

describe('an upload that takes a drop', () => {
    it('opens no popup, and hands the files to the host', async () => {
        const { sent, uploadFile } = hostUploads()
        const { container } = mountUpload({ formats: ['csv'], maxSize: 1024 }, uploadFile)

        drop(container, [csv('small.csv', 10)])

        await waitFor(() => expect(sent).toEqual([['small.csv']]))
        expect(screen.queryByRole('dialog')).toBeNull()
    })
})
