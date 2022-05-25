import { fetch } from 'modules-pack/api'
import { withForm } from 'modules-pack/form'
import { popupAlert } from 'modules-pack/popup'
import { FIELD } from 'modules-pack/variables'
import React, { Component, Fragment } from 'react'
import { cn, type } from 'react-ui-pack'
import Json from 'react-ui-pack/JsonView'
import ScrollView from 'react-ui-pack/ScrollView'
import { Active, get, isEmpty, isList, isString, logRender, round, sanitizeResponse, warn, } from 'utils-pack'
import { cloneDeep, hasObjectValue, isObject, set } from 'utils-pack/object'
import Render, { metaToProps } from '../../ui-render'
import { downloadFile } from './actions/file'
import './mapper' // Set up UI Renderer components and methods
import { _ } from './translations'
import { notWithinRange } from './validators'

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

FIELD.ACTION = {
  ADD_DATA: 'addData',
  DOWNLOAD: 'download',
  REMOVE_DATA: 'removeData',
  POPUP_DELAY: 'popupDelay',
  POPUP_OPEN: 'popupOpen',
  SUBMIT: 'submit',
}
FIELD.TYPE = {
  AUTO_SUBMIT: 'AutoSubmit',
  DATA: 'Data',
  ICON: 'Icon',
  IMAGE: 'Image',
  LINK: 'Link',
  POPUP: 'Popup',
  TABLE_CELLS: 'TableCells',
}
FIELD.VALIDATE = {
  NOT_WITHIN_RANGE: 'notWithinRange',
}
FIELD.NORMALIZE = {
  ...FIELD.NORMALIZE,
  CURRENCY: 'currency',
  PERCENT: 'percent',
}
FIELD.NORMALIZER = {
  ...FIELD.NORMALIZER,
  [FIELD.NORMALIZE.DATE]: (val) => val && val.split('T')[0],
  [FIELD.NORMALIZE.CURRENCY]: (v) => v == null ? v : Number((v || 0) || 0).toFixed(2),
  [FIELD.NORMALIZE.PERCENT]: (v) => {
    return v == null ? v : (Number((v || 0) || 0) * 100).toLocaleString()
  },
}
FIELD.PARSER = {
  ...FIELD.PARSER,
  [FIELD.NORMALIZE.PERCENT]: function fromPercent (v) {
    return v && round(v / 100, 5)
  },
}

/**
 * UI Render Instance Component
 * @example:
 *    <UIRender data={data} meta={meta} initialValues={data} onSubmit={this.submit}/>
 */
@withUISetup({subscription: {pristine: true, valid: true}})
@logRender
export default class UIRender extends Component {
  static propTypes = {
    data: type.Any.isRequired,
    meta: type.Object.isRequired,
    initialValues: type.Any, // should be the same as `data` initially
    childBefore: type.Any,
    childAfter: type.Any,
    // If given, will render <form onSubmit {...form} />
    form: type.OneOf(type.Boolean, type.Of({
      kind: type.Id,
    })),
    // Whether to disable rendering of wrapper scroll view and html form
    embedded: type.Boolean,
  }

  state = {
    data: {
      json: this.props.data
    },
    meta: {
      json: this.props.meta
    },
  }

  UNSAFE_componentWillReceiveProps (next, nextContext) {
    const {data, meta} = this.props
    const update = {}
    if (next.data !== data) set(update, 'data.json', next.data)
    if (next.meta !== meta) set(update, 'meta.json', next.meta)
    if (hasObjectValue(update)) this.setState(update)
  }

  render () {
    const {childBefore, childAfter, form, embedded, className, style} = this.props
    const content = this.hasData && this.hasMeta &&
      <Render data={this.data} {...this.meta} form={this.form} instance={this}/>
    const Container = embedded ? Fragment : ScrollView
    const props = embedded ? undefined : {
      fill: true,
      className: cn('ui__render fade-in bg-neutral', className),
      style,
    }
    return (
      <Container {...props}>
        {childBefore}
        {(form && !embedded) ? <form onSubmit={this.handleSubmit} {...form}>{content}</form> : content}
        {childAfter}
      </Container>
    )
  }
}

Active.UIRender = UIRender

/**
 * Transform *_meta.json API response into custom rules applied by the team
 */
