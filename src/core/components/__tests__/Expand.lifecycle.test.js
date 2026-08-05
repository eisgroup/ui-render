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
            <Expand id="policy-7" title="Policy">{renderContent}</Expand>
        ))

        expect(calls).toEqual([])
        fireEvent.click(labelOf(container))

        expect(calls).toEqual(['policy-7'])
        expect(screen.getByText('Loaded for policy-7')).toBeInTheDocument()
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
})
