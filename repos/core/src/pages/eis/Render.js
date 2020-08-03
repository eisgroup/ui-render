import { NAME as POPUP } from 'modules-pack/popup'
import { stateAction } from 'modules-pack/redux'
import { FIELD } from 'modules-pack/variables'
import React, { Component } from 'react'
import { cn } from 'react-ui-pack'
import Button from 'react-ui-pack/Button'
import PieChart from 'react-ui-pack/charts/PieChart'
import Counter from 'react-ui-pack/Counter'
import Expand from 'react-ui-pack/Expand'
import ExpandList from 'react-ui-pack/ExpandList'
import Json from 'react-ui-pack/JsonView'
import Label from 'react-ui-pack/Label'
import List from 'react-ui-pack/List'
import Placeholder from 'react-ui-pack/Placeholder'
import ProgressSteps from 'react-ui-pack/ProgressSteps'
import { renderCurrency, renderFloat } from 'react-ui-pack/renders'
import Row from 'react-ui-pack/Row'
import Space from 'react-ui-pack/Space'
import TableView from 'react-ui-pack/TableView'
import TabList from 'react-ui-pack/TabList'
import Tabs from 'react-ui-pack/Tabs'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import {
  Active,
  ALERT,
  cloneDeep,
  get,
  interpolateString,
  isCollection,
  isFunction,
  isList,
  isNumeric,
  isObject,
  isString,
  removeNilValues,
  toList,
  toPercent
} from 'utils-pack'
import { _ } from 'utils-pack/translations'
import TooltipPop from '../../components/TooltipPop'

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
    // Wrap component with Tooltip automatically
    if (this.props.tooltip != null) {
      const {tooltip, ...props} = this.props
      return <TooltipPop inverted title={tooltip}>{Render(props)}</TooltipPop>
    }

    let {data, _data, view, items = [], relativeData, relativePath, relativeIndex, debug, ...props} = this.props
    if (props.name && _data == null) _data = get(data, props.name) // local data dynamically retrieved from definition

    // Pass down data to child renderers, if defined
    if (data) items = items.map((item) => ({data, debug, ...item})) // allow `data` to be overridden by config
    switch (view) {
      case FIELD.TYPE.BUTTON:
        if (items.length) props.children = items.map(Render)
        if (props.label != null && props.children == null) {
          props.children = props.label
          delete props.label
        }
        return <Button {...props}/>

      case FIELD.TYPE.EXPAND:
        if (props.label != null && props.title == null) {
          props.title = props.label
          delete props.label
        }
        if (props.name != null && props.title == null) props.title = props.name
        if (items.length) props.children = () => items.map(Render)
        return <Expand {...props}/>

      case FIELD.TYPE.EXPAND_LIST:
        return <ExpandList items={_data} {...props}/>

      case FIELD.TYPE.COUNTER:
        return <Counter {...props}/>

      case FIELD.TYPE.COL:
      case FIELD.TYPE.COL2:
      case FIELD.TYPE.COL3:
        return <View {...props}>{items.map(Render)}</View>

      case FIELD.TYPE.LIST:
      case FIELD.TYPE.COL_LIST:
      case FIELD.TYPE.COL_LIST3:
        return <List items={_data} {...props}/>

      case FIELD.TYPE.LABEL:
        if (items.length) props.children = items.map(Render)
        return <Label {...props}/>

      case FIELD.TYPE.PIE_CHART:
        const {mapItems, ...prop} = props
        if (mapItems) _data = mapProps(_data, mapItems, {debug})
        if (items.length) prop.children = items.map(Render)
        return <PieChart items={_data} {...prop}/>

      case FIELD.TYPE.PROGRESS_STEPS:
        const steps = items.map(({step, label, content, data, ...info}, i) => {
          return {
            ...info,
            step: isObject(step) ? Render(step, i) : step,
            label: isObject(label) ? Render(label, i) : label,
            content: isObject(content) ? Render.bind(this, {...content, data}, i) : content
          }
        })
        return <ProgressSteps items={steps} {...props}/>

      case FIELD.TYPE.ROW:
      case FIELD.TYPE.ROW2:
        return <Row {...props}>{items.map(Render)}</Row>

      case FIELD.TYPE.ROW_LIST:
      case FIELD.TYPE.ROW_LIST2:
        return <List row={true} items={_data} {...props}/>

      case FIELD.TYPE.SPACE:
        return <Space {...props}/>

      case FIELD.TYPE.TABLE:
        const {extraItems, filterItems, parentItem, ...more} = props
        if (!isList(_data)) _data = []
        if (filterItems && parentItem) {
          _data = _data.filter(item => {
            return !filterItems.find(filter => {
              for (const key in filter) {
                // If mismatch in value found, filter out given item
                if (get(item, key) !== get(parentItem, filter[key])) return true
              }
              return false
            })
          })
        }
        if (extraItems) _data = _data.concat(extraItems.map(item => {
          for (const id in item) {
            const definition = item[id]
            if (isObject(definition)) {
              if ((definition.name && Object.keys(definition).length === 1)) {
                item[id] = get(data, definition.name)
              } else if (definition.name && definition.render) {
                item[id].data = get(data, definition.name)
              } else if (definition.view) {
                item[id] = (_, index, props) => Render({debug, ...props, ...definition})
              }
            }
          }
          return item
        }))
        return <TableView items={_data} {...more}/>

      case FIELD.TYPE.TABS:
        const tabs = items.map(({tab}, i) => isObject(tab) ? Render(tab, i) : tab)
        const panels = items.map(({content, data}, i) => isObject(content)
          ? Render.bind(this, {...content, data, debug}, i)
          : content
        )
        return <Tabs items={tabs} panels={panels} {...props}/>

      case FIELD.TYPE.TAB_LIST:
        return <TabList items={_data} {...props}/>

      case FIELD.TYPE.TEXT:
      case FIELD.TYPE.TITLE:
        if (props.label != null && props.children == null) {
          props.children = props.label
          delete props.label
        }
        if (items.length) {
          props.children = items.map(Render)
        } else if (props.renderLabel) {
          props.children = props.renderLabel(props.children)
          delete props.renderLabel
        }
        if (view === FIELD.TYPE.TITLE) props.className = cn('h3', props.className)
        return <Text {...props}/>

      case FIELD.TYPE.TOOLTIP:
        if (props.label != null && props.content == null) {
          props.content = props.label
          delete props.label
        }
        if (props.renderLabel) {
          props.content = props.renderLabel(props.content)
          delete props.renderLabel
        }
        if (items.length) {
          props.children = items.map(Render)
        } else if (isObject(props.children)) {
          props.children = Render({debug, ...props.children})
        }
        return <TooltipPop inverted {...props}/>

      default:
        const {mapOptions, ...input} = props
        if (mapOptions) input.options = mapProps(input.options || [], mapOptions, {debug})
        if (relativeData && relativePath != null && input.name) {
          input.name = `${relativePath}${relativeIndex != null ? `[${relativeIndex}]` : ''}.${input.name}`
        }
        return Active.renderField({view, items, ...input})
    }
    return null
  }
}

