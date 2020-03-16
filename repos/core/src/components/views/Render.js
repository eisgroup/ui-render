import classNames from 'classnames'
import React, { Component } from 'react'
import { ALERT, stateAction } from '../../common/actions'
import {
  get,
  interpolateString,
  isFunction,
  isList,
  isNumeric,
  isObject,
  isString,
  removeNilValues,
  toList,
  toPercent
} from '../../common/utils'
import { _, ACTIVE, FIELD } from '../../common/variables'
import { POPUP } from '../../modules/exports'
import Button from '../Button'
import PieChart from '../charts/PieChart'
import Counter from '../Counter'
import Expand from '../Expand'
import Json from '../Json'
import Label from '../Label'
import Placeholder from '../Placeholder'
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
export default function Render (props, i) {
  return <RenderClass {...props} key={typeof i !== 'object' ? i : undefined}/>
}

class RenderClass extends Component {
  state = {
    error: false,
  }

  componentDidCatch (error, errorInfo) {
    this.setState({error}, () => Render.onError(error, errorInfo, this.props))
  }

  // @Note: try block only catches error in this Render function,
  // Errors in components will propagate up to componentDidCatch in parent class.
  render () {
    if (this.state.error) return <Placeholder>{String(this.state.error)}</Placeholder>
    let {data: info, view, items = [], ...props} = this.props
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
      case FIELD.TYPE.COLUMN:
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
        return isList(data) ? <TableView items={data} {...more}/> : null

      case FIELD.TYPE.TABS:
        const tabs = items.map(({tab}, i) => isObject(tab) ? Render(tab, i) : tab)
        const panels = items.map(({content, data}, i) => isObject(content)
          ? Render.bind(this, {...content, data}, i)
          : content
        )
        return <Tabs items={tabs} panels={panels} {...props}/>

      case FIELD.TYPE.TEXT:
        if (items.length) props.children = items.map(Render)
        if (props.title) props.children = props.title
        return <Text {...props}/>

      case FIELD.TYPE.TITLE:
        if (items.length) props.children = items.map(Render)
        if (props.title) props.children = props.title
        return <Text {...props} className={classNames('h3', props.className)}/>

      default:
        const {mapOptions, ...rest} = props
        if (mapOptions) rest.options = mapProps(props.options || [], mapOptions)
        return ACTIVE.renderField({view, items, ...rest})
    }
    return null
  }
}

Render.onError = (err, errInfo, props) => ACTIVE.store.dispatch(stateAction(POPUP, ALERT, {
  items: [
    {
      title: `${Render.name} Error!`,
      content: <View>
        <Text className='h5'>{_.ERROR_MESSAGE}</Text>
        <Text className='p'>{String(err)}</Text>
        <Text className='h5 padding-top'>{_.DATA_CAUSING_ERROR}</Text>
        <View style={{textAlign: 'left'}}>
          <Json data={props}/>
        </View>
        <Text className='h5 padding-top'>{_.ERROR_INFO}</Text>
        <View style={{textAlign: 'left'}}>
          <Json data={errInfo}/>
        </View>
      </View>
    }
  ]
}))

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
 * Map meta.json declarations to props ready for rendering (by mutation)
 *
 * @param {Object} meta - json
 * @param {Object} data - json
 * @param {Object} instance - of React Component class that is rendering the data, for mapping dynamic states
 * @returns {Object} props - mutated meta
 */
