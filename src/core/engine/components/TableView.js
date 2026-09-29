import PropTypes from 'prop-types'
import React, { Fragment, useRef, useState } from 'react'
import { cn } from '../../components'
import Placeholder from '../../components/Placeholder'
import { renderSort } from '../../components/renders'
import Row from '../../components/Row'
import ScrollView from '../../components/ScrollView'
import Table from '../../components/Table'
import Text from '../../components/Text'
import View from '../../components/View'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from '../../components/domProps'
import { by, get, hasListValue, isEqual, isEqualList, isFunction, toJSON } from '../../utils'
import { getDateStringFromDateObject } from '../utils'
import TableColGroup from './TableColGroup'
import { FieldArray } from 'react-final-form-arrays'
import Pagination from '../../components/Pagination'

const sortObj = {
  id: PropTypes.string.isRequired, // id of the header, used for grouping columns/rows
  order: PropTypes.oneOf([-1, 0, 1, undefined]),
  sortKey: PropTypes.string, // path to item's value used for sorting objects
}

/**
 * `sticky` marks a pinned cell; `sticky-last` marks the final cell of a pinned run, which is
 * what `table.less` draws the separator shadow on (`td.sticky-last::after`).
 *
 * @Note: the `-last` suffix used to be appended to EVERY cell whose right-hand neighbour is
 *  not sticky, not just to pinned ones. On a cell with no className that produced the literal
 *  class `undefined-last`, and on a cell with a real class it produced `<class>-last` — 20 and
 *  45 unstyled junk tokens in the example baseline. A non-pinned cell has no run to end, so it
 *  now returns its className untouched.
 */
function getStickyCellClassName (styles, className, nextCellStyles) {
  if (styles.position !== 'sticky') return className

  if (typeof className === 'string' && className.length && !className.includes('sticky')) {
    className += ' sticky'
  } else {
    className = 'sticky'
  }

  if (!(nextCellStyles.position === 'sticky')) {
    className += '-last'
  }

  return className;
}


/** The class's `itemsSorted`: a new list sorted by every active sort, in the order they are given. */
function sortRows (items, sorts) {
  if (!hasListValue(sorts)) return items
  const sortKeys = []
  sorts.forEach(({id, order, sortKey}) => {
    if (order) sortKeys.push((order < 0 ? '-' : '') + (sortKey ? `${id}.${sortKey}` : id))
  })
  // Create new list to avoid mutating original data
  return [...items].sort(by(...sortKeys))
}

/**
 * Table with Dynamic Headers - Component
 * @Note: check <Table> component for props documentation
 *
 * A FUNCTION COMPONENT since §9.3 step 6, memoised like the PureComponent it was: its
 * `UNSAFE_componentWillReceiveProps` compared the new props with the previous ones, so a parent
 * render with equal props had nothing to do.
 *  - `sorts` that change by value replace the sort state during render, where the lifecycle did.
 *  - The class's two cached getters are two caches here, with the same keys: the sorted rows,
 *    until the items change element by element (`isEqualList`) or the sort state changes; and the
 *    headers derived from the first item's keys, until an item with other keys arrives. An empty
 *    list keeps the headers.
 *  - Renderers get what the class passed as `this`: one object for the component's lifetime, kept
 *    current. The engine reads `props` off it, and looks up handlers on it by the name the meta
 *    gives (`onClick: 'handleItemExpand'`, `onChange: 'handleToggleExpandAll'`), so it carries the
 *    class's members, and each handler keeps one identity, as an instance field did.
 * One thing changed, and a test pins it. The expansion handlers wrote a copy of `this.state` back,
 * so of two calls in one batch only the last survived, and a toggle of every row lost to an
 * expansion batched after it. They now update from the current state, so every call applies.
 */
