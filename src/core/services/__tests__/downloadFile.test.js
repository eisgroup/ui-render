import { downloadFile } from '../downloadFile'

describe('downloadFile', () => {
    let originalCreate
    let originalRevoke

    beforeEach(() => {
        originalCreate = URL.createObjectURL
        originalRevoke = URL.revokeObjectURL
        URL.createObjectURL = jest.fn(() => 'blob:fake-href')
        URL.revokeObjectURL = jest.fn()
    })

    afterEach(() => {
        URL.createObjectURL = originalCreate
        URL.revokeObjectURL = originalRevoke
    })

    it('returns a function that downloads a file with the given name', () => {
        const blob = new Blob(['hello'], { type: 'text/plain' })
        const handler = downloadFile('report.txt')

        const clicks = []
        const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(node => {
            // Track the link node's properties and capture click
            node.click = jest.fn(() => clicks.push(node))
            return node
        })
        const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(node => node)

        handler(blob)

        expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
        expect(appendSpy).toHaveBeenCalledTimes(1)
        const link = appendSpy.mock.calls[0][0]
        expect(link.tagName).toBe('A')
        expect(link.getAttribute('download')).toBe('report.txt')
        expect(link.href).toContain('blob:fake-href')
        expect(clicks).toHaveLength(1)
        expect(removeSpy).toHaveBeenCalledWith(link)
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-href')

        appendSpy.mockRestore()
        removeSpy.mockRestore()
    })

    it.each([['undefined', undefined], ['null', null]])(
        'leaves the name to the browser for a file name of %s, by an EMPTY download attribute',
        (_label, fileName) => {
            // An empty attribute still downloads; a missing one would open the blob in the tab.
            const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(node => {
                node.click = jest.fn()
                return node
            })
            const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(node => node)

            downloadFile(fileName)(new Blob(['x']))

            const link = appendSpy.mock.calls[0][0]
            expect(link.hasAttribute('download')).toBe(true)
            expect(link.getAttribute('download')).toBe('')

            appendSpy.mockRestore()
            removeSpy.mockRestore()
        }
    )
})
