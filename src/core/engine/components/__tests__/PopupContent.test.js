/**
 * The items of a template popup are keyed. Every template popup logged React's missing-key warning
 * until 2026-10-06: `PopupContent` put the key in the props it handed to `Render`, and `Render` sets
 * the element's key from its own index argument, which is undefined there.
 *
 * A file of its own on purpose: React logs that warning once per component stack, for the life of
 * the module, so a test after another one that rendered a popup would pass on the old code too.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../rules' // sets up the renderer the items resolve through
import { createPopupContent } from '../PopupContent'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

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