Render.onError = (err, errInfo, props) => Active.store.dispatch(stateAction(POPUP, ALERT, {
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
    case FIELD.RENDER.DOUBLE5:
      return (val, index, {id, ...props} = {}) => renderFloat(val, 5, props)
    case FIELD.RENDER.FLOAT:
      return (val, index, {id, ...props} = {}) => isNumeric(val) ? renderFloat(val, undefined, props) : null
    case FIELD.RENDER.PERCENT:
      return (val, index, {decimals} = {}) => toPercent(val, decimals)
    case FIELD.RENDER.TITLE_n_INPUT:
      return (val, index, {id, ...props} = {}) => <Row {...props}><Text>{val}</Text></Row>
    default:
      return (val) => val
  }
}

/**
 * Recursively map meta.json declarations to props ready for rendering (by mutation)
 * @Note: this function must only transform config, without adding data.
 *  Because data is added at runtime on Render.
 *
 * @param {Object} meta - json
 * @param {Object} data - json
 * @param {Object} instance - of React Component class that is rendering the data, for mapping dynamic states
 * @param {String} [relativePath] - path used for getting data of parent container
 * @param {String|Number} [relativeIndex] - index used for getting data of parent container
 * @param {Boolean} [debug] - whether debug mode is enabled - certain errors will be raised, instead of silenced
 * @returns {Object} props - mutated meta
 */
export function metaToProps (meta, {data, instance, relativePath, relativeIndex, debug = false}) {
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

      // Below transformation only happens during render
      if (isObject(definition)) meta[key] = (value, index, props, self) => {
        if (definition.relativeData) data = value

        // Render is a field definition
        if (definition.view) {
          const {name, filterItems, ...configs} = definition
          const revPath = {relativePath: meta.name || relativePath, relativeIndex: index}
          const options = {data, instance, ...revPath}
          return Render({
            // Relative Path is required for nested Inputs
            ...revPath,
            ...props,
            // Recursively map definitions within Render function
            // Note: since definition is mutated on each transform,
            // we have to use original config for rendering lists
            ...metaToProps(cloneDeep(configs), options),
            // Transform key path with actual data
            ...name && {name: interpolateString(definition.name, {index, value})},
            ...definition.index && {index: interpolateString(definition.index, {index})},
            // Filter for row data from parent table (in default layout)
            ...filterItems && {filterItems, parentItem: value},
            // Inject functions by their name string
            ...removeNilValues(FUNCTION_NAMES.map(func => isString(definition[func]) && self &&
              !getFunctionFromString(definition[func], null) && {[func]: self[definition[func]]}
            )).reduce((obj, item) => ({...obj, ...item}), {}),
            data,
          }, index)
        }

        // Render has conditional match by values
        const valueProps = get(definition, `values[${value}]`, definition.default)
        return (isObject(valueProps))
          ? Render({...props, ...valueProps, data}, index)
          : RenderFunc(valueProps).apply(this, [value, index, {...props, data}])
      }
    }

    // Process nested Object/List definitions
    else if (isCollection(definition)) {
      if ((definition.name != null && Object.keys(definition).length === 1)) {
        // Transform {name} - single key objects with name to their values
        meta[key] = isString(definition.name) ? get(data, definition.name, definition.name) : definition.name
      } else {
        // Recursively process the rest of definitions
        // Relative path must always be passed down, because nested Inputs inside List require absolute path for `name`
        const options = {data, instance, relativePath: meta.name || relativePath, relativeIndex}
        if (meta.relativeData && meta.name != null) options.data = get(data, meta.name, data)
        meta[key] = metaToProps(meta[key], options)
      }
    }
  }

  // Pass down relative path to nested views
  if (meta.view) {
    if (relativePath != null && meta.relativePath == null) meta.relativePath = relativePath
    if (relativeIndex != null && meta.relativeIndex == null) meta.relativeIndex = relativeIndex
  }

  return meta
}

/**
 * Map Data by given Mapper definition
 *
 * @param {Array} data - to map
 * @param {Object|String} mapper - object of key / value pairs (value being key path from `data`), or key path string
 * @param {Boolean} [debug] - whether to raise silenced error if data is missing or of incorrect type
 * @returns {Array} list - mapped from given data
 */
function mapProps (data, mapper, {debug} = {}) {
  const mapData = typeof mapper === 'string' ? (item) => get(item, mapper, item) : (item, index) => {
    const result = {}
    for (const key in mapper) {
      // `index` must be converted to string to match fallback value defined in config (which can only be string)
      // fallback to item if key not found
      result[key] = mapper[key] === '{index}' ? String(index) : get(item, mapper[key], item)
    }
    return result
  }
  return (debug ? data : toList(data, 'clean')).map(mapData)
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

/**
 * Map function arguments definition to actual values
 */
function transformDefinition (value, {data, args}) {
  if (isString(value)) return interpolateString(
    interpolateString(value, args, {suppressError: true}),
    data,
    {suppressError: true},
  )
  if (isCollection(value)) {
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
