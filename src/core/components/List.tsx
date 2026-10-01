import React from 'react'
import Row from './Row'
import View from './View'

/** One entry of `List`'s `items`. */
export type ListItem = Record<string, unknown>

/** The named props are read here; the rest is passed to the `Row` (with `row`) or `View` it renders. */
export type ListProps = {
  /** Without them nothing renders */
  items: ListItem[]
  /** Called per entry, with the entry plus `currencyCode`, and its index */
  renderItem: (item: ListItem, index: number) => React.ReactNode
  row?: boolean
  currencyCode?: string
  [key: string]: unknown
}

/**
 * Dynamic List of Views/Rows - Pure Component.
 */
export function List ({renderItem, items, row, currencyCode, ...props}: ListProps) {
  const Container = row ? Row : View

  if (!items) {
    return null
  }

  return (
    <Container {...props}>
      {items.map((item, i) => renderItem({...item, currencyCode}, i))}
    </Container>
  )
}

export default React.memo(List)
