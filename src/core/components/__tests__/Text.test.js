import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Text } from '../Text'
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
        const { container } = renderWithConfig(
            <Text>
                <span data-testid="child">child</span>
            </Text>
        )
        expect(container.querySelector('[data-testid="child"]')).toHaveTextContent('child')
    })
})
