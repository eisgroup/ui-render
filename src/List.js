import PropTypes from 'prop-types'
import React from 'react'
import Row from './Row'
import View from './View'

/**
 * Dynamic List of Views/Rows - Pure Component.
 */
export default function List ({renderItem, items, row, ...props}) {
  const Container = row ? Row : View
  return (
    <Container {...props}>
      {items.map((item, i) => renderItem(item, i))}
    </Container>
  )
}

List.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  row: PropTypes.bool,
}
