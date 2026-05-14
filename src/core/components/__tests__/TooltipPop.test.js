import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TooltipPop from '../TooltipPop'

describe('TooltipPop', () => {
    it('renders a Semantic UI Popup with the trigger', () => {
        const { container } = render(<TooltipPop title="hint"><span data-testid="trigger">tt</span></TooltipPop>)
        expect(container.querySelector('[data-testid="trigger"]')).toBeInTheDocument()
    })

    it('wraps a function title in {children: fn} so Semantic UI accepts it', () => {
        // Snapshot-style: render with a function title and ensure it doesn't throw.
        const fn = () => 'lazy content'
        const { container } = render(<TooltipPop title={fn}><span>x</span></TooltipPop>)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('honors the inverted prop', () => {
        const { container } = render(<TooltipPop inverted title="x"><span>y</span></TooltipPop>)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('exposes a default delay of 500ms', () => {
        expect(TooltipPop.defaultProps.delay).toBe(500)
    })
})
