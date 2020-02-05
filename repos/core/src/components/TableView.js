import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { by, hasListValue, isEqual, isEqualList, isFunction } from '../common/utils'
import Placeholder from './Placeholder'
import { renderSort } from './renders'
import Row from './Row'
import Table from './Table'
import Text from './Text'
import View from './View'
// import { Column, Table } from 'react-virtualized' // adds 132 KB to final bundle.js
// import Table, { Column } from 'react-virtualized/dist/commonjs/Table' // adds 80 KB to final bundle.js
// import 'react-virtualized/styles.css'

const sortStates = [-1, 0, 1, undefined]
const sortObj = {
  id: PropTypes.string.isRequired, // id of the header, used for grouping columns/rows
  sort: PropTypes.oneOf(sortStates),
  sortKey: PropTypes.string, // path to item's value used for sorting objects
}

/**
 * Table with Dynamic Headers - Component
 * @Note: check <Table> component for props documentation
 */
export default class TableView extends Component {
  static propTypes = {
    items: PropTypes.arrayOf( // in default layout, items are rows
      PropTypes.object.isRequired, // nested object by key matching `id` in `headers` prop
    ).isRequired,
    // Header will be derived from items, if not defined
    headers: PropTypes.arrayOf( // in default layout, headers are columns
      PropTypes.shape({
        ...sortObj,
        renderCell: PropTypes.func, // cell render function(value, index, props) for items under the header
        title: PropTypes.string, // header title, falls back to `id` if not given, and `children` not defined
        children: PropTypes.any, // custom header content to render, overrides `title`
        className: PropTypes.string, // css class name
        classNameCell: PropTypes.string, // css class name for items under the header
        style: PropTypes.object, // css inline styles
        styleCell: PropTypes.object, // css inline styles for items under the header
      })
    ),
    sorts: PropTypes.arrayOf(PropTypes.shape({...sortObj})),
    onSort: PropTypes.func, // receives header `id` as argument
    renderItem: PropTypes.func, // callback to render extra table rows in default layout
    itemsExpanded: PropTypes.bool,
    // ...other Table props
  }

  state = {
    items: {
      expanded: this.props.itemsExpanded,
      expandedByIndex: {},
    },
  }

  // LOGIC ---------------------------------------------------------------------

  // Compute header based on items if not defined
  get headers () {
    if (this.props.headers) return this.props.headers
    if (this._headers) return this._headers
    const [item] = this.props.items
    if (!item) return
    return (this._headers = Object.keys(item).map(id => ({id})))
  }

  get itemsSorted () {
    if (this._itemsSorted) return this._itemsSorted
    const {items, sorts} = this.props
    this._itemsSorted = items

    // Multiple Header Sorting according to the order they are given
    if (hasListValue(sorts)) {
      // Create new list to avoid mutating original data
      this._itemsSorted = [...items]
      const sortKeys = []
      sorts.forEach(({id, sort, sortKey}) => {
        if (sort) sortKeys.push((sort < 0 ? '-' : '') + (sortKey ? `${id}.${sortKey}` : id))
      })
      this._itemsSorted.sort(by(...sortKeys))
    }

    return this._itemsSorted
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {items, sorts} = this.props

    // Reset if items or sorting if items changed
    if (
      !isEqualList(next.items, items) ||
      (sorts && !isEqual(next.sorts, sorts))
    ) {
      console.warn('not equal!!!')
      console.warn('isEqual sorts', isEqual(next.sorts, sorts))
      console.warn('isEqual items', isEqualList(next.items, items))
      this._itemsSorted = null
    }

    // Reset Header definitions if not defined and item structure changed
    if (
      !next.headers &&
      next.items.length &&
      !isEqual(Object.keys(next.items[0] || {}), Object.keys(items[0] || {}))
    ) this._headers = null
  }

  // HANDLERS ------------------------------------------------------------------
  handleItemExpand = ({key, value, expanded}) => {
    const {items} = this.props
    value = String(value).toLowerCase()
    this.setState({
      items: {
        ...this.state.items,
        expandedByIndex: {
          ...this.state.items.expandedByIndex,
          [items.findIndex(i => String(i[key]).toLowerCase() === value)]: expanded
        }
      }
    })
  }

  // RENDERS -------------------------------------------------------------------

  renderHeader = ({id, title, children, className, style}) => {
    const {sorts, onSort} = this.props
    return (
      <Table.HeaderCell key={id}>
        <Row className={classNames('middle', className)} style={style} onClick={onSort && onSort.bind(this, id)}>
          {children || <Text>{title || id}</Text>}
          {sorts && renderSort((sorts.find(item => item.id === id) || {}).sort, {className: 'margin-left-small'})}
        </Row>
      </Table.HeaderCell>
    )
  }

  renderItem = (item, i) => {
    const {renderItem} = this.props
    const {items: {expanded, expandedByIndex}} = this.state
    return (
      <Fragment key={i}>
        <Table.Row>
          {this.headers.map(this.renderItemData.bind(this, item, i))}
        </Table.Row>
        {renderItem && (expanded || expandedByIndex[i]) &&
        <Table.Row>
          <Table.Cell colSpan={this.headers.length}>
            {renderItem(item, i)}
          </Table.Cell>
        </Table.Row>
        }
      </Fragment>
    )
  }

  // Render Row Cells (in default layout)
  renderItemData = (item, index, {id, renderCell, classNameCell: className, styleCell: style}) => {
    // Conditional rendering logic based on given cell data
    const cell = item[id]
    const {render: r, data} = cell || {}
    const render = isFunction(cell) ? cell : (r || renderCell)
    const value = data != null ? data : cell
    return (
      <Table.Cell key={id}>
        <View className={className} style={style}>
          {render
            ? render(value, index, {className, style}, this)
            : (typeof cell === 'object' ? cell : <Text className='p'>{cell}</Text>)
          }
        </View>
      </Table.Cell>
    )
  }

  render () {
    const headers = this.headers
    if (!headers) return <Placeholder>{'Table has no data!'}</Placeholder>
    const {sorts, onSort, items: _, headers: __, renderItem: ___, ...props} = this.props
    const items = this.itemsSorted
    return (
      <Table {...props}>
        <Table.Header className='font-normal'>
          <Table.Row>
            {headers.map(this.renderHeader)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map(this.renderItem)}
        </Table.Body>
      </Table>
    )
  }
}

function rowClassName ({index}) {
  if (index < 0) return 'app__table__row--header'
  return index % 2 === 0 ? 'app__table__row--even' : 'app__table__row--odd'
}
