import { NAME as POPUP } from 'modules-pack/popup'
import { stateAction } from 'modules-pack/redux'
import { FIELD } from 'modules-pack/variables'
import React, { Component } from 'react'
import Json from 'react-ui-pack/JsonView'
import Placeholder from 'react-ui-pack/Placeholder'
import { renderCurrency, renderFloat } from 'react-ui-pack/renders'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import TooltipPop from 'react-ui-pack/TooltipPop'
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
  toPercent
} from 'utils-pack'
import { _ } from 'utils-pack/translations'
import RenderComponent from './mapper'

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
Active.Render = Render
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

    let {data, _data, items = [], relativeData, relativePath, relativeIndex, debug, view, ...props} = this.props

    // Global/Relative Data access
    if (props.name) _data = get((relativeData && _data) || data, props.name) // local data dynamically retrieved from definition

    // Pass down data to child renderers
    items = items.map((item) => ({data, _data, debug, ...item})) // allow `data` and `_data` to be overridden by config

    return RenderComponent.call(this, {...this.props, _data, items})
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
      return (val, index, {id, decimals = 2, ...props} = {}) => (isNumeric(val)
          ? <Row {...props}><Text className='margin-right-smaller'>$</Text> {renderCurrency(val, decimals)}</Row>
          : null
      )
    case FIELD.RENDER.DOUBLE5:
      return (val, index, {id, ...props} = {}) => renderFloat(val, 5, props)
    case FIELD.RENDER.FLOAT:
      return (val, index, {id, decimals, ...props} = {}) => isNumeric(val) ? renderFloat(val, decimals, props) : null
    case FIELD.RENDER.PERCENT:
      return (val, index, {decimals} = {}) => toPercent(val, decimals)
    case FIELD.RENDER.TITLE_n_INPUT:
      return (val, index, {id, ...props} = {}) => <Row {...props}><Text>{val}</Text></Row>
    default:
      return
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

        // Render is a function definition
        else if (definition.name) {
          return getFunctionFromObject(definition, {data}).apply(this, [value, index, {...props, ...definition, data}])
        }

        // Render is conditional match by values definitions
        else if (definition.values) {
          const valueDefinition = definition.values[value] || definition.default
          if (!valueDefinition) return value
          return (isObject(valueDefinition))
            ? (valueDefinition.view
                ? Render({...props, ...valueDefinition, data}, index)
                : getFunctionFromObject(valueDefinition, {data})
                  .apply(this, [value, index, {...props, ...valueDefinition, data}])
            )
            : RenderFunc(valueDefinition).apply(this, [value, index, {...props, data}])
        }
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
  return func || RenderFunc(name) || fallback
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
 * @example:
 *    const definition = {onChange: 'functionName'}
 *    >>> {onChange: Function}
 *
 * @param {Object} definition - containing function names
 * @param {Object} data - json
 * @param {Array} [funcNames] - list of definitions keys to check for function transform
 * @returns {Object} definition - with names replaced by functions (by mutation)
 */
function metaToFunctions (definition, {data, funcNames = FUNCTION_NAMES} = {}) {
  /* react-final-form does not support validate as array, like redux-form */
  // const validations = toList(definition.validate)
  // if (isString(validations[0])) definition.validate = removeNilValues(validations.map(id => FIELD.VALIDATION[id]))
  if (isString(definition.validate)) definition.validate = FIELD.VALIDATION[definition.validate]
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
