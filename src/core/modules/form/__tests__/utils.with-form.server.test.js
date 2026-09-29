/** @jest-environment node */
/**
 * THE FORM WRAPPER ON THE SERVER. In a browser it keeps the shared form storage and resets the form
 * in layout effects, before the paint. With no `window` it uses plain effects instead, which the
 * server never runs: React warns about a layout effect on every server render, and a host that
 * server-renders a document would get that warning for every form on the page.
 */
// The engine hands the `fetch` action the global one whenever it builds a meta.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { renderToString } from 'react-dom/server' // eslint-disable-line import/first
import PublishedUIRender from '../../../../library/main' // eslint-disable-line import/first

it('renders a document on the server without a warning about its form wrapper', () => {
    const reported = []
    const errors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args.join(' ')) })
    try {
        const values = { name: 'Ada' }
        const html = renderToString(
            <PublishedUIRender
                meta={{ view: 'Col', items: [{ view: 'Input', name: 'name', label: 'Name' }] }}
                data={values}
                initialValues={values}
                onSubmit={() => {}}
            />
        )

        expect(html).toContain('value="Ada"')
        expect(reported).toEqual([])
    } finally {
        errors.mockRestore()
    }
})
