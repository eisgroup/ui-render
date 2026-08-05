import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScrollView from '../ScrollView'

describe('ScrollView behavior contracts', () => {
    it('renders vertical content and forwards inner props without leaking the tab prop', () => {
        const onClick = jest.fn()
        const { container, getByText } = render(
            <ScrollView
                className="outer-extra"
                classNameInner="inner-extra"
                style={{ height: 100 }}
                styleInner={{ minHeight: 50 }}
                tab="legacy-tab"
                data-testid="inner"
                onClick={onClick}
            >
                <span>Scrollable content</span>
            </ScrollView>
        )
        const outer = container.firstChild
        const inner = outer.firstChild

        expect(outer).toHaveClass('overflow-scroll', 'flex--col', 'max-height', 'outer-extra')
        expect(outer).toHaveStyle({ height: '100px' })
        expect(inner).toHaveClass('flex--col', 'min-height', 'pointer', 'inner-extra')
        expect(inner).toHaveStyle({ minHeight: '50px' })
        expect(inner).not.toHaveAttribute('tab')
        expect(getByText('Scrollable content')).toBeInTheDocument()

        fireEvent.click(inner)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('applies horizontal, fill, reverse, rtl and centering classes to the right wrappers', () => {
        const { container } = render(
            <ScrollView row fill reverse rtl center>
                Content
            </ScrollView>
        )
        const outer = container.firstChild
        const inner = outer.firstChild

        expect(outer).toHaveClass('flex--row', 'max-width', 'fill', 'rtl')
        expect(outer).not.toHaveClass('center')
        expect(inner).toHaveClass(
            'flex--row',
            'min-width',
            'fill',
            'reverse',
            'rtl',
            'margin-auto'
        )
    })

    it('centers a vertical outer wrapper', () => {
        const { container } = render(<ScrollView center>Content</ScrollView>)

        expect(container.firstChild).toHaveClass('center')
        expect(container.firstChild.firstChild).toHaveClass('margin-auto')
    })

    it('tracks horizontal scrolling only from its outer element and clears the state at zero', () => {
        const { container } = render(<ScrollView>Content</ScrollView>)
        const outer = container.firstChild
        const inner = outer.firstChild

        Object.defineProperty(inner, 'scrollLeft', { configurable: true, value: 30 })
        fireEvent.scroll(inner)
        expect(outer).not.toHaveClass('vertical-scroll')

        Object.defineProperty(outer, 'scrollLeft', { configurable: true, value: 30 })
        fireEvent.scroll(outer)
        expect(outer).toHaveClass('vertical-scroll')

        Object.defineProperty(outer, 'scrollLeft', { configurable: true, value: 0 })
        fireEvent.scroll(outer)
        expect(outer).not.toHaveClass('vertical-scroll')
    })
})
