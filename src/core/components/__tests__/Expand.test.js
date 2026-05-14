import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Expand from '../Expand'
import ExpandList from '../ExpandList'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('Expand', () => {
    it('renders the title', () => {
        const { container } = render(wrap(<Expand title="My Section">content</Expand>))
        expect(container.textContent).toContain('My Section')
    })

    it('shows collapsed icon by default', () => {
        const { container } = render(wrap(<Expand title="x">y</Expand>))
        expect(container.querySelector('.icon-chevron-right')).toBeInTheDocument()
    })

    it('toggles expanded state on title click', () => {
        const { container } = render(wrap(<Expand title="x">y</Expand>))
        const title = container.querySelector('.app__expand > .text')
        act(() => {
            fireEvent.click(title)
        })
        expect(container.querySelector('.app__expand').className).toContain('expanded')
    })

    it('fires onClick when toggled', () => {
        const onClick = jest.fn()
        const { container } = render(wrap(<Expand title="x" id="my-id" onClick={onClick}>y</Expand>))
        const title = container.querySelector('.app__expand > .text')
        act(() => {
            fireEvent.click(title)
        })
        expect(onClick).toHaveBeenCalled()
        expect(onClick.mock.calls[0][0].key).toBe('my-id')
        expect(onClick.mock.calls[0][0].expanded).toBe(true)
    })

    it('renders function children when expanded', () => {
        const { container } = render(wrap(<Expand title="x" expanded>{() => <span>lazy content</span>}</Expand>))
        expect(container.textContent).toContain('lazy content')
    })

    it('uses renderLabel when provided', () => {
        const { container } = render(
            wrap(<Expand title="x" renderLabel={(t) => <span data-testid="rl">label:{t}</span>}>y</Expand>)
        )
        expect(container.querySelector('[data-testid="rl"]')).toHaveTextContent('label:x')
    })
})

describe('ExpandList', () => {
    it('renders one Expand per item', () => {
        const items = [
            { id: 1, name: 'Alpha' },
            { id: 2, name: 'Beta' },
        ]
        const { container } = render(
            wrap(
                <ExpandList
                    items={items}
                    renderLabel={(item) => item.name}
                    renderItem={(item) => <span>val:{item.name}</span>}
                />
            )
        )
        expect(container.querySelectorAll('.app__expand').length).toBe(2)
        expect(container.textContent).toContain('Alpha')
        expect(container.textContent).toContain('Beta')
    })
})
