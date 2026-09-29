/**
 * A DOCUMENT UNDER StrictMode.
 * =============================================================================================
 *
 * React's StrictMode reports every `UNSAFE_*` lifecycle it finds. The engine had six; §9.3 step 6
 * removed them one slice at a time, and this pins that none is left, on a document with nested
 * documents, rendered through the published entry. It is the engine's half of §9.3 step 7.
 */
// The engine hands the `fetch` action the global one whenever it builds a meta.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render, screen } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import PublishedUIRender from '../../../library/main' // eslint-disable-line import/first
import { EXAMPLES } from '../../../demo/examples/manifest' // eslint-disable-line import/first
import { clearEngineGlobals } from '../../../demo/testing/mountExample' // eslint-disable-line import/first

it('reports no unsafe lifecycle for a document with nested documents, through an edit', async () => {
    const example = EXAMPLES.find(({ id }) => id === 'nestedDataKind')
    const reported = []
    const errors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args.join(' ')) })
    try {
        clearEngineGlobals()
        const tree = values => (
            <React.StrictMode>
                <PublishedUIRender meta={example.meta} data={example.data} initialValues={values} onSubmit={() => {}} />
            </React.StrictMode>
        )
        const view = render(tree(example.data))
        const title = screen.getByDisplayValue(example.data.dataKind.phases[0].title)
        fireEvent.focus(title)
        fireEvent.change(title, { target: { value: 'Discovery' } })
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 400)) })
        view.rerender(tree({ ...example.data }))

        expect(screen.getByDisplayValue('Discovery')).toBeInTheDocument()
        expect(reported.filter(message => /UNSAFE_|componentWill(Mount|ReceiveProps|Update)/.test(message))).toEqual([])
    } finally {
        errors.mockRestore()
    }
})