export function transformConfig (meta) {
  return toOpenLConfig(sanitizeResponse(meta || {}, {tags: []}))
}

export function toOpenLConfig (meta) {
  if (isObject(meta)) {
    const {view} = meta

    // Apply default Dropdown config if onChange is not defined
    if ((view === FIELD.TYPE.DROPDOWN || view === FIELD.TYPE.SELECT) && meta.name != null && meta.onChange == null) {
      meta.onChange = FIELD.ACTION.SET_STATE + ',' + meta.name
      if (meta.value == null) meta.value = {name: `{state.${meta.name},0}`}
      if (meta.options != null) {
        if (isString(meta.options)) meta.options = {name: meta.options}
        if (isObject(meta.mapOptions)) {
          if (meta.mapOptions.value == null) meta.mapOptions.value = '{index}'
        } else {
          meta.mapOptions = {
            text: meta.mapOptions, // if not defined, will default to given option value
            value: '{index}', // always enforce using index
          }
        }
      }
    }

    // Add Table Expand to first column if `renderItem` defined, but `renderCell` is undefined
    else if (view === FIELD.TYPE.TABLE && meta.renderItem != null) {
      const firstHeader = get(meta.headers, '[0]')
      if (isObject(firstHeader) && firstHeader.renderCell == null) {
        firstHeader.renderCell = {
          view: FIELD.TYPE.EXPAND,
          name: '{value}',
          index: '{index}',
          onClick: 'handleItemExpand',
        }
      }
    }
  }

  for (const key in meta) {
    const val = meta[key] // need to also transform Tabs.items collection of objects, which have no `view`
    if (isList(val) || (isObject(val) && (val.view || val.content || val.id))) {
      meta[key] = toOpenLConfig(val)
    }

    // Convert `styles` attribute to `className`
    else if (key === 'styles') {
      meta.className = val
      delete meta[key]
    }

    // @deprecated: Convert `format` attribute to `normalize` (previously used redux-form)
    // else if (key === 'format') {
    //   meta.normalize = val
    //   delete meta[key]
    // }
  }

  return meta
}

/**
 * Decorator to extend UI Render instance with nested Data component interface
 */
export function withDataKind (Class) {
  // Register child instance from parent instance
  Class.prototype.registerDataKind = function (instance, kind, index) {
    if (!this.dataKind) this.dataKind = {}
    if (!this.dataKind[kind]) this.dataKind[kind] = {}
    this.dataKind[kind][index] = instance
  }

  // Unregister child instance from parent instance
  Class.prototype.unregisterDataKind = function (instance, kind, index) {
    if (!this.dataKind) this.dataKind = {}
    if (this.dataKind[kind]) delete this.dataKind[kind][index]

    // Update current parent state in case the component was edited, then unmounted from changing Tabs
    const {data} = this.state
    const {dataKind = {}} = data.json
    if (dataKind[kind] && dataKind[kind][index]) {
      dataKind[kind][index] = instance.formValues
      this.setState({data: {...data}, dataKind})
    }
  }

  /**
   * Retrieve current forms' values for given data kind, with fallback to data in state
   * @param {String}kind - Data component kind
   * @param {Number} [index] - Data component index
   * @returns {Array|Object|Undefined} all forms values by index array, or form values for given index object, else undefined
   */
  Class.prototype.getDataKind = function (kind, index) {
    if (index != null) {
      const values = get(this.dataKind, `${kind}.${index}`, {}).formValues
      return values != null ? values : get(this.state.dataKind, `${kind}.${index}`)
    }
    const stateBy = get(this.state.data.json.dataKind, kind)
    const instancesBy = get(this.dataKind, kind, {})
    const resultByIndex = []
    for (const index in stateBy) {
      const instance = instancesBy[index]
      resultByIndex[index] = instance ? instance.formValues : stateBy[index]
    }
    return resultByIndex
  }

  return Class
}

/**
 * React Class Decorator to setup UI with necessary variables and function definitions
 * @usage:
 *    - this.data -> *_data.json from state, ready for <Render> component consumption
 *    - this.meta -> transformed *_meta.json data from state, ready for <Render> component consumption
 *    - this.handleSubmit:
 *        1. final-form: to be used like this <form onSubmit={this.handleSubmit}>
 *        2. redux-form: to be used like this <form onSubmit={this.handleSubmit}>
 *    - this.hasData and this.hasMeta getters can be used for conditional check
 *    - Initialize with data by overriding initial state
 */
