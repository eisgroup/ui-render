import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JsonView } from '../index'

describe('JsonView data-integrity contracts', () => {
    it('marks an ancestor cycle without treating repeated sibling references as circular', () => {
        const cyclic = { name: 'cycle' }
        cyclic.self = cyclic
        const cyclicView = render(<JsonView data={cyclic} expanded />)

        expect(screen.getByText('[Circular]')).toBeInTheDocument()
        cyclicView.unmount()

        const shared = { value: 7 }
        render(<JsonView data={{ left: shared, right: shared }} expanded />)

        expect(screen.queryByText('[Circular]')).not.toBeInTheDocument()
        expect(screen.getAllByText('7')).toHaveLength(2)
    })

    it('actually opens and closes a collapsed collection when its summary is clicked', () => {
        render(
            <JsonView
                data={{ hidden: 'value' }}
                hideRoot={false}
                shouldExpandNode={() => false}
            />
        )
        const toggle = screen.getByText('1 key').closest('div')

        expect(screen.queryByText('"value"')).not.toBeInTheDocument()
        fireEvent.click(toggle)
        expect(screen.getByText('"value"')).toBeInTheDocument()

        fireEvent.click(toggle)
        expect(screen.queryByText('"value"')).not.toBeInTheDocument()
        expect(screen.getByText('1 key')).toBeInTheDocument()
    })

    it('reports key paths and levels to a custom expansion predicate', () => {
        const shouldExpandNode = jest.fn(() => true)

        render(
            <JsonView
                data={{ nested: { value: 1 } }}
                hideRoot={false}
                shouldExpandNode={shouldExpandNode}
            />
        )

        expect(shouldExpandNode).toHaveBeenCalledWith(
            ['root'],
            expect.objectContaining({ nested: { value: 1 } }),
            0
        )
        expect(shouldExpandNode).toHaveBeenCalledWith(
            ['nested', 'root'],
            { value: 1 },
            1
        )
        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders undefined, named functions and fallback primitive types safely', () => {
        function calculate () {}

        const { container } = render(
            <JsonView
                data={{
                    missing: undefined,
                    callback: calculate,
                    symbol: Symbol('token'),
                    bigint: 12n,
                }}
                expanded
            />
        )

        expect(container).toHaveTextContent('undefined')
        expect(container).toHaveTextContent('function calculate()')
        expect(container).toHaveTextContent('Symbol(token)')
        expect(container).toHaveTextContent('12')
    })

    it('uses the inverted palette by default and lets explicit styles win', () => {
        const theme = {
            base00: '#000000',
            base01: '#111111',
            base02: '#222222',
            base03: '#333333',
            base04: '#444444',
            base05: '#555555',
            base06: '#666666',
            base07: '#777777',
            base08: '#880000',
            base09: '#990000',
            base0B: '#00bb00',
            base0D: '#0000dd',
            base0E: '#ee00ee',
        }
        const { container, rerender } = render(<JsonView data={{}} theme={theme} />)

        expect(container.firstChild).toHaveStyle({ background: '#777777', color: '#222222' })

        rerender(
            <JsonView
                data={{}}
                theme={theme}
                inverted
                style={{ background: '#abcdef', padding: 20 }}
            />
        )
        expect(container.firstChild).toHaveStyle({ background: '#abcdef', padding: '20px' })
    })
})
