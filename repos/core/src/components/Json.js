import PropTypes from 'prop-types'
import React from 'react'
import JsonView from 'react-json-tree'
import defaultTheme from '../common/logger/themes'

/**
 * Json nested Object Renderer - Pure Component.
 *
 * @param {Object|Array} data - collection to render
 * @param {Boolean} [inverted] - whether to render inverse background color
 * @param {Boolean} [expanded] - whether to expand all nested nodes
 * @param {Object} [theme] - color definitions
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export default function Json
  ({
    data = {},
    inverted = false,
    expanded = false,
    theme = defaultTheme,
    ...props
  }) {
  if (expanded) props.shouldExpandNode = () => true
  return (
    <JsonView hideRoot invertTheme={!inverted} theme={theme} data={data} {...props} />
  )
}

Json.propTypes = {
  data: PropTypes.any.isRequired, // JSON data to show
}
