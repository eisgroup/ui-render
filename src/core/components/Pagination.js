import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Pagination control. API matches the semantic-ui-react `Pagination` subset we use:
 *   onPageChange(event, { activePage }) is invoked with the new 1-indexed page.
 *
 * @param {Number} activePage - 1-indexed current page
 * @param {Number} totalPages - total number of pages
 * @param {Function} onPageChange - (event, { activePage }) => void
 * @param {Number} [siblingCount=1] - page links shown on each side of the current page
 * @param {Number} [boundaryCount=1] - page links shown at the start and end
 * @param {String} [className]
 */
function Pagination ({
  activePage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className,
}) {
  if (!Number.isSafeInteger(totalPages) || totalPages < 2) return null
  const page = normalizePage(activePage, totalPages)
  const siblings = normalizeCount(siblingCount)
  const boundary = normalizeCount(boundaryCount)
  const items = buildItems(page, totalPages, siblings, boundary)
  const go = (event, nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange && onPageChange(event, { activePage: nextPage })
  }

  return (
    <nav className={classNames('app__pagination', className)} role='navigation' aria-label='Pagination'>
      <PageButton
        disabled={page <= 1}
        onClick={(e) => go(e, page - 1)}
        ariaLabel='Previous page'
      >
        ‹
      </PageButton>
      {items.map((item, i) => {
        if (item === 'ellipsis') {
          return <span key={`e${i}`} className='app__pagination__ellipsis'>…</span>
        }
        return (
          <PageButton
            key={item}
            active={item === page}
            onClick={(e) => go(e, item)}
            ariaLabel={`Page ${item}`}
          >
            {item}
          </PageButton>
        )
      })}
      <PageButton
        disabled={page >= totalPages}
        onClick={(e) => go(e, page + 1)}
        ariaLabel='Next page'
      >
        ›
      </PageButton>
    </nav>
  )
}

Pagination.propTypes = {
  activePage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  siblingCount: PropTypes.number,
  boundaryCount: PropTypes.number,
  className: PropTypes.string,
}

export default React.memo(Pagination)

function PageButton ({ active, disabled, onClick, ariaLabel, children }) {
  return (
    <button
      type='button'
      className={classNames('app__pagination__item', { active, disabled })}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </button>
  )
}

function buildItems (active, total, siblings, boundary) {
  const result = []
  const startPages = range(1, Math.min(boundary, total))
  const endPages = range(Math.max(total - boundary + 1, boundary + 1), total)

  const siblingsStart = Math.max(
    Math.min(active - siblings, total - boundary - siblings * 2 - 1),
    boundary + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(active + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : total - 1,
  )

  result.push(...startPages)
  if (siblingsStart > boundary + 2) result.push('ellipsis')
  else if (boundary + 1 < total - boundary) result.push(boundary + 1)

  result.push(...range(siblingsStart, siblingsEnd))

  if (siblingsEnd < total - boundary - 1) result.push('ellipsis')
  else if (total - boundary > boundary) result.push(total - boundary)

  result.push(...endPages)
  return dedupeOrdered(result)
}

function normalizePage (page, total) {
  if (page === Infinity) return total
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(Math.trunc(page), 1), total)
}

function normalizeCount (count) {
  if (!Number.isFinite(count)) return 1
  return Math.max(Math.trunc(count), 0)
}

function range (start, end) {
  const out = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

function dedupeOrdered (items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    if (item === 'ellipsis') {
      if (out[out.length - 1] !== 'ellipsis') out.push(item)
      continue
    }
    if (!seen.has(item)) {
      seen.add(item)
      out.push(item)
    }
  }
  return out
}
