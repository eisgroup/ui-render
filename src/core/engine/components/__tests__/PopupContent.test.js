/**
 * The items of a template popup are keyed. Every template popup logged React's missing-key warning
 * until 2026-10-06: `PopupContent` put the key in the props it handed to `Render`, and `Render` sets
 * the element's key from its own index argument, which is undefined there.
 *
 * A file of its own on purpose: React logs that warning once per component stack, for the life of
 * the module, so a test after another one that rendered a popup would pass on the old code too.
 */
if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { render } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import '../../rules' // eslint-disable-line import/first -- sets up the renderer the items resolve through
import { createPopupContent } from '../PopupContent' // eslint-disable-line import/first
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext' // eslint-disable-line import/first

it('renders its items keyed, so React does not warn about the list', () => {
    const errors = []
    jest.spyOn(console, 'error').mockImplementation((...args) => { errors.push(String(args[0])) })
    const PopupContent = createPopupContent()

    const { container } = render(
        <ConfigContext.Provider value={initialConfigState}>
            <PopupContent items={[{ view: 'Text', children: 'first' }, { view: 'Text', children: 'second' }]}
                          data={{}} _data={{}}/>
        </ConfigContext.Provider>
    )

    expect(container).toHaveTextContent('firstsecond')
    expect(errors.filter(message => message.includes('unique "key"'))).toEqual([])
    console.error.mockRestore()
})
