import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../Tabs'
import TabList from '../TabList'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

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

describe('the keyboard, by the WAI-ARIA Tabs pattern', () => {
    const tabsOf = container => Array.from(container.querySelectorAll('[role="tab"]'))

    it('is a tablist of tabs, the active one selected and alone in the tab order', () => {
        const { container } = render(wrap(<Tabs items={items} defaultIndex={1}/>))

        expect(container.querySelector('[role="tablist"]')).not.toBeNull()
        expect(tabsOf(container).map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
        expect(tabsOf(container).map(tab => tab.tabIndex)).toEqual([-1, 0, -1])
        expect(container.querySelector('[role="tabpanel"]')).toHaveAttribute('aria-label', 'Tab B')
    })

    it('moves focus with the arrows, and selects the tab after its transition, wrapping around', () => {
        const { container } = render(wrap(<Tabs items={items}/>))
        const tabs = () => tabsOf(container)

        fireEvent.keyDown(tabs()[0], { key: 'ArrowRight' })
        expect(document.activeElement).toBe(tabs()[1])
        act(() => { jest.advanceTimersByTime(50) })
        expect(tabs()[1]).toHaveAttribute('aria-selected', 'true')
        expect(container.textContent).toContain('Content B')

        fireEvent.keyDown(tabs()[1], { key: 'ArrowLeft' })
        fireEvent.keyDown(tabs()[0], { key: 'ArrowLeft' })
        act(() => { jest.advanceTimersByTime(50) })
        expect(document.activeElement).toBe(tabs()[2])
        expect(tabs()[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('goes to the last tab with End and the first with Home', () => {
        const { container } = render(wrap(<Tabs items={items}/>))
        const tabs = () => tabsOf(container)

        fireEvent.keyDown(tabs()[0], { key: 'End' })
        act(() => { jest.advanceTimersByTime(50) })
        expect(tabs()[2]).toHaveAttribute('aria-selected', 'true')

        fireEvent.keyDown(tabs()[2], { key: 'Home' })
        act(() => { jest.advanceTimersByTime(50) })
        expect(tabs()[0]).toHaveAttribute('aria-selected', 'true')
        expect(document.activeElement).toBe(tabs()[0])
    })

    it('steps with the up and down arrows when vertical, and says so', () => {
        const { container } = render(wrap(<Tabs items={items} vertical/>))
        const tabs = () => tabsOf(container)
        expect(container.querySelector('[role="tablist"]')).toHaveAttribute('aria-orientation', 'vertical')

        fireEvent.keyDown(tabs()[0], { key: 'ArrowRight' })
        act(() => { jest.advanceTimersByTime(50) })
        expect(tabs()[0]).toHaveAttribute('aria-selected', 'true')

        fireEvent.keyDown(tabs()[0], { key: 'ArrowDown' })
        act(() => { jest.advanceTimersByTime(50) })
        expect(tabs()[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('selects a tab with Enter or Space, as a click does, and reports it once', () => {
        const reports = []
        const { container } = render(wrap(<Tabs items={items} onChange={index => reports.push(index)}/>))
        const tabs = () => tabsOf(container)

        fireEvent.keyDown(tabs()[2], { key: 'Enter' })
        act(() => { jest.advanceTimersByTime(50) })
        fireEvent.keyDown(tabs()[1], { key: ' ' })
        act(() => { jest.advanceTimersByTime(50) })

        expect(tabs()[1]).toHaveAttribute('aria-selected', 'true')
        expect(reports).toEqual([2, 1])
    })
})
