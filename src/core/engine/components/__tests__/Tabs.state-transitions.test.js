import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'
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

    it.each([
        ['by default', undefined],
        ['when transitionUpdate is false', false],
    ])('applies a controlled index from newly added items %s', (_, transitionUpdate) => {
        const onChange = jest.fn()
        const view = render(wrap(
            <Tabs items={items.slice(0, 1)} activeIndex={0} onChange={onChange}/>
        ))

        view.rerender(wrap(
            <Tabs
                items={items}
                activeIndex={2}
                transitionUpdate={transitionUpdate}
                onChange={onChange}
            />
        ))

        expect(getContent(view.container)).toHaveTextContent('Content C')
        expect(getTabs(view.container)[2]).toHaveClass('active')
        expect(onChange.mock.calls).toEqual([[2]])
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
        // Read through spies on the timers with the 50 ms transition delay. This test used to read
        // `@withTimer`'s `timers` array through a ref; the component is a function since §9.3 step 6,
        // and not `jest.getTimerCount()` either, which on React 16 and 17 counts the scheduler's own.
        const scheduled = jest.spyOn(global, 'setTimeout')
        const cleared = jest.spyOn(global, 'clearTimeout')
        try {
            const transitions = () => scheduled.mock.calls
                .map((call, i) => (call[1] === 50 ? [scheduled.mock.results[i].value] : []))
                .flat()
            const onChange = jest.fn()
            const view = render(wrap(<Tabs items={items} onChange={onChange}/>))

            fireEvent.click(getTabs(view.container)[1])
            const [pending] = transitions()
            expect(transitions()).toHaveLength(1)
            expect(cleared.mock.calls.some(([id]) => id === pending)).toBe(false)
            view.unmount()

            expect(cleared.mock.calls.some(([id]) => id === pending)).toBe(true)
            act(() => jest.advanceTimersByTime(100))
            expect(onChange).not.toHaveBeenCalled()
        } finally {
            scheduled.mockRestore()
            cleared.mockRestore()
        }
    })

    // The mapper hands Tabs a freshly built `items` array on every render, so "items changed" is
    // permanently true when driven by UI Render. Cancelling a pending transition on that signal
    // would drop the click of any host that re-renders inside the 50 ms window.
    it('keeps a controlled transition alive when refreshed items keep the current index', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} activeIndex={0} onChange={onChange}/>))
        const refreshedItems = items.map((item, index) => ({
            tab: `Refreshed ${index}`,
            content: `Refreshed content ${index}`,
        }))

        fireEvent.click(getTabs(view.container)[1])
        view.rerender(wrap(
            <Tabs items={refreshedItems} activeIndex={0} onChange={onChange}/>
        ))
        act(() => jest.advanceTimersByTime(100))

        expect(getContent(view.container)).toHaveTextContent('Refreshed content 1')
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(onChange.mock.calls).toEqual([[1]])
    })

    it('keeps an uncontrolled transition alive across a refreshed items array', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} onChange={onChange}/>))
        const refreshedItems = items.map((item, index) => ({
            tab: `New ${index}`,
            content: `New content ${index}`,
        }))

        fireEvent.click(getTabs(view.container)[2])
        view.rerender(wrap(<Tabs items={refreshedItems} onChange={onChange}/>))
        act(() => jest.advanceTimersByTime(100))

        expect(getContent(view.container)).toHaveTextContent('New content 2')
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(onChange.mock.calls).toEqual([[2]])
    })

    it('normalizes a pending target that no longer exists when the timer fires', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} onChange={onChange}/>))

        fireEvent.click(getTabs(view.container)[2])
        view.rerender(wrap(<Tabs items={items.slice(0, 1)} onChange={onChange}/>))
        act(() => jest.advanceTimersByTime(100))

        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(onChange.mock.calls).toEqual([[0]])
    })

    it('lets the last of two clicks inside one transition win', () => {
        const onChange = jest.fn()
        const { container } = render(wrap(<Tabs items={items} onChange={onChange}/>))

        fireEvent.click(getTabs(container)[1])
        act(() => jest.advanceTimersByTime(20))
        fireEvent.click(getTabs(container)[2])
        act(() => jest.advanceTimersByTime(49))
        expect(getContent(container)).toHaveTextContent('Content A')

        act(() => jest.advanceTimersByTime(1))
        expect(getContent(container)).toHaveTextContent('Content C')
        expect(onChange.mock.calls).toEqual([[2]])
    })

    it('drops a pending click for a controlled change with transitionUpdate, which then waits 50 ms', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} activeIndex={0} transitionUpdate onChange={onChange}/>))

        fireEvent.click(getTabs(view.container)[1])
        act(() => jest.advanceTimersByTime(20))
        view.rerender(wrap(<Tabs items={items} activeIndex={2} transitionUpdate onChange={onChange}/>))
        act(() => jest.advanceTimersByTime(49))
        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(onChange).not.toHaveBeenCalled()

        act(() => jest.advanceTimersByTime(1))
        expect(getContent(view.container)).toHaveTextContent('Content C')
        expect(onChange.mock.calls).toEqual([[2]])
    })

    it('applies a controlled change at once, transitionUpdate or not, when the active tab is gone', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} defaultIndex={2} onChange={onChange}/>))

        view.rerender(wrap(<Tabs items={items.slice(0, 2)} activeIndex={1} transitionUpdate onChange={onChange}/>))

        expect(getContent(view.container)).toHaveTextContent('Content B')
        expect(onChange.mock.calls).toEqual([[1]])
    })

    it('does not report resetting an uncontrolled index the items no longer have', () => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} defaultIndex={2} onChange={onChange}/>))

        view.rerender(wrap(<Tabs items={items.slice(0, 1)} onChange={onChange}/>))

        expect(getContent(view.container)).toHaveTextContent('Content A')
        expect(onChange).not.toHaveBeenCalled()
    })

    it.each([
        ['uncontrolled', undefined],
        ['controlled with the current index', 0],
    ])('ends the faded state when the items change during a click, and keeps the click (%s)', (_, activeIndex) => {
        const onChange = jest.fn()
        const view = render(wrap(<Tabs items={items} activeIndex={activeIndex} onChange={onChange}/>))
        const changedItems = items.map((item, index) => ({ tab: `Changed ${index}`, content: `Changed content ${index}` }))

        fireEvent.click(getTabs(view.container)[1])
        expect(getContent(view.container)).not.toHaveClass('fade-in')
        view.rerender(wrap(<Tabs items={changedItems} activeIndex={activeIndex} onChange={onChange}/>))
        expect(getContent(view.container)).toHaveClass('fade-in')
        expect(getContent(view.container)).toHaveTextContent('Changed content 0')

        act(() => jest.advanceTimersByTime(50))
        expect(getContent(view.container)).toHaveTextContent('Changed content 1')
        expect(onChange.mock.calls).toEqual([[1]])
    })
})

