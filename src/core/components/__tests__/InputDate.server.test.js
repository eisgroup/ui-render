/** @jest-environment node */
/**
 * `InputDate` ON THE SERVER. It renders the stand-in for rc-picker there (`InputDate.stand-in.test.js`): the server has
 * no IntersectionObserver and runs no effect, so nothing mounts the picker. Its effect is a plain one where there is no
 * `window`, since React 16 and 17 warn about a layout effect on every server render.
 */
import React from 'react'
import { renderToString } from 'react-dom/server'
import InputDate from '../InputDate'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

it('renders the stand-in on the server, with the value in the configured format, and no warning', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
        const html = renderToString(
            <ConfigContext.Provider value={initialConfigState}>
                <InputDate name="start" value="2024-03-15" onChange={() => {}} />
            </ConfigContext.Provider>
        )

        expect(html).toContain('<div class="ui-render-picker ui-render-picker"><div class="ui-render-picker-input"><input')
        expect(html).toContain('name="start"')
        expect(html).toContain('value="03-15-2024"')
        expect(errors).not.toHaveBeenCalled()
    } finally {
        errors.mockRestore()
    }
})
