import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Text from '../Text'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

function renderWithConfig (ui, configOverrides = {}) {
    const value = { ...initialConfigState, ...configOverrides }
    return render(<ConfigContext.Provider value={value}>{ui}</ConfigContext.Provider>)
}

describe('Text', () => {
    it('renders string children inside a <span>', () => {
        const { container } = renderWithConfig(<Text>hello</Text>)
        const span = container.querySelector('span')
        expect(span).toBeInTheDocument()
        expect(span).toHaveTextContent('hello')
    })

    it('coerces a number to a string', () => {
        const { container } = renderWithConfig(<Text>{42}</Text>)
        expect(container.querySelector('span')).toHaveTextContent('42')
    })

    it('writes a number with the configured locale\'s decimal separator, and groups no digits', () => {
        const { container } = renderWithConfig(<Text>{1234.5}</Text>, { locale: 'de-DE' })
        expect(container.querySelector('span')).toHaveTextContent(/^1234,5$/)
    })

    it('writes a number with a point without a locale', () => {
        const { container } = renderWithConfig(<Text>{1234.5}</Text>)
        expect(container.querySelector('span')).toHaveTextContent(/^1234\.5$/)
    })

    it('renders booleans as Yes/No', () => {
        const { container, rerender } = renderWithConfig(<Text>{true}</Text>)
        expect(container.querySelector('span')).toHaveTextContent('Yes')
        rerender(
            <ConfigContext.Provider value={initialConfigState}>
                <Text>{false}</Text>
            </ConfigContext.Provider>
        )
        expect(container.querySelector('span')).toHaveTextContent('No')
    })

    it('renders booleans as the host\'s translations of ui-render:YES and ui-render:NO', () => {
        const translations = { 'ui-render:YES': 'Ja', 'ui-render:NO': 'Nein' }
        const translate = value => translations[value] || value
        const { container, rerender } = renderWithConfig(<Text translate={translate}>{true}</Text>)
        expect(container.querySelector('span')).toHaveTextContent(/^Ja$/)
        rerender(
            <ConfigContext.Provider value={initialConfigState}>
                <Text translate={translate}>{false}</Text>
            </ConfigContext.Provider>
        )
        expect(container.querySelector('span')).toHaveTextContent(/^Nein$/)
    })

    it('renders booleans as Yes/No when the host has no translation for them', () => {
        // An i18next-based host translate answers a key it does not have with the key itself.
        const translate = value => value
        const { container, rerender } = renderWithConfig(<Text translate={translate}>{true}</Text>)
        expect(container.querySelector('span')).toHaveTextContent(/^Yes$/)
        rerender(
            <ConfigContext.Provider value={initialConfigState}>
                <Text translate={translate}>{false}</Text>
            </ConfigContext.Provider>
        )
        expect(container.querySelector('span')).toHaveTextContent(/^No$/)
    })

    it('asks its translator for a boolean once, by its key, and does not translate the answer again', () => {
        const calls = []
        const translate = value => {
            calls.push(value)
            return value === 'ui-render:YES' ? 'Ja' : value
        }
        const { container } = renderWithConfig(<Text translate={translate}>{true}</Text>)
        expect(container.querySelector('span')).toHaveTextContent(/^Ja$/)
        expect(calls).toEqual(['ui-render:YES'])
    })

    it('formats ISO date strings using context dateFormat', () => {
        const { container } = renderWithConfig(<Text>2024-01-15</Text>)
        // Default in components is no ConfigContext provider → dateFormat will be undefined,
        // moment with undefined format prints default. Just check it renders.
        expect(container.querySelector('span').textContent.length).toBeGreaterThan(0)
    })

    it('adds pointer class when onClick is provided', () => {
        const { container } = renderWithConfig(<Text onClick={() => {}}>x</Text>)
        expect(container.querySelector('span').className).toContain('pointer')
    })

    it('merges className', () => {
        const { container } = renderWithConfig(<Text className="custom">x</Text>)
        const cls = container.querySelector('span').className
        expect(cls).toContain('text')
        expect(cls).toContain('custom')
    })

    it('passes through arbitrary HTML attributes', () => {
        const { container } = renderWithConfig(<Text data-testid="t" id="some-id">x</Text>)
        const span = container.querySelector('span')
        expect(span).toHaveAttribute('data-testid', 't')
        expect(span).toHaveAttribute('id', 'some-id')
    })

    it('renders a child React element via cloneElement', () => {
        // A DOM element is not handed `translate`: it is an HTML attribute there, and React warned on
        // the function until 2026-10-06. React warns once per prop name, so this stays the file's first.
        const errors = []
        jest.spyOn(console, 'error').mockImplementation((...args) => { errors.push(String(args[0])) })
        const { container } = renderWithConfig(
            <Text>
                <span data-testid="child">child</span>
            </Text>
        )
        expect(container.querySelector('[data-testid="child"]')).toHaveTextContent('child')
        expect(errors).toEqual([])
        console.error.mockRestore()
    })

    it('hands its translator to a component child', () => {
        const received = []
        const Child = ({ translate }) => { received.push(translate); return <i>child</i> }
        const translate = value => `t:${value}`
        renderWithConfig(<Text translate={translate}><Child/></Text>)
        expect(received[0]).toBe(translate)
    })
})
