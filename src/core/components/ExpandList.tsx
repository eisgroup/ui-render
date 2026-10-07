import React from 'react'
import Expand from './Expand'

/** An entry of `items`; an `id` keys its `Expand`. */
export type ExpandListItem = { id?: string | number, [key: string]: unknown }

/** The named props are read here; the rest is passed to every `Expand`. */
export type ExpandListProps = {
  items: ExpandListItem[]
  renderLabel: (item: ExpandListItem, index: number) => React.ReactNode
  renderItem: (item: ExpandListItem, index: number) => React.ReactNode
  [key: string]: unknown
}

/**
 * Dynamic List of Expandable Rows - Pure Component.
 */
function ExpandList ({renderLabel, renderItem, items, ...props}: ExpandListProps) {
  return (
    items.map((item, i) => (
      <Expand key={item.id || i} {...props} title={renderLabel(item, i)}>{() => renderItem(item, i)}</Expand>
    ))
  )
}
export default React.memo(ExpandList)
