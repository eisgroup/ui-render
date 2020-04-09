import PropTypes from 'prop-types'
import React from 'react'
import Expand from './Expand'

/**
 * Dynamic List of Expandable Rows - Pure Component.
 */
export default function ExpandList ({renderLabel, renderItem, items, ...props}) {
  return (
    items.map((item, i) => (
      <Expand key={item.id || i} {...props} title={renderLabel(item, i)}>{renderItem(item, i)}</Expand>
    ))
  )
}
ExpandList.propTypes = {
  items: PropTypes.array.isRequired,
  renderLabel: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
}
