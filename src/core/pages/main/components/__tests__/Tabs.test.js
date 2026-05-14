import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../Tabs'
import TabList from '../TabList'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const items = [
    { tab: 'Tab A', content: 'Content A' },
    { tab: 'Tab B', content: 'Content B' },
    { tab: 'Tab C', content: 'Content C' },
]

describe('Tabs', () => {
    it('renders all tab labels', () => {
        const { container } = render(wrap(<Tabs items={items} />))
        expect(container.textContent).toContain('Tab A')
        expect(container.textContent).toContain('Tab B')
    })

    it('renders the first tab content by default', () => {
        const { container } = render(wrap(<Tabs items={items} />))
        expect(container.textContent).toContain('Content A')
    })

    it('renders the content for defaultIndex when provided', () => {
        const { container } = render(wrap(<Tabs items={items} defaultIndex={1} />))
        expect(container.textContent).toContain('Content B')
    })

    it('switches tabs on click and calls onChange', () => {
        const onChange = jest.fn()
        const { container } = render(wrap(<Tabs items={items} onChange={onChange} />))
        const tabButtons = container.querySelectorAll('.tabs__item')
        act(() => {
            fireEvent.click(tabButtons[2])
            jest.advanceTimersByTime(100)
        })
        expect(onChange).toHaveBeenCalledWith(2)
        expect(container.textContent).toContain('Content C')
    })

    it('renders icon-style tab labels', () => {
        const iconItems = [
            { tab: { text: 'Settings', icon: 'cog' }, content: 'x' },
        ]
        const { container } = render(wrap(<Tabs items={iconItems} />))
        expect(container.textContent).toContain('Settings')
        expect(container.querySelector('.icon-cog')).toBeInTheDocument()
    })
})

describe('TabList', () => {
    it('builds tab items from list', () => {
        const items = [
            { id: 1, name: 'One' },
            { id: 2, name: 'Two' },
        ]
        const { container } = render(
            wrap(
                <TabList
                    items={items}
                    renderLabel={(item) => item.name}
                    renderItem={(item) => `content:${item.name}`}
                />
            )
        )
        expect(container.textContent).toContain('One')
        expect(container.textContent).toContain('Two')
    })
})
