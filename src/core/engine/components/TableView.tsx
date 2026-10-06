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
import { getDateStringFromDateObject } from '../dataMapping'
import TableColGroup from './TableColGroup'
import type { TableColGroupProps } from './TableColGroup'
import { FieldArray } from 'react-final-form-arrays'
import Pagination from '../../components/Pagination'
import type { Translate } from '../../utils/_envs'

/** A row in the default layout, a column in the vertical one: values by header id. */
export type TableItem = Record<string, any>

/** A sort: the header it is for, its order (ascending 1, descending -1, none 0), and what it sorts by. */
export type TableSort = {
  /** Id of the header, used for grouping columns/rows */
  id: string
  order?: -1 | 0 | 1
  /** Path to the item's value used for sorting objects */
  sortKey?: string
}

/** A header or cell renderer: the value, where it is, the cell's own props, and the table's handle. */
export type TableRenderer = (value: unknown, position: unknown, props: Record<string, unknown>, handle: TableViewHandle) => React.ReactNode

/** A header: a column in the default layout, a row in the vertical one. */
export type TableHeader = {
  id?: string
  /** Header title, falls back to `id` if not given, and `children` not defined */
  label?: string
  /** Custom header content to render, overrides `label`; or a function that renders it */
  children?: React.ReactNode | TableRenderer
  data?: unknown
  /** CSS class name */
  className?: string
  /** CSS inline styles */
  style?: React.CSSProperties
  /** In `extraHeaders`: count of `headers` columns to span, default is 1 */
  colSpan?: number
  classNameHeader?: string
  styleHeader?: React.CSSProperties
  renderHeader?: TableRenderer
  /** Cell render function for the items under the header */
  renderCell?: TableRenderer
  /** CSS class name for the items under the header */
  classNameCell?: string
  /** CSS class name for the `<td>` wrapper of the items under the header */
  classNameCellWrap?: string
  /** CSS inline styles for the items under the header */
  styleCell?: React.CSSProperties
  [key: string]: unknown
}

/** `translate` and `additionalCellsStyles` are always passed by the mapper. The rest go to the `Table`. */
export type TableViewProps = {
  /** In the default layout, items are rows: objects keyed by the `id`s of `headers` */
  items: TableItem[]
  /** In the default layout, headers are columns. Derived from `items`, if not defined */
  headers?: TableHeader[]
  /**
   * Additional header layers, rendered above `headers` in the order they are defined: the first
   * layer is the first level header
   */
  extraHeaders?: TableHeader[][]
  /** When the cell is empty (i.e. falsey value), render it as given value */
  showEmptyAs?: React.ReactNode
  sorts?: TableSort[]
  /** Receives the clicked sort object `{id, order, sortKey}` */
  onSort?: (sort: TableSort | undefined) => void
  /** Renders the extra row below an expanded row, in the default layout */
  renderItem?: (item: TableItem, index: number) => React.ReactNode
  /** Custom renderer for the cells of each row, in the default layout */
  renderItemCells?: (item: TableItem, index: number) => React.ReactNode
  /** Custom renderer for an extra row at the end, in the default layout */
  renderExtraItem?: (items: TableItem[], index: number) => React.ReactNode
  itemsExpanded?: boolean
  /**
   * Conditional class names for the rows of the default layout: a row whose value at `id` is a
   * key of `values` gets that key's class name
   */
  itemClassNames?: Array<{ id: string, values: Record<string, string> }>
  /** Whether to render rows as columns (first column as Header) */
  vertical?: boolean
  translate: Translate
  colGroup?: TableColGroupProps['colGroup']
  additionalCellsStyles: Array<React.CSSProperties | undefined>
  usePagination?: boolean
  rowsPerPage?: number
  fill?: boolean
  className?: string
  name?: string
  fieldArrayName?: string
  [key: string]: unknown
}

type TableViewState = {
  items: { expanded?: boolean, expandedByIndex: Record<string, boolean | undefined> }
  sorts?: TableSort[]
  activePage: number
  rowsPerPage: number
}

/**
 * What renderers receive, and what a meta's handler names are looked up on: one object for the
 * component's lifetime, kept current.
 */
