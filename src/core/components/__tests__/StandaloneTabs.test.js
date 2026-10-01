import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StandaloneTabs from '../StandaloneTabs'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const withConfig = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const items = [
    { tab: 'Overview', content: 'Overview content' },
    { tab: 'Details', content: 'Details content' },
    { tab: 'History', content: 'History content' },
]

describe('core StandaloneTabs interaction contract', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('renders labels and respects an uncontrolled default index', () => {
        const { container } = render(withConfig(
            <StandaloneTabs items={items} defaultIndex="1" buttoned centerTabs />
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
            <StandaloneTabs items={items} onChange={onChange} />
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
            <StandaloneTabs items={items} activeIndex={0} transitionUpdate={false} onChange={onChange} />
        ))

        rerender(withConfig(
            <StandaloneTabs items={items} activeIndex="1" transitionUpdate={false} onChange={onChange} />
        ))

        expect(screen.getByText('Details content')).toBeInTheDocument()
        expect(onChange).toHaveBeenCalledWith(1)
    })

    it('resets to the first panel when a changed item list becomes shorter', () => {
        const { rerender } = render(withConfig(
            <StandaloneTabs items={items} defaultIndex={2} />
        ))
        expect(screen.getByText('History content')).toBeInTheDocument()

        const shortened = [{ tab: 'Only tab', content: 'Only content' }]
        rerender(withConfig(<StandaloneTabs items={shortened} />))

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
            <StandaloneTabs items={customItems}>{children}</StandaloneTabs>
        ))

        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(container.querySelector('.icon-cog')).toBeInTheDocument()
        expect(screen.getByText('Custom label')).toBeInTheDocument()
        expect(screen.getByText('active:0')).toBeInTheDocument()
        expect(screen.getByText('child:2')).toBeInTheDocument()
        expect(contentCall).toHaveBeenCalledWith(expect.objectContaining({ setTab: expect.any(Function) }))
        expect(childrenCall).toHaveBeenCalledWith(expect.objectContaining({ setTab: expect.any(Function) }))
    })

    it('renders a `{text}` tab without an icon as its text', () => {
        // `propTypes` accept `{text}` alone, and it was rendered as the object itself, which React rejects.
        render(withConfig(
            <StandaloneTabs items={[{ tab: { text: 'Plain' }, content: 'plain content' }, { tab: 'Other', content: 'x' }]}/>
        ))

        expect(screen.getByText('Plain')).toBeInTheDocument()
        expect(screen.getByText('plain content')).toBeInTheDocument()
    })

    it('reports a click once when the parent follows it with a controlled activeIndex', () => {
        // THE ONE BEHAVIOUR CHANGE of §9.3 step 6 here, and the reason for it. The class compared a
        // controlled `activeIndex` with its COMMITTED active tab, which a parent updating in the same
        // batch had not reached yet, so it started a second transition and reported the click twice:
        // `[2, 2]` on React 16, 17 and 18. The demo's NavTabs is such a parent, and pushed every tab's
        // URL onto the history twice.
        const reports = []
        const Parent = () => {
            const [index, setIndex] = React.useState(0)
            return <StandaloneTabs items={items} activeIndex={index} onChange={i => { reports.push(i); setIndex(i) }}/>
        }
        const { container } = render(withConfig(<Parent/>))

        fireEvent.click(container.querySelectorAll('.tabs__item')[2])
        act(() => { jest.advanceTimersByTime(50) })
        act(() => { jest.advanceTimersByTime(50) })

        expect(screen.getByText('History content')).toBeInTheDocument()
        expect(reports).toEqual([2])
    })

    it('applies a controlled activeIndex change after the transition when transitionUpdate is not set', () => {
        // `setTab`'s `transition = true` default applies to an undefined `transitionUpdate`.
        const onChange = jest.fn()
        const { rerender } = render(withConfig(
            <StandaloneTabs items={items} activeIndex={0} onChange={onChange} />
        ))

        rerender(withConfig(<StandaloneTabs items={items} activeIndex={2} onChange={onChange} />))
        expect(screen.getByText('Overview content')).toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()

        act(() => { jest.advanceTimersByTime(50) })
        expect(screen.getByText('History content')).toBeInTheDocument()
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('returns to a controlled activeIndex on any parent render, even with the value unchanged', () => {
        // The lifecycle ran on every parent render, not only when `activeIndex` changed, so a tab the
        // parent did not adopt goes back as soon as the parent renders again. The function component
        // detects a parent render by its new props object for this reason (§9.3 step 6).
        const view = render(withConfig(<StandaloneTabs items={items} activeIndex={0} transitionUpdate={false} />))
        fireEvent.click(view.container.querySelectorAll('.tabs__item')[2])
        act(() => { jest.advanceTimersByTime(50) })
        expect(screen.getByText('History content')).toBeInTheDocument()

        view.rerender(withConfig(<StandaloneTabs items={items} activeIndex={0} transitionUpdate={false} />))

        expect(screen.getByText('Overview content')).toBeInTheDocument()
    })

    it('reports through the onChange of the latest render when a transition finishes', () => {
        const first = jest.fn()
        const second = jest.fn()
        const { container, rerender } = render(withConfig(<StandaloneTabs items={items} onChange={first} />))

        fireEvent.click(container.querySelectorAll('.tabs__item')[1])
        rerender(withConfig(<StandaloneTabs items={items} onChange={second} />))
        act(() => { jest.advanceTimersByTime(50) })

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledWith(1)
    })

    it('lets function children switch tabs at once through the handle', () => {
        // `setTab(index, false)` on the handle: no transition, and the change is reported. The class's
        // lifecycle used to reach this path too; since §9.3 step 6 only a caller of the handle does.
        const onChange = jest.fn()
        render(withConfig(
            <StandaloneTabs items={items} onChange={onChange}>
                {instance => <button onClick={() => instance.setTab(2, false)}>Jump</button>}
            </StandaloneTabs>
        ))

        fireEvent.click(screen.getByText('Jump'))

        expect(screen.getByText('History content')).toBeInTheDocument()
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('passes function content and children the same object on every render', () => {
        // What the class passed was `this`, one object for its lifetime.
        const seen = []
        const content = instance => {
            seen.push(instance)
            return <div>content</div>
        }
        const { rerender } = render(withConfig(<StandaloneTabs items={[{ tab: 'Only', content }]} />))
        rerender(withConfig(<StandaloneTabs items={[{ tab: 'Only', content }]} className="again" />))

        expect(seen.length).toBeGreaterThanOrEqual(2)
        expect(new Set(seen).size).toBe(1)
    })

    it('cancels a pending tab transition when unmounted', () => {
        const onChange = jest.fn()
        const { container, unmount } = render(withConfig(
            <StandaloneTabs items={items} onChange={onChange} />
        ))

        fireEvent.click(container.querySelectorAll('.tabs__item')[1])
        unmount()
        act(() => {
            jest.runOnlyPendingTimers()
        })

        expect(onChange).not.toHaveBeenCalled()
    })
})
