import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AnimateHeight } from '../AnimateHeight'

describe('AnimateHeight', () => {
    it('renders children inside the grid wrapper', () => {
        const { container } = render(
            <AnimateHeight expanded>
                <div data-testid="child">hi</div>
            </AnimateHeight>
        )
        expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument()
    })

    it('sets gridTemplateRows to 1fr when expanded', () => {
        const { container } = render(<AnimateHeight expanded>x</AnimateHeight>)
        const div = container.querySelector('div')
        expect(div.style.gridTemplateRows).toBe('1fr')
    })

    it('sets gridTemplateRows to 0fr when collapsed', () => {
        const { container } = render(<AnimateHeight>x</AnimateHeight>)
        const div = container.querySelector('div')
        expect(div.style.gridTemplateRows).toBe('0fr')
    })

    it('applies transition duration', () => {
        const { container } = render(<AnimateHeight expanded duration={500}>x</AnimateHeight>)
        expect(container.querySelector('div').style.transition).toContain('500ms')
    })

    it('merges className', () => {
        const { container } = render(<AnimateHeight className="foo">x</AnimateHeight>)
        const cls = container.querySelector('div').className
        expect(cls).toContain('position-relative')
        expect(cls).toContain('foo')
    })
})
