import { fetch } from 'modules-pack/api'
import { withForm } from 'modules-pack/form'
import { popupAlert } from 'modules-pack/popup'
import { FIELD } from 'modules-pack/variables'
import React, { Component } from 'react'
import { type } from 'react-ui-pack'
import Json from 'react-ui-pack/JsonView'
import ScrollView from 'react-ui-pack/ScrollView'
import { Active, get, isEmpty, isList, isString, logRender, sanitizeResponse, warn, } from 'utils-pack'
import { cloneDeep, hasObjectValue, isObject, set } from 'utils-pack/object'
import Render, { metaToProps } from '../../ui-render'
import './mapper' // Set up UI Renderer components and methods

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

FIELD.ACTION = {
  ADD_DATA: 'addData',
  POPUP_DELAY: 'popupDelay',
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
    form: type.Object,
  }

  state = {
    data: {
      json: this.props.data
    },
    meta: {
      json: this.props.meta
    }
  }

  UNSAFE_componentWillReceiveProps (next, nextContext) {
    const {data, meta} = this.props
    const update = {}
    if (next.data !== data) set(update, 'data.json', next.data)
    if (next.meta !== meta) set(update, 'meta.json', next.meta)
    if (hasObjectValue(update)) this.setState(update)
  }

  render () {
    const {childBefore, childAfter, form} = this.props
    const content = this.hasData && this.hasMeta && <Render data={this.data} {...this.meta} form={this.form}/>
    return (
      <ScrollView fill className="ui__render fade-in bg-neutral">
        {childBefore}
        {form ? <form onSubmit={this.handleSubmit} {...form}>{content}</form> : content}
        {childAfter}
      </ScrollView>
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
    const val = meta[key]
    if (isList(val) || (isObject(val) && val.view)) {
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
    const UNSAFE_componentWillUpdate = Class.prototype.UNSAFE_componentWillUpdate
    const UNSAFE_componentWillReceiveProps = Class.prototype.UNSAFE_componentWillReceiveProps

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
        FIELD.FUNC[FIELD.ACTION.ADD_DATA] = (e) => warn(e.target)
        FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm.bind(this)
        FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates.bind(this)
        FIELD.FUNC[FIELD.ACTION.FETCH] = fetch
        FIELD.FUNC[FIELD.ACTION.POPUP] = this.popupAlert
        FIELD.FUNC[FIELD.ACTION.POPUP_DELAY] = delayed(this.popupAlert)
        return {
          data,
          instance: this,
          funcConfig: {
            data,
            fieldValidation: FIELD.VALIDATION,
            fieldNormalizer: FIELD.NORMALIZER,
            fieldFunc: {...FIELD.FUNC}, // bind definition to this instance
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
    // todo - remove - not used because auto-submit would open too many popups
    Class.prototype.submit = function (values) {
      return popupAlert('Submitted Form with these values', <Json data={values}/>)
    }

    // Define instance method
    Class.prototype.popupAlert = function (content, title) {
      return popupAlert(title, <Json data={content}/>)
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