function TableView (props) {
  const {items, headers: headersProp, sorts: sortsProp} = props
  const [state, setState] = useState(() => ({
    items: {
      expanded: props.itemsExpanded,
      expandedByIndex: {},
    },
    sorts: sortsProp,
    activePage: 1,
    rowsPerPage: props.rowsPerPage || 20,
  }))

  // A `sorts` prop that changed by value replaces the sort state, as the lifecycle's `setState` did.
  const [sortsSeen, setSortsSeen] = useState(sortsProp)
  if (!isEqual(sortsProp, sortsSeen)) {
    setSortsSeen(sortsProp)
    setState(current => ({...current, sorts: sortsProp}))
  }

  // The sorted rows, kept while the items are the same elements and the sort state is the same.
  const sorted = useRef(null)
  if (sorted.current === null || sorted.current.sorts !== state.sorts || !isEqualList(items, sorted.current.items)) {
    sorted.current = {items, sorts: state.sorts, rows: sortRows(items, state.sorts)}
  }
  const itemsSorted = sorted.current.rows

  // Compute header based on items if not defined
  const derived = useRef(null)
  let headers = headersProp
  if (!headers) {
    const [item] = items
    if (item) {
      const keys = Object.keys(item)
      if (derived.current === null || !isEqual(keys, derived.current.keys)) {
        derived.current = {keys, headers: keys.map(id => ({id}))}
      }
    }
    // No items and nothing derived before means no inferrable headers.
    headers = derived.current ? derived.current.headers : undefined
  }

  // What the handlers read when they are called: the latest props and state, as `this` held them.
  const latest = useRef(null)
  latest.current = {props, state}
  const tableWrapper = useRef(null)

  // HANDLERS ------------------------------------------------------------------
  const handle = useRef(null)
  if (handle.current === null) {
    handle.current = {
      tableWrapper,
      getStickyCellClassName,

      expandedByRow: (index) => {
        const {items: {expanded, expandedByIndex}} = latest.current.state
        return expandedByIndex[index] != null ? expandedByIndex[index] : expanded
      },

      handleToggleExpandAll: (expanded) => {
        setState(current => {
          const next = expanded == null ? !current.items.expanded : expanded
          const expandedByIndex = {}
          for (const i in current.items.expandedByIndex) {
            expandedByIndex[i] = next
          }
          return {...current, items: {...current.items, expandedByIndex, expanded: next}}
        })
      },

      /**
       * Toggle Table item expansion (row in default layout)
       * @param {Number|String} [index] - index of item to expand
       * @param {Number|String} [key] - id of item to expand
       * @param {String|Number} [value] - of given id `key`, if given, to find item that needs expansion
       * @param {Boolean} expanded - whether item should be expanded
       */
      handleItemExpand: ({key, value, index, expanded}) => {
        const {items} = latest.current.props
        value = String(value).toLowerCase()
        const target = index != null ? index : items.findIndex(i => String(i[key]).toLowerCase() === value)
        setState(current => ({
          ...current,
          items: {...current.items, expandedByIndex: {...current.items.expandedByIndex, [target]: expanded}},
        }))
      },

      // Reports the clicked sort as it leaves this call, so it is computed from the last render's
      // state, as `this.state` was, rather than inside an updater.
      handleSort: (id) => {
        const {props: {onSort}, state: {sorts}} = latest.current
        let sort
        const next = sorts.map(s => {
          if (s.id === id) {
            sort = {...s, order: s.order ? (s.order < 0 ? 1 : 0) : -1}
            return sort
          }
          return s
        })
        setState(current => ({...current, sorts: next}))
        onSort && onSort(sort)
      },

      handlePaginationChange: (e, { activePage }) => {
        tableWrapper.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setState(current => ({...current, activePage}))
      },
    }
  }
  const self = handle.current
  const {expandedByRow} = self

  // RENDERS -------------------------------------------------------------------
  const renderHeader = ({
    id,
    label,
    children: cell,
    data,
    className,
    style,
    colSpan,
    classNameHeader,
    styleHeader,
    renderHeader: renderHeaderContent
  }, i) => {
    const { translate } = props
    const { sorts } = state
    const hasSort = sorts && !!sorts.find(s => s.id === id)
    const render = isFunction(cell) ? cell : renderHeaderContent
    const value = data != null ? data : (cell || label)
    return (
      <Table.HeaderCell key={id || i} colSpan={colSpan} className={cn('left', classNameHeader)} style={styleHeader}>
        <Row className={cn('middle', className, {sort: hasSort})} style={style}
             onClick={hasSort && (() => self.handleSort(id))}>
          {render
            ? render(value, id, {className, style}, self)
            : (typeof cell === 'object' ? cell : <Text className="p">{cell || (label != null ? translate(label) : id)}</Text>)
          }
          {hasSort && renderSort(sorts.find(item => item.id === id) || {})}
        </Row>
      </Table.HeaderCell>
    )
  }

  // Render Row Cells (in default layout)
  const renderItemData = (item, index, {id, renderCell, classNameCellWrap = '', classNameCell: className, styleCell: style}) => {
    // Conditional rendering logic based on given cell data
    const { additionalCellsStyles } = props
    // Headers without an `id` are section dividers — they render as empty body cells.
    const cell = id == null ? undefined : get(item, id)
    const {render: r, data} = cell || {}
    const render = isFunction(cell) ? cell : (r || renderCell)
    const value = data != null ? data : cell
    let content = render ? render(value, index, {className, style, expanded: expandedByRow(index)}, self) : cell
    if ((content == null || content === '') && props.showEmptyAs != null) content = props.showEmptyAs
    if (content instanceof Date) {
      content = getDateStringFromDateObject(content)
    }
    const cellStyle = additionalCellsStyles[index+1] || {}
    const cellClassName = getStickyCellClassName(cellStyle, classNameCellWrap, additionalCellsStyles[index+2] || {})
    const isReactNode = content == null
      || typeof content !== 'object'
      || Array.isArray(content)
      || React.isValidElement(content)
    return (
      // @Note: `cellClassName` is the empty string for the common non-pinned cell, and that used
      // to render as class="" -- Semantic's Table.Cell ran its own `cx()` and emitted the
      // attribute whatever we passed, so `|| undefined` here was dead code. Since F1 step 1 the
      // in-house `Table.Cell` omits an empty className itself, so the 199 inert `class=""` the
      // `-last` fix traded for are gone too. `getStickyCellClassName` still returns '' here --
      // suppressing the attribute is the cell's job, at the DOM edge, in one place.
      <Table.Cell key={props.vertical ? index : id} className={cellClassName} style={cellStyle}>
        {isReactNode
          ? (typeof content === 'object'
            ? content
            : <View className={className} style={style}><Text className="p">{content}</Text></View>)
          : <View className={className} style={style}><Text className="p">{toJSON(content)}</Text></View>
        }
      </Table.Cell>
    )
  }

  // Render Rows (in default layout)
  const renderItem = (item, index) => {
    const {renderItem, renderItemCells, itemClassNames} = props
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
          {renderItemCells ? renderItemCells(item, index) : headers.map(header => renderItemData(item, index, header))}
        </Table.Row>
        {renderItem && expandedByRow(index) &&
          <Table.Row>
            <Table.Cell colSpan={headers.length}>
              {renderItem(item, index)}
            </Table.Cell>
          </Table.Row>
        }
      </Fragment>
    )
  }

  // Render Rows (in Vertical layout)
  // @Note: in Vertical layout, the first column in each item is a header
  const renderItemsVertical = (header, index) => {
    const { additionalCellsStyles } = props
    header.styleHeader = additionalCellsStyles[0] || {}
    header.classNameHeader = getStickyCellClassName(header.styleHeader, header.classNameHeader, additionalCellsStyles[1] || {})
    return (
      /* `itemClassNames` is not supported yet */
      <Table.Row key={index}>
        {renderHeader(header, index)}
        {itemsSorted.map((item, i) => renderItemData(item, i, header))}
      </Table.Row>
      /* Vertical layout has no expandable row */
    )
  }

  Object.assign(self, {props, state, headers, itemsSorted, renderHeader, renderItem, renderItemsVertical, renderItemData})

  if (!headers) return <Placeholder>{'Table has no data!'}</Placeholder>
  const {
    fill, className, sorts, onSort, extraHeaders, renderExtraItem, showEmptyAs, vertical, colGroup, usePagination,
    items: _, headers: _2, renderItem: _3, renderItemCells: _4, itemClassNames: _5,
    // @Note: a `sellStyles: _8` used to sit here — a typo for a prop that does not exist
    // (nothing passes `sellStyles`, and nothing passes `cellStyles` either). The real prop is
    // `additionalCellsStyles`, discarded two entries along. Removed in F1 step 1 rather than
    // carried over: a dead entry in the list whose whole job is keeping props off the DOM
    // reads as protection that is not there.
    itemsExpanded: _6, translate: _7, additionalCellsStyles: _8, rowsPerPage: _9,
    fieldArrayName: _10,
    ...rest
  } = props
  const {activePage, rowsPerPage} = state
  const allRows = itemsSorted
  let rows = allRows
  const totalPages = Math.ceil(rows.length / rowsPerPage)

  if (usePagination && totalPages > 1) {
    rows = rows.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
  }

  // Extra "add row" must use the next index in the full data array (allRows.length), not the paginated slice length.
  const tableBody = (
    <>
      {vertical ? headers.map(renderItemsVertical) : rows.map(renderItem)}
      {renderExtraItem && (
        <Table.Row>{renderExtraItem(allRows, allRows.length)}</Table.Row>
      )}
    </>
  )

  return (
    <div ref={tableWrapper}>
      <ScrollView row classNameInner="fill-width" fill={fill}>
        <Table
          className={cn('full-width', className, {vertical})}
          // DOM boundary: `Table` spreads what it does not consume onto <table>, where `name` is
          // not a valid attribute. Kept even though the in-house `Table` now filters too: this
          // component's own test pins the root's attribute set to exactly ['class'], and
          // `omitProps` returns the same object when nothing matched, so the second pass is free.
          // `props.name` is still what decides the FieldArray below — the strip is at the DOM
          // edge only. See core/components/domProps.js.
          {...omitProps(rest, ENGINE_PROPS, FIELD_ONLY_PROPS)}
        >
          {colGroup && <TableColGroup colGroup={colGroup} />}
          <Table.Header className="font-normal">
            {extraHeaders && extraHeaders.map((row, i) => (
                <Table.Row key={i}>{row.map(renderHeader)}</Table.Row>
            ))}
            {/* Vertical layout does not have horizontal headers */}
            {!vertical && <Table.Row>{headers.map(renderHeader)}</Table.Row>}
          </Table.Header>
          <Table.Body>
            {props.name ? (
                <FieldArray name={props.fieldArrayName || props.name}>
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
            onPageChange={self.handlePaginationChange}
          />
        </ScrollView>
      )}
    </div>
  )
}

TableView.propTypes = {
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

export default React.memo(TableView)
