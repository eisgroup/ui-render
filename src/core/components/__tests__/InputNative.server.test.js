/** @jest-environment node */
/**
 * `InputNative` ON THE SERVER. In a browser its compact resize and color update run in a layout
 * effect, before paint. With no `window` they run in a plain effect instead, which the server never
 * runs. React 16 and 17 warn about a layout effect on every server render, and a host that
 * server-renders a form would get that warning for every input.
 */
import React from 'react'
import { renderToString } from 'react-dom/server'
import InputNative from '../InputNative'

it('renders on the server without a warning', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
        const html = renderToString(
            <div>
                <InputNative name="code" compact value="AB" onChange={() => {}} />
                <InputNative name="shade" type="color" value="#112233" onChange={() => {}} />
            </div>
        )

        expect(html).toContain('name="code"')
        expect(html).toContain('name="shade"')
        expect(errors).not.toHaveBeenCalled()
    } finally {
        errors.mockRestore()
    }
})
