import React from 'react'
import { PropTypes } from 'react-ui-pack'
import Tabs from './Tabs'

/**
 * Dynamic List of Tabs - Pure Component.
 */
export function TabList ({renderLabel, renderItem, items, ...props}) {
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
