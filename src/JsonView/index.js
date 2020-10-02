import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import JsonTree from 'react-json-tree' // do not use react-json-view because it breaks with recursive JSON and in Node.js
import View from '../View'
import defaultTheme from './themes'

/**
 * Json nested Object Renderer - Pure Component.
 *
 * @param {Object|Array} data - collection to render
 * @param {Boolean} [inverted] - whether to render inverse background color
 * @param {Boolean} [expanded] - whether to expand all nested nodes
 * @param {Object} [theme] - color definitions
 * @param {String} [className] - css class name
 * @param {Object} [style] - css styles
 * @param {Boolean} [fill] - css styles
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export function JsonView ({
  data = {},
  inverted = false,
  expanded = false,
  theme = defaultTheme,
  className,
  style,
  fill,
  ...props
}) {
  if (expanded) props.shouldExpandNode = () => true
  return (
    <View className={classNames('json-tree', className, {fill})} style={style}>
      <JsonTree hideRoot invertTheme={!inverted} theme={theme} data={data} {...props} />
    </View>
  )
}

JsonView.propTypes = {
  data: PropTypes.any.isRequired, // JSON data to show
}

export default React.memo(JsonView)