describe('Tabs and the parent that renders it', () => {
    it('reports a click once when the parent follows it with a controlled activeIndex', () => {
        // THE ONE BEHAVIOUR CHANGE of §9.3 step 6 here. The class compared a controlled `activeIndex`
        // with its COMMITTED active tab, which a parent updating in the same batch had not reached yet,
        // so it set the tab a second time and reported the click twice: `[1, 1]` on React 16, 17 and
        // 18. The items are rebuilt on every render, as the mapper builds them.
        const reports = []
        const Parent = () => {
            const [index, setIndex] = React.useState(0)
            return (
                <Tabs items={items.map(item => ({ ...item }))} activeIndex={index}
                      onChange={i => { reports.push(i); setIndex(i) }}/>
            )
        }
        const { container } = render(wrap(<Parent/>))

        fireEvent.click(getTabs(container)[1])
        act(() => jest.advanceTimersByTime(50))
        act(() => jest.advanceTimersByTime(50))

        expect(getContent(container)).toHaveTextContent('Content B')
        expect(reports).toEqual([1])
    })

    it('goes back to a controlled activeIndex the parent did not adopt, on its next render', () => {
        // The lifecycle ran on every parent render, equal props included, so nothing is memoised.
        const reports = []
        const onChange = i => reports.push(i)
        let rerenderParent
        const Parent = () => {
            const [, setCount] = React.useState(0)
            rerenderParent = () => setCount(count => count + 1)
            return <Tabs items={items} activeIndex={0} onChange={onChange}/>
        }
        const { container } = render(wrap(<Parent/>))

        fireEvent.click(getTabs(container)[2])
        act(() => jest.advanceTimersByTime(50))
        expect(getContent(container)).toHaveTextContent('Content C')

        act(() => rerenderParent())
        expect(getContent(container)).toHaveTextContent('Content A')
        expect(reports).toEqual([2, 0])
    })

    it('switches at once when function content calls setTab(index, false), dropping a pending click', () => {
        const onChange = jest.fn()
        const jumpItems = [
            { tab: 'One', content: tabs => <button onClick={() => tabs.setTab(2, false)}>Jump</button> },
            { tab: 'Two', content: 'Two content' },
            { tab: 'Three', content: 'Three content' },
        ]
        const view = render(wrap(<Tabs items={jumpItems} onChange={onChange}/>))

        fireEvent.click(getTabs(view.container)[1])
        fireEvent.click(view.getByText('Jump'))
        expect(getContent(view.container)).toHaveTextContent('Three content')

        act(() => jest.advanceTimersByTime(100))
        expect(getContent(view.container)).toHaveTextContent('Three content')
        expect(onChange.mock.calls).toEqual([[2]])
    })

    it('reports each change once under StrictMode, without a warning', () => {
        // The class drew React's StrictMode warning about `UNSAFE_componentWillReceiveProps`.
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            const reports = []
            const onChange = i => reports.push(i)
            const strict = ui => <React.StrictMode>{wrap(ui)}</React.StrictMode>
            const view = render(strict(<Tabs items={items} activeIndex={0} onChange={onChange}/>))

            fireEvent.click(getTabs(view.container)[1])
            act(() => jest.advanceTimersByTime(50))
            view.rerender(strict(<Tabs items={items} activeIndex={2} onChange={onChange}/>))

            expect(getContent(view.container)).toHaveTextContent('Content C')
            expect(reports).toEqual([1, 2])
            expect(errors).not.toHaveBeenCalled()
        } finally {
            errors.mockRestore()
        }
    })
})

