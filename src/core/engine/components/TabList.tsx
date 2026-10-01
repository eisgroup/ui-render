import React from 'react'
import { PropTypes } from '../../components'
import Tabs from './Tabs'

/**
 * Dynamic List of Tabs - Pure Component.
 */
/** The named props are read here; the rest are passed to the `Tabs` it renders. */
export type TabListProps = {
  items: unknown[]
  renderLabel: (item: unknown, index: number) => React.ReactNode
  renderItem: (item: unknown, index: number) => React.ReactNode
  [key: string]: unknown
}

export function TabList ({renderLabel, renderItem, items, ...props}: TabListProps) {
  return <Tabs
    {...props}
    items={items.map((item, i) => ({tab: renderLabel(item, i), content: renderItem(item, i)}))}
  />
}

TabList.propTypes = {
  items: PropTypes.array.isRequired,
  renderLabel: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
}

export default React.memo(TabList)
