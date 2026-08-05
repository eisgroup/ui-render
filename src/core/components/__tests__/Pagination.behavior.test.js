import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import Pagination from '../Pagination'

const defaultProps = {
  activePage: 5,
  totalPages: 10,
  onPageChange: jest.fn(),
}

function renderPagination (props = {}) {
  return render(<Pagination {...defaultProps} {...props} />)
}

function renderedPages () {
  return screen.queryAllByRole('button', { name: /^Page / }).map((button) => Number(button.textContent))
}

describe('Pagination interaction and edge contracts', () => {
  beforeEach(() => {
    defaultProps.onPageChange.mockClear()
  })

  it.each([0, 1, -2, NaN, Infinity, 2.5])('stays hidden for an unusable total page count: %p', (totalPages) => {
    const { container } = renderPagination({ totalPages })

    expect(container).toBeEmptyDOMElement()
  })

  it('exposes a named navigation landmark and an unambiguous current page', () => {
    renderPagination({ activePage: 3, totalPages: 5, className: 'compact custom-pagination' })

    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    const current = within(navigation).getByRole('button', { name: 'Page 3' })

    expect(navigation).toHaveClass('app__pagination', 'compact', 'custom-pagination')
    expect(current).toHaveClass('active')
    expect(current).toHaveAttribute('aria-current', 'page')
    within(navigation).getAllByRole('button').forEach((button) => expect(button).toHaveAttribute('type', 'button'))
    expect(navigation.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('passes the click event and semantic page payload for a numbered page', () => {
    const onPageChange = jest.fn()
    renderPagination({ activePage: 3, totalPages: 5, onPageChange })
    const page = screen.getByRole('button', { name: 'Page 5' })

    fireEvent.click(page)

    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange.mock.calls[0][0]).toEqual(expect.objectContaining({ type: 'click' }))
    expect(onPageChange.mock.calls[0][0].target).toBe(page)
    expect(onPageChange.mock.calls[0][1]).toEqual({ activePage: 5 })
  })

  it('moves one page backward and forward through the labelled controls', () => {
    const onPageChange = jest.fn()
    renderPagination({ activePage: 3, totalPages: 5, onPageChange })

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange.mock.calls.map(([, payload]) => payload)).toEqual([
      { activePage: 2 },
      { activePage: 4 },
    ])
  })

  it('keeps disabled boundary controls and the current page inert', () => {
    const onPageChange = jest.fn()
    const { rerender } = renderPagination({ activePage: 1, totalPages: 5, onPageChange })
    const previous = screen.getByRole('button', { name: 'Previous page' })

    expect(previous).toBeDisabled()
    expect(previous).toHaveClass('disabled')
    fireEvent.click(previous)
    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }))

    rerender(<Pagination activePage={5} totalPages={5} onPageChange={onPageChange} />)
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next).toBeDisabled()
    fireEvent.click(next)
    fireEvent.click(screen.getByRole('button', { name: 'Page 5' }))

    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('supports rendering without a change callback', () => {
    renderPagination({ onPageChange: undefined })

    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Page 6' }))).not.toThrow()
  })

  it('uses compact consecutive links for a small page count', () => {
    const { container, rerender } = renderPagination({ activePage: 2, totalPages: 3 })

    expect(renderedPages()).toEqual([1, 2, 3])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(0)

    rerender(
      <Pagination
        activePage={2}
        totalPages={3}
        siblingCount={10}
        boundaryCount={10}
        onPageChange={defaultProps.onPageChange}
      />,
    )
    expect(renderedPages()).toEqual([1, 2, 3])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(0)
  })

  it('shows symmetric siblings and boundaries around a middle page', () => {
    const { container } = renderPagination({ activePage: 5, totalPages: 10 })

    expect(renderedPages()).toEqual([1, 4, 5, 6, 10])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(2)
  })

  it('expands the range instead of showing an ellipsis near either boundary', () => {
    const { container, rerender } = renderPagination({ activePage: 2, totalPages: 10 })

    expect(renderedPages()).toEqual([1, 2, 3, 4, 5, 10])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(1)

    rerender(<Pagination activePage={9} totalPages={10} onPageChange={defaultProps.onPageChange} />)
    expect(renderedPages()).toEqual([1, 6, 7, 8, 9, 10])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(1)
  })

  it('honours explicit sibling and boundary counts', () => {
    const { container } = renderPagination({
      activePage: 5,
      totalPages: 10,
      siblingCount: 0,
      boundaryCount: 2,
    })

    expect(renderedPages()).toEqual([1, 2, 5, 9, 10])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(2)
  })

  it('clamps pages below the valid range to the first page', () => {
    const onPageChange = jest.fn()
    renderPagination({ activePage: -20, totalPages: 5, onPageChange })

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(expect.anything(), { activePage: 2 })
  })

  it('clamps pages above the valid range to the last page', () => {
    const onPageChange = jest.fn()
    renderPagination({ activePage: Infinity, totalPages: 5, onPageChange })

    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Page 5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(expect.anything(), { activePage: 4 })
  })

  it('falls back to the first page for a non-numeric active page', () => {
    renderPagination({ activePage: NaN, totalPages: 5 })

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('truncates fractional pages and sanitizes invalid layout counts', () => {
    const { container } = renderPagination({
      activePage: 2.9,
      totalPages: 10,
      siblingCount: Infinity,
      boundaryCount: -5,
    })

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    expect(renderedPages()).toEqual([1, 2, 3, 4])
    expect(container.querySelectorAll('.app__pagination__ellipsis')).toHaveLength(1)
  })
})
