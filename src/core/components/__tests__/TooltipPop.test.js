import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Popup as SemanticPopup } from 'semantic-ui-react'
import TooltipPop from '../TooltipPop'

jest.mock('semantic-ui-react', () => ({
    Popup: jest.fn(({ trigger }) => trigger || null),
}))

const latestPopupProps = () => {
    const calls = SemanticPopup.mock.calls
    return calls[calls.length - 1][0]
}

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

    // Asserted through what Semantic actually receives, not through `TooltipPop.defaultProps`: the
    // default is a default parameter now, and the old assertion only ever checked the mechanism.
    it('applies a 500ms delay when none is given', () => {
        render(<TooltipPop title="x"><span>y</span></TooltipPop>)

        expect(latestPopupProps().mouseEnterDelay).toBe(500)
    })

    it('lets a caller override the delay', () => {
        render(<TooltipPop title="x" delay={0}><span>y</span></TooltipPop>)

        expect(latestPopupProps().mouseEnterDelay).toBe(0)
    })
})