export type TableViewHandle = {
  tableWrapper: React.RefObject<HTMLDivElement>
  getStickyCellClassName: typeof getStickyCellClassName
  expandedByRow: (index: number) => boolean | undefined
  handleToggleExpandAll: (expanded?: boolean | null) => void
  handleItemExpand: (target: { key?: string, value?: unknown, index?: number, expanded?: boolean }) => void
  handleSort: (id: string) => void
  handlePaginationChange: (event: unknown, data: { activePage: number }) => void
  props?: TableViewProps
  state?: TableViewState
  headers?: TableHeader[]
  itemsSorted?: TableItem[]
  [key: string]: unknown
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
function getStickyCellClassName (styles: React.CSSProperties, className: string | undefined, nextCellStyles: React.CSSProperties) {
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
function sortRows (items: TableItem[], sorts: TableSort[] | undefined) {
  if (!hasListValue(sorts)) return items
  const sortKeys: string[] = []
  // Not undefined: `hasListValue` has just found a list.
  sorts!.forEach(({id, order, sortKey}) => {
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
 *
 * When the items shrink below the chosen page, the page moves back to the last one, corrected during
 * render as the sort state is. It used to stay: the body rendered no rows, while `Pagination`, which
 * clamps the page it shows, marked the last page as current.
 */
function TableView (props: TableViewProps) {
  const {items, headers: headersProp, sorts: sortsProp} = props
  const [state, setState] = useState<TableViewState>(() => ({
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
  const sorted = useRef<{ items: TableItem[], sorts?: TableSort[], rows: TableItem[] } | null>(null)
  if (sorted.current === null || sorted.current.sorts !== state.sorts || !isEqualList(items, sorted.current.items)) {
    sorted.current = {items, sorts: state.sorts, rows: sortRows(items, state.sorts)}
  }
  const itemsSorted = sorted.current.rows

  // Compute header based on items if not defined
  const derived = useRef<{ keys: string[], headers: TableHeader[] } | null>(null)
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
  // Read through non-null assertions: every render assigns it before any handler runs.
  const latest = useRef<{ props: TableViewProps, state: TableViewState } | null>(null)
  latest.current = {props, state}
  const tableWrapper = useRef<HTMLDivElement>(null)

  // HANDLERS ------------------------------------------------------------------
  const handle = useRef<TableViewHandle | null>(null)
  if (handle.current === null) {
    handle.current = {
      tableWrapper,
      getStickyCellClassName,

      expandedByRow: (index) => {
        const {items: {expanded, expandedByIndex}} = latest.current!.state
        return expandedByIndex[index] != null ? expandedByIndex[index] : expanded
      },

      handleToggleExpandAll: (expanded) => {
        setState(current => {
          const next = expanded == null ? !current.items.expanded : expanded
          const expandedByIndex: Record<string, boolean> = {}
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
        const {items} = latest.current!.props
        value = String(value).toLowerCase()
        // A cast, not a guard: without an index, the caller names the key to find the item by.
        const target = index != null ? index : items.findIndex(i => String(i[key as string]).toLowerCase() === value)
        setState(current => ({
          ...current,
          items: {...current.items, expandedByIndex: {...current.items.expandedByIndex, [target]: expanded}},
        }))
      },

      // Reports the clicked sort as it leaves this call, so it is computed from the last render's
      // state, as `this.state` was, rather than inside an updater.
      handleSort: (id) => {
        const {props: {onSort}, state: {sorts}} = latest.current!
        let sort: TableSort | undefined
        // Not undefined: only a header with a sort calls this.
        const next = sorts!.map(s => {
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
        // Not null: the wrapper is mounted whenever its pagination is.
        tableWrapper.current!.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  }: TableHeader, i: number) => {
    const { translate } = props
    const { sorts } = state
    const hasSort = sorts && !!sorts.find(s => s.id === id)
    const render = isFunction(cell) ? cell : renderHeaderContent
    const value = data != null ? data : (cell || label)
    // A sortable column, by the WAI-ARIA sortable table since 2026-10-06: the header says its order in
    // `aria-sort`, and its control is a button in the tab order that Enter and Space press as a click does.
    // Not undefined: `hasSort` found it.
    const order = hasSort ? sorts.find(s => s.id === id)!.order : undefined
    const ariaSort = hasSort ? (order! < 0 ? 'descending' : order! > 0 ? 'ascending' : 'none') : undefined
    return (
      <Table.HeaderCell key={id || i} colSpan={colSpan} className={cn('left', classNameHeader)} style={styleHeader}
                        aria-sort={ariaSort}>
        <Row className={cn('middle', className, {sort: hasSort})} style={style}
             // Not undefined: a header with a sort has an id.
             onClick={hasSort ? (() => self.handleSort(id!)) : undefined}
             role={hasSort ? 'button' : undefined}
             tabIndex={hasSort ? 0 : undefined}
             onKeyDown={hasSort ? ((event: React.KeyboardEvent<HTMLElement>) => {
               if (event.key !== 'Enter' && event.key !== ' ') return
               event.preventDefault()
               self.handleSort(id!)
             }) : undefined}>
          {render
            ? render(value, id, {className, style}, self)
            // A cast, not a guard: `cell` is no function here, or it would be the renderer.
            : (typeof cell === 'object' ? cell : <Text className="p">{(cell as React.ReactNode) || (label != null ? translate(label) : id)}</Text>)
          }
          {hasSort && renderSort(sorts.find(item => item.id === id) || {})}
        </Row>
      </Table.HeaderCell>
    )
  }

  // Render Row Cells (in default layout)
  const renderItemData = (item: TableItem, index: number, {id, renderCell, classNameCellWrap = '', classNameCell: className, styleCell: style}: TableHeader, column?: number) => {
    // Conditional rendering logic based on given cell data
    const { additionalCellsStyles } = props
    // Headers without an `id` are section dividers — they render as empty body cells.
    const cell = id == null ? undefined : get(item, id)
    // A cast, not a guard: a cell may be an object carrying its own renderer and data.
    const {render: r, data} = (cell || {}) as { render?: TableRenderer, data?: unknown }
    const render = isFunction(cell) ? cell : (r || renderCell)
    const value = data != null ? data : cell
    let content = render ? render(value, index, {className, style, expanded: expandedByRow(index)}, self) : cell
    if ((content == null || content === '') && props.showEmptyAs != null) content = props.showEmptyAs
    if (content instanceof Date) {
      content = getDateStringFromDateObject(content)
    }
    // The cell's column: given in the default layout; in the vertical one the header takes the first column
    // and item `index` the one after it. The default layout read the row there until 2026-10-06, so a
    // pinned column's style landed on a row: every cell of the first row took the second column's.
    const position = column != null ? column : index + 1
    const cellStyle = additionalCellsStyles[position] || {}
    const cellClassName = getStickyCellClassName(cellStyle, classNameCellWrap, additionalCellsStyles[position + 1] || {})
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
      // A section divider has no `id` to key its cell by, so it is keyed by its column: a table with one
      // logged React's missing-key warning, until 2026-10-06.
      <Table.Cell key={props.vertical ? index : (id != null ? id : `#${column}`)} className={cellClassName} style={cellStyle}>
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
  const renderItem = (item: TableItem, index: number) => {
    const {renderItem, renderItemCells, itemClassNames} = props
    let className: string | string[] | undefined
    if (itemClassNames) {
      className = []
      itemClassNames.forEach(({id, values}) => {
        const value = get(item, id)
        if (value == null) return
        for (const match in values) {
          if (match === String(value)) {
            (className as string[]).push(values[match]) // a cast, not a guard: an array until the join below
            break
          }
        }
      })
      className = className.length ? className.join(' ') : undefined
    }

    return (
      <Fragment key={index}>
        {/* Casts, not guards: a string by now, and `headers` is set whenever rows render (see below). */}
        <Table.Row className={className as string | undefined}>
          {renderItemCells ? renderItemCells(item, index) : headers!.map((header, column) => renderItemData(item, index, header, column))}
        </Table.Row>
        {renderItem && expandedByRow(index) &&
          <Table.Row>
            <Table.Cell colSpan={headers!.length}>
              {renderItem(item, index)}
            </Table.Cell>
          </Table.Row>
        }
      </Fragment>
    )
  }

  // A pinned column's header, in the default layout, is pinned with it (the vertical layout pins its header
  // column below). Its own `styleHeader` is kept, but for what pins it.
  const pinnedHeader = (header: TableHeader, column: number): TableHeader => {
    const { additionalCellsStyles } = props
    const style = additionalCellsStyles[column]
    if (!style || style.position !== 'sticky') return header
    return {
      ...header,
      styleHeader: {...header.styleHeader, ...style},
      classNameHeader: getStickyCellClassName(style, header.classNameHeader, additionalCellsStyles[column + 1] || {}),
    }
  }

  // Render Rows (in Vertical layout)
  // @Note: in Vertical layout, the first column in each item is a header
  const renderItemsVertical = (header: TableHeader, index: number) => {
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
  // A page past the end, once the items shrink, is the last page: the one `Pagination` shows.
  const page = Math.min(activePage, Math.max(totalPages, 1))
  if (page !== activePage) setState(current => ({...current, activePage: page}))

  if (usePagination && totalPages > 1) {
    rows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
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
          // edge only. See core/components/domProps.ts.
          {...omitProps(rest, ENGINE_PROPS, FIELD_ONLY_PROPS)}
        >
          {colGroup && <TableColGroup colGroup={colGroup} />}
          <Table.Header className="font-normal">
            {extraHeaders && extraHeaders.map((row, i) => (
                <Table.Row key={i}>{row.map(renderHeader)}</Table.Row>
            ))}
            {/* Vertical layout does not have horizontal headers */}
            {!vertical && <Table.Row>{headers.map((header, column) => renderHeader(pinnedHeader(header, column), column))}</Table.Row>}
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
            activePage={page}
            totalPages={totalPages}
            onPageChange={self.handlePaginationChange}
          />
        </ScrollView>
      )}
    </div>
  )
}

export default React.memo(TableView)
