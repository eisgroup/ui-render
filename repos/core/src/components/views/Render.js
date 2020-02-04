import classNames from 'classnames'
import React from 'react'
import { get, interpolateString, isList, isNumeric, isObject, toPercent } from '../../common/utils'
import { ACTIVE, FIELD } from '../../common/variables'
import Button from '../Button'
import PieChart from '../charts/PieChart'
import Counter from '../Counter'
import Expand from '../Expand'
import Label from '../Label'
import { renderCurrency } from '../renders'
import Row from '../Row'
import TableView from '../TableView'
import Tabs from '../Tabs'
import Text from '../Text'
import View from '../View'

/**
 * Recursive Field Renderer
 *
 * @param {*} data - to render
 * @param {String } [view] - one of FIELD.TYPE
 * @param {Array} [items] - list of nested fields to render
 * @param {*} [props] - other props to pass to given field
 * @param {Number} [i] - index of field in the list
 * @returns {*} Node - React component/s
 */
export default function Render ({data: info, view, items = [], ...props}, i) {
  if (props.key == null) props.key = i
  // Pass down data to child renderers, if defined
  let data = info
  if (props.name) data = get(info, props.name)
  if (info) items = items.map((item) => ({...item, data: info}))
  switch (view) {
    case FIELD.TYPE.BUTTON:
      if (items.length) props.children = items.map(Render)
      return <Button {...props}/>

    case FIELD.TYPE.EXPAND:
      if (props.name != null && props.title == null) props.title = props.name
      return <Expand {...props}>{() => items.map(Render)}</Expand>

    case FIELD.TYPE.COUNTER:
      return <Counter {...props}/>

    case FIELD.TYPE.COL:
      return <View {...props}>{items.map(Render)}</View>

    case FIELD.TYPE.LABEL:
      if (items.length) props.children = items.map(Render)
      return <Label {...props}/>

    case FIELD.TYPE.PIE_CHART:
      const {mapItems, ...prop} = props
      if (mapItems) data = mapProps(data, mapItems)
      return <PieChart items={data} {...prop}/>

    case FIELD.TYPE.ROW:
      return <Row {...props}>{items.map(Render)}</Row>

    case FIELD.TYPE.TABLE:
      const {extraItems, filterItems, parentItem, ...more} = props
      if (filterItems && parentItem) {
        data = data.filter(item => {
          return !filterItems.find(filter => {
            for (const key in filter) {
              // If mismatch in value found, filter out given item
              if (get(item, key) !== get(parentItem, filter[key])) return true
            }
            return false
          })
        })
      }
      if (extraItems) data = data.concat(extraItems.map(item => {
        for (const key in item) {
          const definition = item[key]
          if (isObject(definition)) {
            if ((definition.name && Object.keys(definition).length === 1)) {
              item[key] = get(info, definition.name)
            } else if (definition.name && definition.render) {
              item[key].data = get(info, definition.name)
            } else if (definition.view) {
              item[key] = (_, index, props) => Render({...props, ...definition})
            }
          }
        }
        return item
      }))
      return <TableView items={data} {...more}/>

    case FIELD.TYPE.TABS:
      const tabs = items.map(({tab}, i) => isObject(tab) ? Render(tab, i) : tab)
      const panels = items.map(({content, data}, i) => isObject(content)
        ? Render.bind(this, {...content, data}, i)
        : content
      )
      return <Tabs items={tabs} panels={panels} {...props}/>

    case FIELD.TYPE.TEXT:
      if (items.length) props.children = items.map(Render)
      return <Text {...props}/>

    case FIELD.TYPE.TITLE:
      if (items.length) props.children = items.map(Render)
      return <Text {...props} className={classNames('h3', props.className)}/>

    default:
      const {mapOptions, ...rest} = props
      if (mapOptions) rest.options = mapProps(props.options || [], mapOptions)
      return ACTIVE.renderField({view, items, ...rest})
  }
}

/**
 * Render Value Function Getter
 *
 * @param {String} Name - one of FIELD.TYPE definitions
 * @returns {Function} renderer - that takes value as the first argument, and renders value in desired format
 */
export function RenderFunc (Name) {
  switch (Name) {
    case FIELD.RENDER.CURRENCY:
      return (val, index, {id, ...props} = {}) => (isNumeric(val)
          ? <Row {...props}><Text className='margin-right-smaller'>$</Text> {renderCurrency(val, 2)}</Row>
          : null
      )
    case FIELD.RENDER.PERCENT:
      return (val, index, {decimals} = {}) => toPercent(val, decimals)
    case FIELD.RENDER.TITLE_n_INPUT:
      return (val, index, {id, ...props} = {}) => <Row {...props}><Text>{val}</Text></Row>
    default:
      return (val) => val
  }
}

/**
 * Map meta.json declarations to props ready for rendering
 *
 * @param {Object} meta - json
 * @param {Object} data - json
 * @returns {Object} props
 */
export function metaToProps (meta, data) {
  for (const key in meta) {
    const definition = meta[key]
    if (!definition) continue

    // Map `onClick` functions by name (if exists)
    // @Note: high priority, because onClick string will be bound to `self` class inside `render` functions
    if (typeof definition.onClick === 'string') {
      definition.onClick = FIELD.FUNC[definition.onClick] || definition.onClick
    }

    // Map Value Renderer Names/Objects to Actual Render Functions
    if (key.indexOf('render') === 0) {
      if (typeof definition === 'string') meta[key] = RenderFunc(meta[key])
      if (isObject(definition)) meta[key] = (value, index, props, self) => {

        // Render is a field definition
        if (definition.view) return Render({
          ...definition,
          ...definition.name && {name: interpolateString(definition.name, {index, value})},
          // Filter for row data from parent table (in default layout)
          ...definition.filterItems && {parentItem: value},
          ...typeof definition.onClick === 'string' && self && !FIELD.FUNC[definition.onClick] &&
          {onClick: self[definition.onClick]},
          // Recursively map definitions within Render function
          ...definition.items && {items: metaToProps(definition.items, data)},
          ...props,
          data,
        })

        // Render has conditional match by values
        const valueProps = get(definition, `values[${value}]`, definition.default)
        return (isObject(valueProps))
          ? Render({...valueProps, ...props, data})
          : RenderFunc(valueProps).apply(this, [value, index, {...props, data}])
      }
    }

    // Process Object definitions
    else if (isObject(definition) || isList(definition)) {
      if ((definition.name && Object.keys(definition).length === 1)) {
        // Transform {name} - single key objects with name to their values
        meta[key] = get(data, definition.name)
      } else {
        // Recursively process the rest of definitions
        meta[key] = metaToProps(meta[key], data)
      }
    }
  }
  return meta
}

/**
 * Map Data by given Mapper definition
 *
 * @param {Array} data - to map
 * @param {Object|String} mapper - object of key / value pairs (value being key path from `data`), or key path string
 * @returns {Array} list - mapped from given data
 */
function mapProps (data, mapper) {
  const mapData = typeof mapper === 'string' ? (item) => get(item, mapper) : (item) => {
    const result = {}
    for (const key in mapper) {
      result[key] = get(item, mapper[key])
    }
    return result
  }
  return data.map(mapData)
}
