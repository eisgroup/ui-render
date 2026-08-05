import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'
import Tabs from '../Tabs'

const items = [
    { tab: 'Tab A', content: 'Content A' },
    { tab: 'Tab B', content: 'Content B' },
    { tab: 'Tab C', content: 'Content C' },
]

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const getContent = container => container.querySelector('.tabs__content')
const getTabs = container => container.querySelectorAll('.tabs__item')

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
})

describe('Tabs state contracts', () => {
    it('lets a controlled zero index override a non-zero default', () => {
        const { container } = render(wrap(<Tabs items={items} activeIndex={0} defaultIndex={2}/>))

        expect(getContent(container)).toHaveTextContent('Content A')
        expect(getTabs(container)[0]).toHaveClass('active')
        expect(getTabs(container)[2]).not.toHaveClass('active')
    })

    it('normalizes an initially out-of-range controlled index to the first tab', () => {
        const { container } = render(wrap(<Tabs items={items} activeIndex={99}/>))

        expect(getContent(container)).toHaveTextContent('Content A')
        expect(getTabs(container)[0]).toHaveClass('active')
    })

    it('uses defaultIndex only to initialize uncontrolled state', () => {
        const view = render(wrap(<Tabs items={items} defaultIndex={1}/>))

        expect(getContent(view.container)).toHaveTextContent('Content B')
        view.rerender(wrap(<Tabs items={items} defaultIndex={2}/>))
        expect(getContent(view.container)).toHaveTextContent('Content B')

        fireEvent.click(getTabs(view.container)[0])
        act(() => jest.advanceTimersByTime(50))
        expect(getContent(view.container)).toHaveTextContent('Content A')
    })

    it('applies controlled prop updates immediately unless transitionUpdate is enabled', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} activeIndex={2} onChange={onChange}/>))

        view.rerender(wrap(<Tabs items={items} activeIndex={1} onChange={onChange}/>))
        expect(getContent(view.container)).toHaveTextContent('Content B')

        view.rerender(wrap(<Tabs items={items} activeIndex={0} onChange={onChange}/>))
        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(onChange.mock.calls).toEqual([[1], [0]])
    })

    it('delays an opted-in controlled update until the transition finishes', () => {
        const onChange = jest.fn()
        const view = render(wrap(
            <Tabs items={items} activeIndex={0} transitionUpdate onChange={onChange}/>
        ))

        view.rerender(wrap(
            <Tabs items={items} activeIndex={1} transitionUpdate onChange={onChange}/>
        ))
        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(getContent(view.container)).not.toHaveClass('fade-in')

        act(() => jest.advanceTimersByTime(49))
        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(onChange).not.toHaveBeenCalled()

        act(() => jest.advanceTimersByTime(1))
        expect(getContent(view.container)).toHaveTextContent('Content B')
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(onChange).toHaveBeenCalledWith(1)
    })

    it('keeps a valid controlled index when the item list becomes shorter', () => {
        const view = render(wrap(<Tabs items={items} activeIndex={2} transitionUpdate={false}/>))

        view.rerender(wrap(
            <Tabs items={items.slice(0, 2)} activeIndex={1} transitionUpdate={false}/>
        ))

        expect(getContent(view.container)).toHaveTextContent('Content B')
        expect(getTabs(view.container)[1]).toHaveClass('active')
    })

    it('resets an uncontrolled out-of-range index and refreshes cached tabs and content', () => {
        const view = render(wrap(<Tabs items={items} defaultIndex={2}/>))
        const replacementItems = [{ tab: 'Replacement', content: 'Replacement content' }]

        view.rerender(wrap(<Tabs items={replacementItems} defaultIndex={2}/>))

        expect(getTabs(view.container)).toHaveLength(1)
        expect(view.container).toHaveTextContent('Replacement')
        expect(view.container).not.toHaveTextContent('Tab C')
        expect(getContent(view.container)).toHaveTextContent('Replacement content')
    })
})

