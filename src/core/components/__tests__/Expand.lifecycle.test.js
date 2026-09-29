import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Expand from '../Expand'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const labelOf = container => container.querySelector('.app__expand > .text')

describe('Expand lifecycle contracts', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('keeps collapsing content mounted until animation completes', () => {
        const onClick = jest.fn()
        const { container } = render(wrap(
            <Expand
                id="details"
                index={4}
                title="Details"
                expanded
                duration={100}
                onClick={onClick}
            >
                <span>Protected content</span>
            </Expand>
        ))

        fireEvent.click(labelOf(container))

        expect(container.querySelector('.app__expand')).not.toHaveClass('expanded')
        expect(screen.getByText('Protected content')).toBeInTheDocument()
        expect(onClick).toHaveBeenCalledWith({
            expanded: false,
            index: 4,
            key: 'details',
            value: 'Details',
        })

        act(() => jest.advanceTimersByTime(99))
        expect(screen.getByText('Protected content')).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(1))
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('passes the component id to lazy children when expansion starts', () => {
        const calls = []
        const renderContent = function (id) {
            calls.push(id)
            return <span>Loaded for {id}</span>
        }
        const { container } = render(wrap(
            <Expand id="group-7" title="Group">{renderContent}</Expand>
        ))

        expect(calls).toEqual([])
        fireEvent.click(labelOf(container))

        expect(calls).toEqual(['group-7'])
        expect(screen.getByText('Loaded for group-7')).toBeInTheDocument()
    })

    it('invalidates cached lazy content only when the children function changes', () => {
        let firstCalls = 0
        let secondCalls = 0
        const first = function () {
            firstCalls += 1
            return <span>First content</span>
        }
        const second = function () {
            secondCalls += 1
            return <span>Second content</span>
        }
        const { container, rerender } = render(wrap(
            <Expand title="Section" expanded active={false}>{first}</Expand>
        ))

        expect(firstCalls).toBe(1)
        rerender(wrap(<Expand title="Section" expanded active>{first}</Expand>))
        expect(firstCalls).toBe(1)

        rerender(wrap(<Expand title="Section" expanded active>{second}</Expand>))
        expect(secondCalls).toBe(1)
        expect(container.querySelector('.app__expand')).toHaveClass('active')
        expect(screen.getByText('Second content')).toBeInTheDocument()
    })

    it('synchronizes expansion from props without duplicate callbacks', () => {
        const onClick = jest.fn()
        const { container, rerender } = render(wrap(
            <Expand title="Remote" expanded={false} onClick={onClick}>Content</Expand>
        ))

        rerender(wrap(
            <Expand title="Remote" expanded onClick={onClick}>Content</Expand>
        ))
        expect(container.querySelector('.app__expand')).toHaveClass('expanded')
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ expanded: true }))

        onClick.mockClear()
        rerender(wrap(
            <Expand title="Remote" expanded onClick={onClick}>Content</Expand>
        ))
        expect(onClick).not.toHaveBeenCalled()
    })

    it('supports justified custom labels and state-specific icons', () => {
        const { container } = render(wrap(
            <Expand
                title="Summary"
                expanded
                justify
                iconOpened="minus"
                iconClosed="plus"
                classNameLabel="custom-label"
            >
                Content
            </Expand>
        ))

        const label = labelOf(container)
        expect(label).toHaveClass('justify', 'custom-label')
        expect(label.firstChild).toHaveTextContent('Summary')
        expect(container.querySelector('.icon-minus')).toBeInTheDocument()
        expect(container.querySelector('.icon-plus')).not.toBeInTheDocument()
    })

    it('renders content without a clickable label when no label source is supplied', () => {
        const { container } = render(wrap(
            <Expand expanded><span>Label-free content</span></Expand>
        ))

        expect(labelOf(container)).not.toBeInTheDocument()
        expect(screen.getByText('Label-free content')).toBeInTheDocument()
    })

    it('reports each change once when the parent passes it back as `expanded`', () => {
        // ONE OF THE TWO BEHAVIOUR CHANGES of §9.3 step 6 here. The class compared a changed `expanded`
        // with its COMMITTED state, which the expansion the parent was following had not reached yet,
        // so it expanded a second time and reported `[true, true]` on React 16, 17 and 18. TableView's
        // `handleItemExpand` and the demo's Examples page are such parents; the demo pushed every
        // example's URL onto the history twice.
        const reports = []
        const Parent = () => {
            const [open, setOpen] = React.useState(false)
            return (
                <Expand title="Followed" expanded={open} duration={100}
                        onClick={({ expanded }) => { reports.push(expanded); setOpen(expanded) }}>
                    <span>Followed content</span>
                </Expand>
            )
        }
        const { container } = render(wrap(<Parent/>))

        fireEvent.click(labelOf(container))
        expect(container.querySelector('.app__expand')).toHaveClass('expanded')
        fireEvent.click(labelOf(container))
        act(() => jest.advanceTimersByTime(100))

        expect(reports).toEqual([true, false])
        expect(screen.queryByText('Followed content')).not.toBeInTheDocument()
    })

    it('keeps the content of a second collapse until its own animation is over', () => {
        // THE OTHER BEHAVIOUR CHANGE. The class kept every collapse's timer, so the first one, due at
        // 100 ms, unmounted the content in the middle of the second collapse's animation.
        const { container } = render(wrap(
            <Expand title="Twice" expanded duration={100}><span>Twice content</span></Expand>
        ))

        fireEvent.click(labelOf(container))
        act(() => jest.advanceTimersByTime(30))
        fireEvent.click(labelOf(container))
        act(() => jest.advanceTimersByTime(30))
        fireEvent.click(labelOf(container))

        act(() => jest.advanceTimersByTime(41))
        expect(screen.getByText('Twice content')).toBeInTheDocument()
        act(() => jest.advanceTimersByTime(59))
        expect(screen.queryByText('Twice content')).not.toBeInTheDocument()
    })

    it('toggles when a controlled `expanded` goes back to undefined', () => {
        // `undefined` is the default argument of the class's `update()`, which toggled.
        const reports = []
        const onClick = ({ expanded }) => reports.push(expanded)
        const { container, rerender } = render(wrap(
            <Expand title="Remote" expanded onClick={onClick}>Content</Expand>
        ))

        rerender(wrap(<Expand title="Remote" onClick={onClick}>Content</Expand>))
        expect(container.querySelector('.app__expand')).not.toHaveClass('expanded')

        rerender(wrap(<Expand title="Remote" expanded={false} onClick={onClick}>Content</Expand>))
        rerender(wrap(<Expand title="Remote" onClick={onClick}>Content</Expand>))
        expect(container.querySelector('.app__expand')).toHaveClass('expanded')
        expect(reports).toEqual([false, true])
    })

    it('treats a first `expanded={false}` as a collapse when the prop was never given', () => {
        // The state starts as the prop, so `undefined` and `false` differ: a collapse is reported, and
        // lazy content is mounted until its animation is over, although it was never shown.
        const reports = []
        const onClick = ({ expanded }) => reports.push(expanded)
        let calls = 0
        const lazy = function () {
            calls += 1
            return <span>Never shown</span>
        }
        const { rerender } = render(wrap(
            <Expand title="Fresh" duration={100} onClick={onClick}>{lazy}</Expand>
        ))

        rerender(wrap(<Expand title="Fresh" duration={100} expanded={false} onClick={onClick}>{lazy}</Expand>))
        expect(reports).toEqual([false])
        expect(calls).toBe(1)

        act(() => jest.advanceTimersByTime(100))
        expect(screen.queryByText('Never shown')).not.toBeInTheDocument()
    })

    it('calls lazy children once, however often the content is collapsed and expanded again', () => {
        let calls = 0
        const lazy = function () {
            calls += 1
            return <span>Cached content</span>
        }
        const { container } = render(wrap(<Expand title="Cached" duration={100}>{lazy}</Expand>))

        fireEvent.click(labelOf(container))
        fireEvent.click(labelOf(container))
        act(() => jest.advanceTimersByTime(100))
        expect(screen.queryByText('Cached content')).not.toBeInTheDocument()

        fireEvent.click(labelOf(container))
        expect(screen.getByText('Cached content')).toBeInTheDocument()
        expect(calls).toBe(1)
    })

    it('reports each change once under StrictMode', () => {
        const reports = []
        const { container } = render(
            <React.StrictMode>
                {wrap(
                    <Expand title="Strict" duration={100} onClick={({ expanded }) => reports.push(expanded)}>
                        Content
                    </Expand>
                )}
            </React.StrictMode>
        )

        fireEvent.click(labelOf(container))
        fireEvent.click(labelOf(container))
        act(() => jest.advanceTimersByTime(100))

        expect(reports).toEqual([true, false])
    })

    it('renders again only when its props change, as the PureComponent did', () => {
        let labels = 0
        const renderLabel = function (title) {
            labels += 1
            return <span>{title}</span>
        }
        let rerenderParent
        const Parent = ({ title }) => {
            const [, setCount] = React.useState(0)
            rerenderParent = () => setCount(count => count + 1)
            return <Expand title={title} renderLabel={renderLabel}>Content</Expand>
        }
        const { rerender } = render(wrap(<Parent title="Pure"/>))
        expect(labels).toBe(1)

        act(() => rerenderParent())
        expect(labels).toBe(1)

        rerender(wrap(<Parent title="Changed"/>))
        expect(labels).toBe(2)
    })

    it('times only a collapse, and cancels its timer when unmounted', () => {
        // Read through spies on the timers with the component's own `duration`; see the note on
        // `jest.getTimerCount()` in docs/UPGRADE-PLAN.md §9.3 step 6.
        const scheduled = jest.spyOn(global, 'setTimeout')
        const cleared = jest.spyOn(global, 'clearTimeout')
        try {
            const collapses = () => scheduled.mock.calls
                .map((call, i) => (call[1] === 137 ? [scheduled.mock.results[i].value] : []))
                .flat()
            const { container, unmount } = render(wrap(
                <Expand title="Timed" duration={137}>Content</Expand>
            ))

            fireEvent.click(labelOf(container))
            expect(collapses()).toEqual([])

            fireEvent.click(labelOf(container))
            const [collapse] = collapses()
            expect(collapses()).toHaveLength(1)
            expect(cleared.mock.calls.some(([id]) => id === collapse)).toBe(false)

            unmount()
            expect(cleared.mock.calls.some(([id]) => id === collapse)).toBe(true)
        } finally {
            scheduled.mockRestore()
            cleared.mockRestore()
        }
    })
})
