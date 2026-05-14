import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Pagination from '../Pagination'

describe('Pagination', () => {
    it('returns null when only one page', () => {
        const { container } = render(<Pagination activePage={1} totalPages={1} onPageChange={() => {}} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders prev/next buttons and pages', () => {
        const { container } = render(<Pagination activePage={1} totalPages={3} onPageChange={() => {}} />)
        const buttons = container.querySelectorAll('button')
        expect(buttons.length).toBeGreaterThanOrEqual(2 + 3)
    })

    it('marks active page with active class', () => {
        const { container } = render(<Pagination activePage={2} totalPages={5} onPageChange={() => {}} />)
        const active = container.querySelector('button.active')
        expect(active).toBeInTheDocument()
        expect(active.textContent).toBe('2')
    })

    it('disables previous on first page', () => {
        const { container } = render(<Pagination activePage={1} totalPages={5} onPageChange={() => {}} />)
        const prev = container.querySelector('button[aria-label="Previous page"]')
        expect(prev).toBeDisabled()
    })

    it('disables next on last page', () => {
        const { container } = render(<Pagination activePage={5} totalPages={5} onPageChange={() => {}} />)
        const next = container.querySelector('button[aria-label="Next page"]')
        expect(next).toBeDisabled()
    })

    it('calls onPageChange when clicking a page', () => {
        const onPageChange = jest.fn()
        const { container } = render(<Pagination activePage={2} totalPages={5} onPageChange={onPageChange} />)
        const page3 = container.querySelector('button[aria-label="Page 3"]')
        fireEvent.click(page3)
        expect(onPageChange).toHaveBeenCalledTimes(1)
        expect(onPageChange.mock.calls[0][1]).toEqual({ activePage: 3 })
    })

    it('does not fire callback when clicking the active page', () => {
        const onPageChange = jest.fn()
        const { container } = render(<Pagination activePage={3} totalPages={5} onPageChange={onPageChange} />)
        const active = container.querySelector('button.active')
        fireEvent.click(active)
        expect(onPageChange).not.toHaveBeenCalled()
    })

    it('shows ellipsis with many pages', () => {
        const { container } = render(<Pagination activePage={5} totalPages={20} onPageChange={() => {}} />)
        const ellipses = container.querySelectorAll('.app__pagination__ellipsis')
        expect(ellipses.length).toBeGreaterThan(0)
    })

    it('moves to next page via the › button', () => {
        const onPageChange = jest.fn()
        const { container } = render(<Pagination activePage={1} totalPages={3} onPageChange={onPageChange} />)
        const next = container.querySelector('button[aria-label="Next page"]')
        fireEvent.click(next)
        expect(onPageChange.mock.calls[0][1]).toEqual({ activePage: 2 })
    })
})