describe('Tabs transition lifecycle', () => {
    it('keeps old content during a click transition and commits at 50ms', () => {
        const onChange = jest.fn()
        const { container } = render(wrap(<Tabs items={items} onChange={onChange}/>))

        fireEvent.click(getTabs(container)[1])
        expect(getContent(container)).toHaveTextContent('Content A')
        expect(getContent(container)).not.toHaveClass('fade-in')

        act(() => jest.advanceTimersByTime(49))
        expect(getContent(container)).toHaveTextContent('Content A')

        act(() => jest.advanceTimersByTime(1))
        expect(getContent(container)).toHaveTextContent('Content B')
        expect(getContent(container)).toHaveClass('fade-in')
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(1)
    })

    it('cancels a stale click transition before an immediate controlled update', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} onChange={onChange}/>))

        fireEvent.click(getTabs(view.container)[1])
        act(() => jest.advanceTimersByTime(20))
        view.rerender(wrap(
            <Tabs items={items} activeIndex={2} transitionUpdate={false} onChange={onChange}/>
        ))
        expect(getContent(view.container)).toHaveTextContent('Content C')

        act(() => jest.advanceTimersByTime(100))
        expect(getContent(view.container)).toHaveTextContent('Content C')
        expect(onChange.mock.calls).toEqual([[2]])
    })

    it('cancels a pending transition when unmounted', () => {
        const onChange = jest.fn()
        const tabs = React.createRef()
        const view = render(wrap(<Tabs ref={tabs} items={items} onChange={onChange}/>))

        fireEvent.click(getTabs(view.container)[1])
        const instance = tabs.current
        expect(instance.timers).toHaveLength(1)
        view.unmount()

        act(() => jest.advanceTimersByTime(100))
        expect(onChange).not.toHaveBeenCalled()
        expect(instance.timers).toEqual([])
    })

    it('cancels a controlled transition when refreshed items keep the current index', () => {
        const onChange = jest.fn()
        const tabs = React.createRef()
        const view = render(wrap(<Tabs ref={tabs} items={items} activeIndex={0} onChange={onChange}/>))
        const refreshedItems = items.map((item, index) => ({
            tab: `Refreshed ${index}`,
            content: `Refreshed content ${index}`,
        }))

        fireEvent.click(getTabs(view.container)[1])
        view.rerender(wrap(
            <Tabs ref={tabs} items={refreshedItems} activeIndex={0} onChange={onChange}/>
        ))

        expect(getContent(view.container)).toHaveTextContent('Refreshed content 0')
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(tabs.current.timers).toEqual([])
        expect(onChange).not.toHaveBeenCalled()
    })

    it('cancels an uncontrolled transition when refreshed items invalidate its cached target', () => {
        const onChange = jest.fn()
        const tabs = React.createRef()
        const view = render(wrap(<Tabs ref={tabs} items={items} onChange={onChange}/>))
        const refreshedItems = items.map((item, index) => ({
            tab: `New ${index}`,
            content: `New content ${index}`,
        }))

        fireEvent.click(getTabs(view.container)[2])
        view.rerender(wrap(<Tabs ref={tabs} items={refreshedItems} onChange={onChange}/>))

        expect(getContent(view.container)).toHaveTextContent('New content 0')
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(tabs.current.timers).toEqual([])
        expect(onChange).not.toHaveBeenCalled()
    })
})

describe('Tabs render contracts', () => {
    it('passes the Tabs instance to functional slots and functional content', () => {
        const tabsRef = React.createRef()
        const calls = { before: [], after: [], footer: [], content: [] }
        function before (tabs) {
            calls.before.push(tabs)
            return <span data-testid="before">before:{tabs.state.activeIndex}</span>
        }
        function after (tabs) {
            calls.after.push(tabs)
            return <span data-testid="after">after:{tabs.state.activeIndex}</span>
        }
        function footer (tabs) {
            calls.footer.push(tabs)
            return <span data-testid="footer">footer:{tabs.state.activeIndex}</span>
        }
        function content (tabs) {
            calls.content.push(tabs)
            return <span data-testid="content">content:{tabs.state.activeIndex}</span>
        }
        const functionalItems = [{ tab: 'Function tab', content }]

        const view = render(wrap(
            <Tabs
                ref={tabsRef}
                items={functionalItems}
                childrenBeforeTabs={before}
                childrenAfterTabs={after}
            >
                {footer}
            </Tabs>
        ))

        expect(view.getByTestId('before')).toHaveTextContent('before:0')
        expect(view.getByTestId('after')).toHaveTextContent('after:0')
        expect(view.getByTestId('content')).toHaveTextContent('content:0')
        expect(view.getByTestId('footer')).toHaveTextContent('footer:0')
        expect(calls.before).toEqual([tabsRef.current])
        expect(calls.after).toEqual([tabsRef.current])
        expect(calls.content).toEqual([tabsRef.current])
        expect(calls.footer).toEqual([tabsRef.current])
    })

    it('renders object labels with and without icons as well as React element labels', () => {
        const objectItems = [
            { tab: { text: 'Plain object' }, content: 'Plain content' },
            { tab: { text: 'Settings', icon: 'cog' }, content: 'Settings content' },
            {
                tab: <strong data-testid="element-tab">Element label</strong>,
                content: <em data-testid="element-content">Element content</em>,
            },
        ]
        const view = render(wrap(<Tabs items={objectItems}/>))

        expect(view.container).toHaveTextContent('Plain object')
        expect(view.container.querySelector('.icon-cog')).toBeInTheDocument()
        expect(view.getByTestId('element-tab')).toHaveTextContent('Element label')

        fireEvent.click(getTabs(view.container)[1])
        act(() => jest.advanceTimersByTime(50))
        expect(getContent(view.container)).toHaveTextContent('Settings content')

        fireEvent.click(getTabs(view.container)[2])
        act(() => jest.advanceTimersByTime(50))
        expect(view.getByTestId('element-content')).toHaveTextContent('Element content')
    })
})
