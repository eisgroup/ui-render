import { interpolateString, isCollection, isFunction, isList, isString, removeNilValues, toList } from 'ui-utils-pack'
import { cloneDeep, get, hasObjectValue, isObject } from 'ui-utils-pack/object'
import Render from './Render'

const FUNCTION_NAMES = ['onClick', 'onChange', 'onDone']

/**
 * Map Data by given Mapper definition
 *
 * @param {Array|*} data - to map
 * @param {Object|String} mapper - object of key / value pairs (value being key path from `data`), or key path string
 * @param {Boolean} [debug] - whether to raise silenced error if data is missing or of incorrect type
 * @returns {Array} list - mapped from given data
 */
export function mapProps (data, mapper, {debug} = {}) {
    const mapData = typeof mapper === 'string' ? (item) => get(item, mapper, item) : (item, index) => {
        const result = {}
        for (const key in mapper) {
            // `index` must be converted to string to match fallback value defined in config (which can only be string)
            // fallback to item if key not found
            result[key] = mapper[key] === '{index}' ? String(index) : get(item, mapper[key], item)
        }
        return result
    }
    return (debug ? data : toList(data, true)).map(mapData)
}

/**
 * Recursively map meta.json declarations to props ready for rendering (by mutation)
 * @Note: this function must only transform config, without adding data.
 *  Because data is added at runtime on Render.
 *
 * @param {Object} meta - json
 * @param {*} config
 * @returns {Object} props - mutated meta
 */