describe('Tabs render contracts', () => {
    it('passes functional slots and content one object for the component\'s lifetime', () => {
        // What the class passed was `this`, which these assertions read through a ref. A function
        // component has no instance, so the object the slots receive is compared with itself.
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

        view.rerender(wrap(
            <Tabs className="again" items={functionalItems} childrenBeforeTabs={before} childrenAfterTabs={after}>
                {footer}
            </Tabs>
        ))
        const received = [...calls.before, ...calls.after, ...calls.content, ...calls.footer]
        expect(calls.before.length).toBeGreaterThanOrEqual(2)
        expect(new Set(received).size).toBe(1)
        expect(received[0]).toEqual(expect.objectContaining({
            state: expect.objectContaining({ activeIndex: 0 }),
            setTab: expect.any(Function),
        }))
    })

    it('accepts items without a tab, as hidden tabs driven by activeIndex use them', () => {
        // The demo's Dynamic Layout example does exactly this, and meta.schema.json places no
        // constraint on `tab`. While the prop type required one, every such Tabs drew a warning.
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            const headless = [{ content: 'First layout' }, { content: 'Second layout' }]
            const view = render(wrap(<Tabs items={headless} activeIndex={1} classNameTabs="hide"/>))

            expect(getContent(view.container)).toHaveTextContent('Second layout')
            expect(errors).not.toHaveBeenCalled()
        } finally {
            errors.mockRestore()
        }
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
