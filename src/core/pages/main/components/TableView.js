import PropTypes from 'prop-types'
import React, { Fragment, PureComponent, createRef } from 'react'
import { cn } from 'ui-react-pack'
import Placeholder from 'ui-react-pack/Placeholder'
import { renderSort } from 'ui-react-pack/renders'
import Row from 'ui-react-pack/Row'
import ScrollView from 'ui-react-pack/ScrollView'
import Table from 'ui-react-pack/Table'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { by, get, hasListValue, isEqual, isEqualList, isFunction } from 'ui-utils-pack'
import { getDateStringFromDateObject } from '../utils'
import TableColGroup from './TableColGroup'
import { FieldArray } from 'react-final-form-arrays'
import { Pagination } from 'semantic-ui-react'

const sortObj = {
  id: PropTypes.string.isRequired, // id of the header, used for grouping columns/rows
  order: PropTypes.oneOf([-1, 0, 1, undefined]),
  sortKey: PropTypes.string, // path to item's value used for sorting objects
}

/**
 * Table with Dynamic Headers - Component
 * @Note: check <Table> component for props documentation
 */
export default class TableView extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf( // in default layout, items are rows
      PropTypes.object.isRequired, // nested object by key matching `id` in `headers` prop
    ).isRequired,
    // Header will be derived from items, if not defined
    headers: PropTypes.arrayOf( // in default layout, headers are columns
      PropTypes.shape({
        ...sortObj,
        renderCell: PropTypes.func, // cell render function(value, index, props) for items under the header
        label: PropTypes.string, // header title, falls back to `id` if not given, and `children` not defined
        children: PropTypes.any, // custom header content to render, overrides `label`
        className: PropTypes.string, // css class name
        classNameCell: PropTypes.string, // css class name for items under the header
        classNameCellWrap: PropTypes.string, // css class name for items <td> wrapper under the header
        style: PropTypes.object, // css inline styles
        styleCell: PropTypes.object, // css inline styles for items under the header
      })
    ),
    extraHeaders: PropTypes.arrayOf( // additional header layers to be rendered above/before `headers`
      PropTypes.arrayOf( // layers will be rendered in the order they are defined -> this is the first level header
        PropTypes.shape({
          colSpan: PropTypes.number, // count of `headers` columns to span, default is 1
          label: PropTypes.string, // header title, falls back to `id` if not given, and `children` not defined
          children: PropTypes.any, // custom header content to render, overrides `label`
          className: PropTypes.string, // css class name
          style: PropTypes.object, // css inline styles
        })
      )
    ),
    // When the cell is empty (i.e. falsey value), render it as given value
    showEmptyAs: PropTypes.any,
    sorts: PropTypes.arrayOf(PropTypes.shape({...sortObj})),
    onSort: PropTypes.func, // receives clicked sort object {id, order, sortKey} as argument
    renderItem: PropTypes.func, // callback to render extra table rows in default layout
    renderItemCells: PropTypes.func, // callback to use custom renderer for each table rows in default layout
    renderExtraItem: PropTypes.func, // callback to use custom renderer for extra row (default layout) at the end
    itemsExpanded: PropTypes.bool,
    itemClassNames: PropTypes.arrayOf( // conditional class names for table items (rows in default layout)
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        values: PropTypes.object.isRequired,
      })
    ),
    vertical: PropTypes.bool, // whether to render rows as columns (first column as Header)
    // ...other Table props
    translate: PropTypes.func,
    colGroup: PropTypes.arrayOf(
      PropTypes.shape({
        styles: PropTypes.object
      })
    ),
    additionalCellsStyles: PropTypes.array,
    // Pagination props
    usePagination: PropTypes.bool,
    rowsPerPage: PropTypes.number,
  }

  state = {
    items: {
      expanded: this.props.itemsExpanded,
      expandedByIndex: {},
    },
    sorts: this.props.sorts,
    activePage: 1,
    rowsPerPage: this.props.rowsPerPage || 20,
  }

  tableWrapper = createRef()

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
    const {items} = this.props
    const {sorts} = this.state
    this._itemsSorted = items

    // Multiple Header Sorting according to the order they are given
    if (hasListValue(sorts)) {
      // Create new list to avoid mutating original data
      this._itemsSorted = [...items]
      const sortKeys = []
      sorts.forEach(({id, order, sortKey}) => {
        if (order) sortKeys.push((order < 0 ? '-' : '') + (sortKey ? `${id}.${sortKey}` : id))
      })
      this._itemsSorted.sort(by(...sortKeys))
    }

    return this._itemsSorted
  }

  expandedByRow = (index) => {
    const {items: {expanded, expandedByIndex}} = this.state
    return expandedByIndex[index] != null ? expandedByIndex[index] : expanded
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {items, sorts} = this.props

    // Reset if items or sorting if items changed
    if (!isEqualList(next.items, items)) this._itemsSorted = null
    if (!isEqual(next.sorts, sorts)) {
      this._itemsSorted = null
      this.setState({sorts: next.sorts})
    }

    // Reset Header definitions if not defined and item structure changed
    if (
      !next.headers &&
      next.items.length &&
      !isEqual(Object.keys(next.items[0] || {}), Object.keys(items[0] || {}))
    ) this._headers = null
  }

  // HANDLERS ------------------------------------------------------------------
  handleToggleExpandAll = (expanded) => {
    if (expanded == null) expanded = !this.state.items.expanded
    const expandedByIndex = {}
    for (const i in this.state.items.expandedByIndex) {
      expandedByIndex[i] = expanded
    }
    this.setState({
      items: {
        ...this.state.items,
        expandedByIndex,
        expanded,
      }
    })
  }

  /**
   * Toggle Table item expansion (row in default layout)
   * @param {Number|String} [index] - index of item to expand
   * @param {Number|String} [key] - id of item to expand
   * @param {String|Number} [value] - of given id `key`, if given, to find item that needs expansion
   * @param {Boolean} expanded - whether item should be expanded
   */
  handleItemExpand = ({key, value, index, expanded}) => {
    const {items} = this.props
    value = String(value).toLowerCase()
    this.setState({
      items: {
        ...this.state.items,
        expandedByIndex: {
          ...this.state.items.expandedByIndex,
          [index != null ? index : items.findIndex(i => String(i[key]).toLowerCase() === value)]: expanded
        }
      }
    })
  }

  handleSort = (id) => {
    const {onSort} = this.props
    let sort
    this._itemsSorted = null
    this.setState({
      sorts: this.state.sorts.map(s => {
        if (s.id === id) {
          sort = {...s, order: s.order ? (s.order < 0 ? 1 : 0) : -1}
          return sort
        }
        return s
      })
    })
    onSort && onSort(sort)
  }

  getStickyCellClassName = (styles, className, nextCellStyles) => {
    if (styles.position === 'sticky') {
      if (typeof className === 'string' && className.length && !className.includes('sticky')) {
        className += ' sticky'
      } else {
        className = 'sticky'
      }
    }

    if (!(nextCellStyles.position === 'sticky')) {
      className += '-last'
    }

    return className;
  }

  handlePaginationChange = (e, { activePage }) => {
    this.tableWrapper.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    this.setState({ activePage })
  }

  // RENDERS -------------------------------------------------------------------
  renderHeader = ({
    id,
    label,
    children: cell,
    data,
    className,
    style,
    colSpan,
    classNameHeader,
    styleHeader,
    renderHeader
  }, i) => {
    const { translate } = this.props
    const { sorts } = this.state
    const hasSort = sorts && !!sorts.find(s => s.id === id)
    const render = isFunction(cell) ? cell : renderHeader
    const value = data != null ? data : (cell || label)
    return (
      <Table.HeaderCell key={id || i} colSpan={colSpan} className={classNameHeader} style={styleHeader}>
        <Row className={cn('middle', className, {sort: hasSort})} style={style}
             onClick={hasSort && this.handleSort.bind(this, id)}>
          {render
            ? render(value, id, {className, style}, this)
            : (typeof cell === 'object' ? cell : <Text className="p">{cell || (label != null ? translate(label) : id)}</Text>)
          }
          {hasSort && renderSort(sorts.find(item => item.id === id) || {})}
        </Row>
      </Table.HeaderCell>
    )
  }

  // Render Rows (in default layout)
  renderItem = (item, index) => {
    const {renderItem, renderItemCells, itemClassNames} = this.props
    let className
    if (itemClassNames) {
      className = []
      itemClassNames.forEach(({id, values}) => {
        const value = get(item, id)
        if (value == null) return
        for (const match in values) {
          if (match === String(value)) {
            className.push(values[match])
            break
          }
        }
      })
      className = className.length ? className.join(' ') : undefined
    }

    return (
      <Fragment key={index}>
        <Table.Row className={className}>
          {renderItemCells ? renderItemCells(item, index) : this.headers.map(this.renderItemData.bind(this, item, index))}
        </Table.Row>
        {renderItem && this.expandedByRow(index) &&
          <Table.Row>
            <Table.Cell colSpan={this.headers.length}>
              {renderItem(item, index)}
            </Table.Cell>
          </Table.Row>
        }
      </Fragment>
    )
  }

  // Render Rows (in Vertical layout)
  // @Note: in Vertical layout, the first column in each item is a header
  renderItemsVertical = (header, index) => {
    const { additionalCellsStyles } = this.props
    const items = this.itemsSorted
    header.styleHeader = additionalCellsStyles[0] || {}
    header.classNameHeader = this.getStickyCellClassName(header.styleHeader, header.classNameHeader, additionalCellsStyles[1] || {})
    return (
      /* `itemClassNames` is not supported yet */
      <Table.Row key={index}>
        {this.renderHeader(header, index)}
        {items.map((item, i) => this.renderItemData(item, i, header))}
      </Table.Row>
      /* Vertical layout has no expandable row */
    )
  }

  // Render Row Cells (in default layout)
  renderItemData = (item, index, {id, renderCell, classNameCellWrap = '', classNameCell: className, styleCell: style}) => {
    // Conditional rendering logic based on given cell data
    const { additionalCellsStyles } = this.props
    const cell = get(item, id)
    const {render: r, data} = cell || {}
    const render = isFunction(cell) ? cell : (r || renderCell)
    const value = data != null ? data : cell
    let content = render ? render(value, index, {className, style, expanded: this.expandedByRow(index)}, this) : cell
    if ((content == null || content === '') && this.props.showEmptyAs != null) content = this.props.showEmptyAs
    if (content instanceof Date) {
      content = getDateStringFromDateObject(content)
    }
    const cellStyle = additionalCellsStyles[index+1] || {}
    const cellClassName = this.getStickyCellClassName(cellStyle, classNameCellWrap, additionalCellsStyles[index+2] || {})
    return (
      <Table.Cell key={this.props.vertical ? index : id} className={cellClassName} style={cellStyle}>
        {typeof content === 'object'
          ? content
          : <View className={className} style={style}><Text className="p">{content}</Text></View>
        }
      </Table.Cell>
    )
  }

  render () {
    const headers = this.headers
    if (!headers) return <Placeholder>{'Table has no data!'}</Placeholder>
    const {
      fill, className, sorts, onSort, extraHeaders, renderExtraItem, showEmptyAs, vertical, colGroup, usePagination,
      items: _, headers: _2, renderItem: _3, renderItemCells: _4, itemClassNames: _5,
      itemsExpanded: _6, translate: _7, sellStyles: _8, additionalCellsStyles: _9, rowsPerPage: _10,
      ...props
    } = this.props
    const {activePage, rowsPerPage} = this.state
    let items = this.itemsSorted
    const totalPages = Math.ceil(items.length / rowsPerPage)

    if (usePagination && totalPages > 1) {
      items = items.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
    }

    const tableBody = (
      <>
        {vertical ? headers.map(this.renderItemsVertical) : items.map(this.renderItem)}
        {renderExtraItem && <Table.Row>{renderExtraItem(items)}</Table.Row>}
      </>
    )

    return (
      <div ref={this.tableWrapper}>
        <ScrollView row classNameInner="fill-width" fill={fill}>
          <Table className={cn('full-width', className, {vertical})} {...props}>
            {colGroup && <TableColGroup colGroup={colGroup} />}
            <Table.Header className="font-normal">
              {extraHeaders && extraHeaders.map((row, i) => (
                  <Table.Row key={i}>{row.map(this.renderHeader)}</Table.Row>
              ))}
              {/* Vertical layout does not have horizontal headers */}
              {!vertical && <Table.Row>{headers.map(this.renderHeader)}</Table.Row>}
            </Table.Header>
            <Table.Body>
              {this.props.name ? (
                  <FieldArray name={this.props.name}>
                    {({ fields }) => tableBody}
                  </FieldArray>
              ) : tableBody}
            </Table.Body>
          </Table>
        </ScrollView>
        {usePagination && totalPages > 1 && (
          <ScrollView row styleInner={{ justifyContent: 'center', marginTop: 20 }} classNameInner="fill-width" fill={fill}>
            <Pagination
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={this.handlePaginationChange}
            />
          </ScrollView>
        )}
      </div>
    )
  }
}