export function metaToProps (meta, config) {
    const {
        form,
        instance, // contains dynamic `state` to hydrate meta data
        relativePath,
        relativeIndex,
        funcConfig,
    } = config
    let {data, _data} = config
    // Transform Root attributes
    if (isObject(meta)) {
        metaToFunctions(meta, {...funcConfig, data})
        if (meta.name) meta.name = interpolateString(meta.name, instance, {suppressError: true})
    }

    for (const attribute in meta) {
        // Skip `meta` json config for nested UI Render instances
        if (attribute === 'meta') continue
        const definition = meta[attribute]
        if (!definition) continue

        // Map `onClick` functions by name (if exists)
        // @Note: high priority, because onClick string will be bound to `self` class inside `render` functions
        if (isObject(definition)) {
            metaToFunctions(definition, {...funcConfig, data})
            if (definition.name) {
                definition.name = interpolateString(definition.name, instance, {suppressError: true})
            }
        }

        // Map Value Renderer Names/Objects to Actual Render Functions
        if (attribute.indexOf('render') === 0) {
            if (typeof definition === 'string') { // @ts-ignore
                meta[attribute] = Render.Method(meta[attribute])
            }
            // Below transformation only happens during render
            if (isObject(definition)) meta[attribute] = (value, index, props, self) => {
                if (definition.relativeData === false) {
                    _data = data
                } else {
                    _data = value
                }

                // Render is a field definition
                if (definition.view) {
                    const {name, filterItems, ...configs} = definition
                    const revPath = {
                        relativeIndex: index
                    }
                    // `meta.name` is undefined when Table.headers.renderCell is defined,
                    // this leads to nested Table with incorrect Input.name, which relies on correct `relativePath`.
                    // The condition is met when:
                    //    - meta.name === undefined
                    //    - relativePath != null
                    //    - relativeIndex != null
                    //    - self.props.name !== relativePath.split('.').pop() // when Table is nested inside List
                    // And requires Table.name to be appended to existing `relativePath`:
                    //    `${relativePath}.${relativeIndex}.${Table.name}`
                    // @solution: extract Table.name from class instance `self` because `meta` only has parent config.
                    if (
                      meta.name == null && relativePath != null && relativeIndex != null &&
                      self && self.props && self.props.name !== relativePath.split('.').pop()
                    ) {
                        revPath.relativePath = relativePathFrom(self.props, relativePath, relativeIndex)
                    } else {
                        revPath.relativePath = relativePathFrom(meta, relativePath, relativeIndex)
                    }

                    return Render({
                        // Relative Path is required for nested Inputs
                        ...revPath,
                        ...props,
                        // Recursively map definitions within Render function
                        // Note: since definition is mutated on each transform,
                        // we have to use original config for rendering lists
                        ...metaToProps(cloneDeep(configs), {...config, ...revPath, data, _data}),
                        // Transform key path with actual data
                        ...name && {name: interpolateString(definition.name, {index, value})},
                        ...definition.index && {index: interpolateString(definition.index, {index})},
                        // Filter for row data from parent table (in default layout)
                        ...filterItems && {filterItems, parentItem: value},
                        // Inject functions by their name string
                        ...removeNilValues(FUNCTION_NAMES.map(func => isString(definition[func]) && self &&
                          !getFunctionFromString(definition[func], {...funcConfig, fallback: null}) &&
                          {[func]: self[definition[func]]}
                        )).reduce((obj, item) => ({...obj, ...item}), {}),
                        ...definition.view.indexOf('Data') === 0 && {index},
                        data, _data, form, instance,
                    }, index)
                }

                // Render is a function definition
                else if (definition.name) {
                    const func = getFunctionFromObject(definition, {...funcConfig, data})
                    // @ts-ignore
                    return isFunction(func) ? func.apply(this, [value, index, {...props, ...definition, data, _data}])
                      : func
                }

                // Render is conditional match by values definitions
                else if (definition.values) {
                    const valueDefinition = definition.values[value] || definition.default
                    if (!valueDefinition) return value
                    return (isObject(valueDefinition))
                      ? (valueDefinition.view
                          ? Render({...props, ...valueDefinition, data, _data}, index)
                          : getFunctionFromObject(valueDefinition, {...funcConfig, data}) // @ts-ignore
                            .apply(this, [value, index, {...props, ...valueDefinition, data, _data}])
                      ) // @ts-ignore
                      : Render.Method(valueDefinition).apply(this, [value, index, {...props, data, _data}])
                }
            }
        }

        // Process nested Object/List definitions
        else if (isCollection(definition)) {
            const attrCount = Object.keys(definition).length
            if ( // this condition check must match exact case immediately, so that other cases get transformed
              attribute !== 'showIf' && definition.name != null &&
              (attrCount === 1 || (attrCount === 2 && definition.relativeData != null))
            ) {
                // Value Transform {name} - single key objects with name to their values
                // fallback to `name` attribute for transformed values from `state` (i.e. Tab.index, Dropdown.value...)
                // noinspection PointlessBooleanExpressionJS
                meta[attribute] = isString(definition.name)
                  ? get((definition.relativeData !== false && _data) || data, definition.name, definition.name)
                  : definition.name
                // Leave this to help users debug unresolved values
                if (meta[attribute] === definition.name && isString(definition.name) && isNaN(+definition.name)) {
                    // meta.view is equal to undefined in case of table headers (in some cases)
                    // in other cases no need to display label name
                    if (meta.view !== undefined) {
                        meta[attribute] = "";
                    }
                    console.warn(`${meta.view}.${attribute}`, definition, '\n❌ Not found! relative _data:', _data)
                }
            } else {
                // Recursively process the rest of definitions
                // Relative path must always be passed down, because nested Inputs inside List require absolute path for `name`
                const options = {
                    data, _data, instance,
                    relativePath: relativePathFrom(meta, relativePath, relativeIndex), relativeIndex
                }
                // Resolve local `_data` for nested definitions
                // noinspection PointlessBooleanExpressionJS
                if (meta.relativeData !== false && meta.name != null) options._data = get(_data || data, meta.name, _data)
                meta[attribute] = metaToProps(meta[attribute], {...config, ...options})
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
 * Transform Function Definition strings to actual methods, if they exist, by mutation
 * @example:
 *    const definition = {onChange: 'functionName'}
 *    >>> {onChange: Function}
 *
 * @param {Object} definition - containing function names
 * @param {Object} config
 * @returns {void} definition - with names replaced by functions (by mutation)
 */
function metaToFunctions(definition, config) {
    const {
        fieldValidation,
        fieldNormalizer,
        fieldParser,
        fieldFunc,
        funcNames = FUNCTION_NAMES
    } = config
    /* react-final-form does not support validate as array, like redux-form */
    // const validations = toList(definition.validate)
    // if (isString(validations[0])) definition.validate = removeNilValues(validations.map(id => FIELD.VALIDATION[id]))
    if (isString(definition.format)) definition.format = fieldNormalizer[definition.format]
    if (isString(definition.parse)) definition.parse = fieldParser[definition.parse] || fieldNormalizer[definition.parse]
    if (isString(definition.normalize)) definition.normalize = fieldNormalizer[definition.normalize]
    if (isString(definition.validate)) definition.validate = fieldValidation[definition.validate]
    if (hasObjectValue(definition.verify)) {
        // in the future, verify can have multiple validator functions, so compose them
        const {validate, ...opt} = definition.verify
        // final-form only passes input `value` to validate function
        const validators = toList(validate).map(({name, ...args}) => (v) => fieldValidation[name](v, {...opt, ...args}))
        if (definition.validate) validators.unshift(definition.validate)
        definition.validate = composeValidators(...validators)
        delete definition.verify
    }
    funcNames.forEach(name => {
        if (isString(definition[name])) {
            definition[name] = getFunctionFromString(definition[name], {fieldFunc})
        } else if (isObject(definition[name])) {
            definition[name] = getFunctionFromObject(definition[name], config)
        }
    })
}

const composeValidators = (...validators) => (value) => validators.reduce((error, validator) => error || validator(value), undefined)

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
 * @param {Object} config
 * @returns {Function|String} method - that receives caller arguments as its first arguments,
 *    and will chain function calls `onDone` recursively
 */
function getFunctionFromObject(definition, config) {
    const {name, mapArgs, args = [], onDone} = definition
    const {data, fieldFunc, fieldMethods, fallback = definition.name} = config
    const func = fieldFunc[name] || fieldMethods[name]
    if (onDone) metaToFunctions(definition, config)
    if (func) {
        const hasMapArgs = isList(mapArgs)
        if (isFunction(definition.onDone)) {
            return (...values) => {
                // @ts-ignore
                if (hasMapArgs) values = mapArgs.map((val) => mapFunctionArgs(val, {data, args: values}))
                const result = func(...values, ...args)
                // @ts-ignore
                if (result instanceof Promise) return result.then(definition.onDone)
                // @ts-ignore
                return definition.onDone(result)
            }
        } else {
            return (...values) => {
                // @ts-ignore
                if (hasMapArgs) values = mapArgs.map((val) => mapFunctionArgs(val, {data, args: values}))
                return func(...values, ...args)
            }
        }
    }
    // @ts-ignore
    return func || Render.Method(name) || fallback
}

/**
 * Get Function from Definition String
 * @example:
 *    getFunctionFromString('reset,0', {fieldFunc: FIELD.FUNC})
 *    >>> function reset(...argumentsSuppliedFromCaller, '0') {...}
 *
 * @param {String} string - name of function to get, with optional arguments, separated by comma
 * @param {*} config
 * @returns {Function|String|*} method - that receives caller arguments as its first arguments,
 *    along with optionally defined arguments in the config string
 */
function getFunctionFromString (string, {fieldFunc, fallback = string}) {
    const [name, ...args] = string.split(',')
    const func = fieldFunc[name]
    return ((args.length && func) ? ((...arg) => func(...arg, ...args)) : func) || fallback
}

/**
 * Map function arguments definition to actual values
 * @param {*} template - for the argument to be transformed
 * @param {*} options
 * @returns {*} argument transformed with given options
 */
function mapFunctionArgs (template, {data, args}) {
    if (isString(template))
        return interpolateString(interpolateString(template, args, {suppressError: true}), data, {suppressError: true})
    if (isCollection(template)) {
        for (const key in template) {
            template[key] = mapFunctionArgs(template[key], {data, args})
        }
    }
    return template
}

/**
 * Compute Relative Path for given config
 * @param {Object|*[]|*} meta - config of the parent node
 * @param {String} relativePath - inherited from parent node
 * @param {String|Number} relativeIndex - inherited from parent node
 * @returns {String} relativePath - calculated from root path for current config
 */
function relativePathFrom (meta, relativePath, relativeIndex) {
    let result = relativePath || meta.name
    // If `meta.name` is relative, concatenate it with inherited `relativePath` for absolute relative path,
    // to pass down to nested configs (ex. Expand inside Table.headers = [{id, renderCell: {...}}] )
    if (meta.name != null && meta.relativeData !== false) {
        result = relativePath != null ? `${relativePath}.${relativeIndex}.${meta.name}` : meta.name
    }
    return result
}
