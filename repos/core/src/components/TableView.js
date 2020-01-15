import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
// import { Column, Table } from 'react-virtualized' // adds 132 KB to final bundle.js
// import Table, { Column } from 'react-virtualized/dist/commonjs/Table' // adds 80 KB to final bundle.js
// import 'react-virtualized/styles.css'
import { by, hasListValue } from '../common/utils'
import { renderSort } from './renders'
import Row from './Row'
import Table from './Table'
import Text from './Text'
import Column from './View'

/**
 * Table with Dynamic Columns - Component
 *
 * @Note: check <Table> component for props documentation
 */
export default function TableView
  ({
    headers, // in default layout, headers are the columns
    items,  // in default layout, items are the rows
    sorts,
    onSort,
    ...props
  }) {
  // Create new list to avoid mutating original data
  const rows = [...items] // eslint-disable-line

  // Multiple Column Sorting according to the order they are given
  if (hasListValue(sorts)) {
    let args = []
    sorts.forEach(({id, sort, sortKey}) => {
      if (!sort) return
      const sortPath = sortKey ? [id, sortKey].join('.') : id
      args.push((sort < 0 ? '-' : '') + sortPath)
    })
    rows.sort(by(...args))
  }
  return (
    <Table
      // width={800}
      // height={400}
      // headerHeight={40}
      // rowHeight={60}
      rowCount={rows.length}
      rowGetter={({index}) => rows[index]}
      rowClassName={rowClassName}
      {...props}
    >
      {headers.map(({id, header, render, className, color, style}, i) => (
        <Column
          key={id || i}
          // width={200}
          dataKey={id}
          headerRenderer={() => renderHeader({id, header, sorts, onSort})}
          cellRenderer={({cellData}) => render ? render(cellData) : cellData}
          className={classNames(className, color)}
          style={style}
        />
      ))}
    </Table>
  )
}

const sortStates = [-1, 0, 1, undefined]
const sortObj = {
  id: PropTypes.string.isRequired,
  sort: PropTypes.oneOf(sortStates),
  sortKey: PropTypes.string,
}
TableView.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      ...sortObj,
      render: PropTypes.func, // cell render function for items belonging to the header
      header: PropTypes.string, // header title, falls back to `id` if not given
      className: PropTypes.string, // css class name
      color: PropTypes.string, // css class name
      style: PropTypes.object, // css inline styles
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.object.isRequired, // nested object by key matching `id` in `headers` prop
  ).isRequired,
  sorts: PropTypes.arrayOf(
    PropTypes.shape({
      ...sortObj,
    })
  ),
  onSort: PropTypes.func // receives column `id` as argument
}

function renderHeader ({id, header, sorts, onSort}) {
  return (
    <Row className='middle' onClick={onSort && onSort.bind(this, id)}>
      <Text>{header || id}</Text>
      {sorts && renderSort((sorts.find(item => item.id === id) || {}).sort)}
    </Row>
  )
}

function rowClassName ({index}) {
  if (index < 0) return 'app__table__row--header'
  return index % 2 === 0 ? 'app__table__row--even' : 'app__table__row--odd'
}
