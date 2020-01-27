import classNames from 'classnames'
import React from 'react'
import { get, interpolateString, isObject, toPercent } from '../../common/utils'
import { ACTIVE, FIELD } from '../../common/variables'
import PieChart from '../charts/PieChart'
import Expand from '../Expand'
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
export default function Render ({data, view, items = [], ...props}, i) {
  if (props.key == null) props.key = i
  // Pass down data to child renderers, if defined
  if (props.name) data = get(data, props.name)
  if (data) items = items.map((item) => ({...item, data}))
  switch (view) {
    case FIELD.TYPE.EXPAND:
      return <Expand {...props}>{() => items.map(Render)}</Expand>
    case FIELD.TYPE.COL:
      return <View {...props}>{items.map(Render)}</View>
    case FIELD.TYPE.PIE_CHART:
      const {mapItems, ...prop} = props
      if (mapItems) {
        data = data.map(item => {
          const result = {}
          for (const key in mapItems) {
            result[key] = item[mapItems[key]]
          }
          return result
        })
      }
      return <PieChart items={data} {...prop}/>
    case FIELD.TYPE.ROW:
      return <Row {...props}>{items.map(Render)}</Row>
    case FIELD.TYPE.TABLE:
      return <TableView items={data} {...props}/>
    case FIELD.TYPE.TABS:
      const tabs = items.map(({tab}, i) => isObject(tab) ? Render(tab, i) : tab)
      const panels = items.map(({content, data}, i) => isObject(content)
        ? Render.bind(this, {...content, data}, i)
        : content
      )
      return <Tabs items={tabs} panels={panels} {...props}/>
    case FIELD.TYPE.TEXT:
      return <Text {...props}/>
    case FIELD.TYPE.TITLE:
      return <Text {...props} className={classNames('h3', props.className)}/>
    default:
      return ACTIVE.renderField({view, items, ...props})
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
      return (val, index, {id, ...props} = {}) => (
        <Row {...props}><Text className='margin-right-smaller'>$</Text> {renderCurrency(val, 2)}</Row>
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
 * @returns {Object} props
 */
export function metaToProps (meta) {
  for (const key in meta) {

    // Map Value Renderer Names/Objects to Actual Render Functions
    if (key.indexOf('render') === 0) {
      const render = meta[key]
      if (typeof render === 'string') meta[key] = RenderFunc(meta[key])
      if (isObject(render)) meta[key] = (val, index, props) => {

        // Render is a field definition
        if (render.view) return Render({
          ...render,
          ...render.name && {name: interpolateString(render.name, {index})},
          ...props
        })

        // Render has conditional match by values
        const valueProps = get(render, `values[${val}]`, render.default)
        return (isObject(valueProps))
          ? Render({...valueProps, ...props})
          : RenderFunc(valueProps).apply(this, [val, index, props])
      }
    }

    // Recursively process the rest of definitions
    else if (typeof meta[key] === 'object') {
      meta[key] = metaToProps(meta[key])
    }
  }
  return meta
}
