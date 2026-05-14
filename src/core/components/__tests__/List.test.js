import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { List } from '../List'

describe('List', () => {
    it('returns null when items is missing', () => {
        const { container } = render(<List renderItem={() => null} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders each item via renderItem', () => {
        const items = [{ id: 1, label: 'A' }, { id: 2, label: 'B' }]
        const renderItem = (item) => <span key={item.id} data-testid={`it-${item.id}`}>{item.label}</span>
        const { container } = render(<List items={items} renderItem={renderItem} />)
        expect(container.querySelectorAll('span').length).toBe(2)
    })

    it('renders inside Row container when row=true', () => {
        const items = [{ id: 1 }]
        const renderItem = (item) => <span key={item.id}>{item.id}</span>
        const { container } = render(<List row items={items} renderItem={renderItem} />)
        expect(container.querySelector('.flex--row')).toBeInTheDocument()
    })

    it('renders inside View container by default', () => {
        const items = [{ id: 1 }]
        const renderItem = (item) => <span key={item.id}>{item.id}</span>
        const { container } = render(<List items={items} renderItem={renderItem} />)
        expect(container.querySelector('.flex--col')).toBeInTheDocument()
    })

    it('passes currencyCode to renderItem', () => {
        const renderItem = jest.fn(() => null)
        render(<List items={[{ a: 1 }]} renderItem={renderItem} currencyCode="USD" />)
        expect(renderItem).toHaveBeenCalledWith({ a: 1, currencyCode: 'USD' }, 0)
    })
})
