import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../Tabs'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const withConfig = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const items = [
    { tab: 'Overview', content: 'Overview content' },
    { tab: 'Details', content: 'Details content' },
    { tab: 'History', content: 'History content' },
]

describe('core Tabs interaction contract', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('renders labels and respects an uncontrolled default index', () => {
        const { container } = render(withConfig(
            <Tabs items={items} defaultIndex="1" buttoned centerTabs />
        ))

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Details content')).toBeInTheDocument()
        expect(container.querySelector('.tabs')).toHaveClass('buttoned')
        expect(container.querySelector('.tabs__items > div')).toHaveClass('margin-auto')
    })

    it('switches after the transition delay and reports the selected index', () => {
        const onChange = jest.fn()
        const { container } = render(withConfig(
            <Tabs items={items} onChange={onChange} />
        ))

        fireEvent.click(container.querySelectorAll('.tabs__item')[2])
        expect(screen.getByText('Overview content')).toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(50)
        })

        expect(screen.getByText('History content')).toBeInTheDocument()
        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('applies controlled activeIndex changes immediately when transitions are disabled', () => {
        const onChange = jest.fn()
        const { rerender } = render(withConfig(
            <Tabs items={items} activeIndex={0} transitionUpdate={false} onChange={onChange} />
        ))

        rerender(withConfig(
            <Tabs items={items} activeIndex="1" transitionUpdate={false} onChange={onChange} />
        ))

        expect(screen.getByText('Details content')).toBeInTheDocument()
        expect(onChange).toHaveBeenCalledWith(1)
    })

    it('resets to the first panel when a changed item list becomes shorter', () => {
        const { rerender } = render(withConfig(
            <Tabs items={items} defaultIndex={2} />
        ))
        expect(screen.getByText('History content')).toBeInTheDocument()

        const shortened = [{ tab: 'Only tab', content: 'Only content' }]
        rerender(withConfig(<Tabs items={shortened} />))

        expect(screen.getByText('Only content')).toBeInTheDocument()
        expect(screen.queryByText('History content')).not.toBeInTheDocument()
    })

    it('renders icon and element labels plus function content and children', () => {
        const contentCall = jest.fn()
        const childrenCall = jest.fn()
        const content = instance => {
            contentCall(instance)
            return <div>{`active:${instance.state.activeIndex}`}</div>
        }
        const children = instance => {
            childrenCall(instance)
            return <div>{`child:${instance.tabs.length}`}</div>
        }
        const customItems = [
            {
                tab: { text: 'Settings', icon: 'cog' },
                content,
            },
            {
                tab: <strong>Custom label</strong>,
                content: <div>Custom content</div>,
            },
        ]

        const { container } = render(withConfig(
            <Tabs items={customItems}>{children}</Tabs>
        ))

        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(container.querySelector('.icon-cog')).toBeInTheDocument()
        expect(screen.getByText('Custom label')).toBeInTheDocument()
        expect(screen.getByText('active:0')).toBeInTheDocument()
        expect(screen.getByText('child:2')).toBeInTheDocument()
        expect(contentCall).toHaveBeenCalledWith(expect.objectContaining({ setTab: expect.any(Function) }))
        expect(childrenCall).toHaveBeenCalledWith(expect.objectContaining({ setTab: expect.any(Function) }))
    })

    it('cancels a pending tab transition when unmounted', () => {
        const onChange = jest.fn()
        const { container, unmount } = render(withConfig(
            <Tabs items={items} onChange={onChange} />
        ))

        fireEvent.click(container.querySelectorAll('.tabs__item')[1])
        unmount()
        act(() => {
            jest.runOnlyPendingTimers()
        })

        expect(onChange).not.toHaveBeenCalled()
    })
})