export function metaToProps (meta, data, instance) {
  for (const key in meta) {
    const definition = meta[key]
    if (!definition) continue

    // Map `onClick` functions by name (if exists)
    // @Note: high priority, because onClick string will be bound to `self` class inside `render` functions
    if (isObject(definition)) {
      metaToFunctions(definition, {data})
      if (definition.name) definition.name = interpolateString(definition.name, instance, {suppressError: true})
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
          // Inject functions by their name string
          ...removeNilValues(FUNCTION_NAMES.map(func => isString(definition[func]) && self &&
            !getFunctionFromString(definition[func], null) && {[func]: self[definition[func]]}
          )).reduce((obj, item) => ({...obj, ...item}), {}),
          // Recursively map definitions within Render function
          ...definition.items && {items: metaToProps(definition.items, data, instance)},
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
      if ((definition.name != null && Object.keys(definition).length === 1)) {
        // Transform {name} - single key objects with name to their values
        meta[key] = isString(definition.name) ? get(data, definition.name, definition.name) : definition.name
      } else {
        // Recursively process the rest of definitions
        meta[key] = metaToProps(meta[key], data, instance)
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
  const mapData = typeof mapper === 'string' ? (item) => get(item, mapper) : (item, index) => {
    const result = {}
    for (const key in mapper) {
      // `index` must be converted to string to match fallback value defined in config (which can only be string)
      result[key] = mapper[key] === '{index}' ? String(index) : get(item, mapper[key])
    }
    return result
  }
  return data.map(mapData)
}

/**
 * Get Function from Definition String
 * @example:
 *    getFunctionFromString('reset,0')
 *    >>> function reset(...argumentsSuppliedFromCaller, '0') {...}
 *
 * @param {String} string - name of function to get, with optional arguments, separated by comma
 * @param {*} [fallback] - value to use when function not found, defaults to given `string`
 * @returns {Function|String} method - that receives caller arguments as its first arguments,
 *    along with optionally defined arguments in the config string
 */
function getFunctionFromString (string, fallback = string) {
  const [name, ...args] = string.split(',')
  const func = FIELD.FUNC[name]
  return ((args.length && func) ? ((...arg) => func(...arg, ...args)) : func) || fallback
}

/**
 * Get Function/s from Definition Object Recursively
 * @example:
 *    getFunctionFromObject({name: 'reset', args: [0], onDone: 'setState,active.plan'})
 *    >>> function (...argumentsSuppliedFromCaller) {
 *          return setState(reset(...argumentsSuppliedFromCaller, 0), 'active.plan')
 *        }
 *
 * @param {Object<name, args, onDone>} definition - of function to call
 *    - @param {String} name - of the function
 *    - @param {Array} [args] - last arguments to pass to the function
 *    - @param {String|Object} [onDone] - callback recursive function definitions
 * @param {Object} data - json
 * @param {*} [fallback] - value to use when function not found, defaults to given `name`
 * @returns {Function|String} method - that receives caller arguments as its first arguments,
 *    and will chain function calls `onDone` recursively
 */
function getFunctionFromObject (definition, {data, fallback = definition.name} = {}) {
  const {name, mapArgs, args = [], onDone} = definition
  const func = FIELD.FUNC[name]
  if (onDone) metaToFunctions(definition, {data})
  if (func) {
    const hasMapArgs = isList(mapArgs)
    if (isFunction(definition.onDone)) {
      return (...values) => {
        if (hasMapArgs) values = mapArgs.map(val => transformDefinition(val, {data, args: values}))
        const result = func(...values, ...args)
        if (result instanceof Promise) return result.then(definition.onDone)
        return definition.onDone(result)
      }
    } else {
      return (...values) => {
        if (hasMapArgs) values = mapArgs.map(val => transformDefinition(val, {data, args: values}))
        return func(...values, ...args)
      }
    }
  }
  return func || fallback
}

function transformDefinition (value, {data, args}) {
  if (isString(value)) return interpolateString(
    interpolateString(value, args, {suppressError: true}),
    data,
    {suppressError: true},
  )
  if (isObject(value) || isList(value)) {
    for (const key in value) {
      value[key] = transformDefinition(value[key], {data, args})
    }
  }
  return value
}

/**
 * Transform Definition Functions if they exist
 *
 * @param {Object} definition - containing function names
 * @param {Object} data - json
 * @param {Array} [funcNames] - list of definitions keys to check for function transform
 * @returns {Object} definition - with names replaced by functions (by mutation)
 */
function metaToFunctions (definition, {data, funcNames = FUNCTION_NAMES} = {}) {
  const validations = toList(definition.validate)
  if (isString(validations[0])) definition.validate = removeNilValues(validations.map(id => FIELD.VALIDATION[id]))
  if (isString(definition.normalize)) definition.normalize = FIELD.NORMALIZER[definition.normalize]
  funcNames.forEach(name => {
    if (isString(definition[name])) {
      definition[name] = getFunctionFromString(definition[name])
    } else if (isObject(definition[name])) {
      definition[name] = getFunctionFromObject(definition[name], {data})
    }
  })
}

const FUNCTION_NAMES = ['onClick', 'onChange', 'onDone']
