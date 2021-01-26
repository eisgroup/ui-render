import { fetch } from 'modules-pack/api'
import { withForm } from 'modules-pack/form'
import { popupAlert } from 'modules-pack/popup'
import { FIELD } from 'modules-pack/variables'
import React from 'react'
import Json from 'react-ui-pack/JsonView'
import { metaToProps } from 'ui-renderer'
import { cloneDeep, get, isCollection, isEmpty, isObject, isString, sanitizeGqlResponse, set } from 'utils-pack'
import './mapper' // Set up UI Renderer components and methods

FIELD.ACTION = {
  POPUP_DELAY: 'popupDelay',
}

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

/**
 * Transform *_meta.json API response into custom rules applied by the team
 */
export function transformConfig (meta) {
  return toOpenLConfig(sanitizeGqlResponse(meta || {}, {tags: []}))
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
    if (isCollection(val)) {
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
 *        1. final-form: to be used like this <form onSubmit={this.props.handleSubmit}>
 *        2. redux-form: to be used like this <form onSubmit={this.handleSubmit}>
 *    - this.hasData and this.hasMeta getters can be used for conditional check
 *    - Initialize with data by overriding initial state
 */
export function withUISetup (formConfig) {
  return function Decorator (Class) {
    const UNSAFE_componentWillMount = Class.prototype.UNSAFE_componentWillMount
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
        const data = this.data
        return this._meta = metaToProps(transformConfig(cloneDeep(get(this.state, 'meta.json'))), {
          data,
          instance: this,
          funcConfig: {
            data,
            fieldValidation: FIELD.VALIDATION,
            fieldNormalizer: FIELD.NORMALIZER,
            fieldFunc: FIELD.FUNC,
          }
        })
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
        return !isEmpty(this.data)
      },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasMeta', {
      get () {
        return !isEmpty(this.meta)
      },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'handleSubmit', {
      get () {
        if (this._handleSubmit != null) return this._handleSubmit
        // For redux-form
        return this._handleSubmit = this.props.handleSubmit(this.submit.bind(this))
      },
    })

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
      this.props.form.reset()
    }

    // Define instance method
    Class.prototype.submit = function (values) {
      return popupAlert('Submitted Form with these values', <Json data={values}/>)
    }

    // Define instance method
    Class.prototype.popupAlert = function (content, title) {
      return popupAlert(title, <Json data={content}/>)
    }

    Class.prototype.UNSAFE_componentWillMount = function () {
      FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm.bind(this)
      FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates.bind(this)
      FIELD.FUNC[FIELD.ACTION.FETCH] = fetch
      FIELD.FUNC[FIELD.ACTION.POPUP] = this.popupAlert
      FIELD.FUNC[FIELD.ACTION.POPUP_DELAY] = delayed(this.popupAlert)
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
