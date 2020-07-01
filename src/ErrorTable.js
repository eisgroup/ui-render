import { get, hasListValue } from 'dux-utils'
import PropTypes from 'prop-types'
import React from 'react'
import Table from './Table'

/**
 * Error Table Listing - Pure Component.
 *
 * @param {Array} items - error objects
 * @param {Boolean} isServerError - whether the error is server related or user related
 * @param {Boolean} inverted - whether to add `inverted` class
 * @param {*} props - other attributes to pass to `<Table>`
 * @returns {Object} - React table component
 */
export default function ErrorTable
  ({
    items,
    isServerError,
    inverted,
    ...props
  }) {
  const hasId = !!get(items, '[0].id')
  const hasStatus = !!get(items, '[0].status') || !!get(items, '[0].statusCode') || !!get(items, '[0].code')
  const hasTitle = !!get(items, '[0].title') || !!get(items, '[0].error')
  return (
    <Table inverted={inverted} striped {...props}>
      <Table.Header className='font-normal'>
        <Table.Row>
          {hasId && <Table.HeaderCell>Error ID</Table.HeaderCell>}
          {hasStatus && <Table.HeaderCell>Status</Table.HeaderCell>}
          {hasTitle && <Table.HeaderCell>{isServerError ? 'Title' : 'Reason'}</Table.HeaderCell>}
          <Table.HeaderCell>Message</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {hasListValue(items) &&
        items.map(({id, status, statusCode, code, title, error, content, detail, message, msg, ...data}, index) => (
          <Table.Row key={id || index}>
            {hasId && <Table.Cell scope='row' className='font-smaller'>{id}</Table.Cell>}
            {hasStatus && <Table.Cell>{status || statusCode || code}</Table.Cell>}
            {hasTitle && <Table.Cell>{title || error}</Table.Cell>}
            <Table.Cell style={{wordBreak: 'break-word'}}>
              {content || detail || message || msg || get(data, 'details[0].message', String(items[index]))}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

ErrorTable.propTypes = {
  isServerError: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      id: PropTypes.any,
      status: PropTypes.number,
      title: PropTypes.string,
      detail: PropTypes.string,
      message: PropTypes.string
    })
  ])).isRequired
}
