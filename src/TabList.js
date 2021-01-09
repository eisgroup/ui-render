import PropTypes from 'prop-types'
import React from 'react'
import Tabs from './Tabs'

/**
 * Dynamic List of Tabs - Pure Component.
 */
export function TabList ({renderLabel, renderItem, items, ...props}) {
  return <Tabs
    {...props}
    tabs={items.map((item, i) => renderLabel(item, i))}
    panels={items.map((item, i) => () => renderItem(item, i))}
  />
}

TabList.propTypes = {
  items: PropTypes.array.isRequired,
  renderLabel: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
}

export default React.memo(TabList)