export function withUISetup (formConfig) {
  return function Decorator (Class) {
    const componentWillUnmount = Class.prototype.componentWillUnmount
    const UNSAFE_componentWillMount = Class.prototype.UNSAFE_componentWillMount
    const UNSAFE_componentWillUpdate = Class.prototype.UNSAFE_componentWillUpdate
    const UNSAFE_componentWillReceiveProps = Class.prototype.UNSAFE_componentWillReceiveProps
    withDataKind(Class)

    // @Note: the state shape is used for reference only, it is not instantiated
    Class.prototype.state = {
      data: {
        json: undefined, // data object
        name: undefined, // file name
      },
      meta: {
        json: undefined, // data object
        name: undefined, // file name
      },
    }

    // Define instance getter
    Object.defineProperty(Class.prototype, 'config', {
      get () {
        const data = this.data
        const {form, parent, index} = this.props
        // Download file from URL
        FIELD.FUNC[FIELD.ACTION.DOWNLOAD] = (...args) => {
          // The first argument can be Button Event
          if (typeof args[0] === 'object') args.shift()
          // noinspection JSCheckFunctionSignatures
          downloadFile(...args).catch(err => this.popupAlert(err, _.DOWNLOAD_FAILED_))
        }
        // Add current Form values to parent UI Render instance.state
        FIELD.FUNC[FIELD.ACTION.ADD_DATA] = (parent && form)
          ? () => {
            // Call form submit to run validation
            if (!this.canSave) return this.handleSubmit()

            // Add directly to data.json, to keep all data patterns consistent, and to enable backend override.
            // And store a copy in state for rehydration when backend updates response without added data.
            const {data} = parent.state
            const {dataKind = {}} = data.json
            dataKind[form.kind] = [...dataKind[form.kind] || [], this.registeredValues]
            data.json.dataKind = dataKind
            parent.setState({data: {...data}, dataKind}, () => {
              this.form.restart()
            })
          }
          : dataActionWarning
        // Remove current Form values from parent UI Render instance.state
        FIELD.FUNC[FIELD.ACTION.REMOVE_DATA] = (parent && form)
          ? () => {
            const {data} = parent.state
            const dataKind = {...data.json.dataKind}
            const array = [...dataKind[form.kind] || []]
            array.splice(index, 1)
            dataKind[form.kind] = array
            data.json.dataKind = dataKind
            parent.setState({data: {...data}, dataKind})
          }
          : dataActionWarning

        // Popup Content Opening
        FIELD.FUNC[FIELD.ACTION.POPUP_OPEN] = (...args) => {
          // The first argument can be Button Event
          if (typeof args[0] === 'object') args.shift()
          // noinspection JSCheckFunctionSignatures
          const [id, options] = args
          const {[id]: {content, title = '', ...props} = {}} = this.popupById || {}
          popupAlert(title, content, {...props, ...options})
        }

        // Cross UI Render instances validation
        FIELD.VALIDATION[FIELD.VALIDATE.NOT_WITHIN_RANGE] = (value, {dataKind, args: [start, end]}) => {
          const {form, index, parent} = this.props

          // Validate against self
          const {[start]: _a, [end]: _b} = this.formValues
          if (_a === _b) {
            return `${start} and ${end} cannot be the same`
          } else if (_a === value && _b < _a) {
            return `${start} cannot be more than ${end}`
          } else if (_b === value && _b < _a) {
            return `${end} cannot be less than ${start}`
          }

          // Retrieve current state from all Forms, with fallback to parent instance.state
          const valuesBy = parent.getDataKind(dataKind) // this only includes values in `data.dataKind` state
          const ranges = []
          const thisIndex = form.kind === dataKind ? String(index) : null
          for (const i in valuesBy) {
            if (i === thisIndex) continue
            const {[start]: a, [end]: b} = valuesBy[i]
            ranges.push([a, b])
          }

          // Validate against overlap
          if (_a != null && _b != null) {
            const range = ranges.find((([a, b]) => _a < a && b < _b))
            if (range) return `Cannot overlap [${range}] range`
          }

          return notWithinRange(value, ranges)
        }
        FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm.bind(this)
        FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates.bind(this)
        FIELD.FUNC[FIELD.ACTION.FETCH] = fetch
        FIELD.FUNC[FIELD.ACTION.POPUP] = this.popupAlert
        FIELD.FUNC[FIELD.ACTION.POPUP_DELAY] = delayed(this.popupAlert)
        FIELD.FUNC[FIELD.ACTION.SUBMIT] = this.submit

        return {
          data,
          form: this.form,
          instance: this,
          funcConfig: {
            data,
            fieldFunc: {...FIELD.FUNC}, // bind definition to this instance
            fieldNormalizer: {...FIELD.NORMALIZER},
            fieldParser: {...FIELD.PARSER},
            fieldValidation: {...FIELD.VALIDATION},
          }
        }
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'data', {
      get () {
        return get(this.state, 'data.json')
      },
      set (value) {
        return this.setState(set(this.state, 'data.json', value))
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'meta', {
      get () {
        if (this._meta != null) return this._meta
        return this._meta = metaToProps(transformConfig(cloneDeep(get(this.state, 'meta.json'))), this.config)
      },
      set (value) {
        return this._meta = value
      }
    })

    // Define instance method
    // Update data.json
    Class.prototype.dataUpdate = function (value) {
      return this.setState(set(this.state, 'data.json', value))
    }

    // Define instance method
    // Update meta.json
    Class.prototype.metaUpdate = function (value) {
      return this.setState(set(this.state, 'meta.json', value))
    }

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasData', {
      get () {
        return this.data != null
      },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasMeta', {
      get () {
        return !isEmpty(this.meta)
      },
    })

    // Define instance getter
    // Object.defineProperty(Class.prototype, 'handleSubmit', {
    //   get () {
    //     // For redux-form
    //     if (this._handleSubmit != null) return this._handleSubmit
    //     return this._handleSubmit = this.props.handleSubmit(this.submit.bind(this))
    //   },
    // })

    // Define instance method
    // @Note: functions should have consistent pattern of receiving important arguments first,
    // followed by optional arguments.
    // Positional arguments was chosen instead of keyword arguments because
    // it provides more flexibility and separation of concerns between different configs.
    Class.prototype.setStates = function (value, keyPath) {
      return this.setState(set(this.state, keyPath, value))
    }

    // Define instance method
    Class.prototype.resetForm = function () {
      this.form.reset()
    }

    // Define instance method
    Class.prototype.popupAlert = function (content, title) {
      return popupAlert(title, <Json data={content}/>)
    }

    Class.prototype.componentWillUnmount = function (nextProps, nextState) {
      const {parent, form, index} = this.props
      if (parent && index != null) parent.unregisterDataKind(this, form.kind, index)
      if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillMount = function (nextProps, nextState) {
      // Wrap form.submit with HOC to extract nested form values before submission
      this.submit = (...args) => {
        const {dataKind} = this.formValues
        for (const kind in dataKind) {
          dataKind[kind] = this.getDataKind(kind).map((v, index) => isEmpty(v) ? dataKind[kind][index] : v)
        }
        return this.form.submit(...args)
      }

      const {parent, form, index} = this.props
      if (parent && index != null) parent.registerDataKind(this, form.kind, index)
      if (UNSAFE_componentWillMount) UNSAFE_componentWillMount.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillUpdate = function (nextProps, nextState) {
      if (this.state !== nextState) this.meta = null // update changes by UI interactions (i.e. Dropdown onChange)
      if (UNSAFE_componentWillUpdate) UNSAFE_componentWillUpdate.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillReceiveProps = function (next, _) {
      const {data, meta} = this.props
      if (next.data != null && next.data !== data) this.dataUpdate(next.data) // external API changes
      if (next.meta != null && next.meta !== meta) this.metaUpdate(next.meta) // external API changes
      if (UNSAFE_componentWillReceiveProps) UNSAFE_componentWillReceiveProps.apply(this, arguments)
    }

    return withForm(formConfig)(Class)
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function delayed (func, delay = 2000) {
  return async (...args) => {
    await sleep(delay)
    return func(...args)
  }
}

const dataActionWarning = (e) => warn('Missing parent UI Render instance to modify form values!', e)
