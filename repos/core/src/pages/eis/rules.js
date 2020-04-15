import React from 'react'
import { ALERT, stateAction } from '../../common/actions'
import fetch from '../../common/fetch'
import { cloneDeep, get, isCollection, isEmpty, isObject, isString, sanitizeGqlResponse, set } from '../../common/utils'
import { FIELD } from '../../common/variables'
import Json from '../../components/Json'
import { metaToProps } from '../../components/views/Render'
import { POPUP } from '../../modules/exports'
import { reset } from '../../modules/form'
import { withForm } from '../../modules/form/utils'

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

/**
 * Transform *_meta.json API response into custom rules applied by the team
 */
export function transformConfig (meta) {
  return toOpenLConfig(sanitizeGqlResponse(meta, {tags: []}))
}

export function toOpenLConfig (meta) {
  if (isObject(meta)) {

    // Apply default Dropdown config if onChange is not defined
    if (meta.view === FIELD.TYPE.DROPDOWN && meta.name != null && meta.onChange == null) {
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
    else if (meta.view === FIELD.TYPE.TABLE && meta.renderItem != null) {
      const firstHeader = get(meta.headers, '[0]')
      if (isObject(firstHeader) && firstHeader.renderCell == null) {
        firstHeader.renderCell = {
          view: FIELD.TYPE.EXPAND,
          name: '{value}',
          id: firstHeader.id,
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

    // Convert `format` attribute to `normalize`
    else if (key === 'format') {
      meta.normalize = val
      delete meta[key]
    }

    // Convert `styles` attribute to `className`
    else if (key === 'styles') {
      meta.className = val
      delete meta[key]
    }
  }

  return meta
}

/**
 * React Class Decorator to setup UI with necessary variables and function definitions
 * @usage:
 *    - this.data -> *_data.json from state, ready for <Render> component consumption
 *    - this.meta -> transformed *_meta.json data from state, ready for <Render> component consumption
 *    - this.handleSubmit -> to be used like this <form onSubmit={this.handleSubmit}>
 *    - this.hasData and this.hasMeta getters can be used for conditional check
 *    - Initialize with data by overriding initial state
 */
export function withUISetup ({form, ...options}) {
  return function Decorator (Class) {
    const UNSAFE_componentWillMount = Class.prototype.UNSAFE_componentWillMount
    const UNSAFE_componentWillUpdate = Class.prototype.UNSAFE_componentWillUpdate

    Class.prototype.state = {
      data: {
        json: undefined, // data object
        name: undefined, // file name
        ...(Class.prototype.props || {}).data,
      },
      meta: {
        json: undefined, // data object
        name: undefined, // file name
        ...(Class.prototype.props || {}).meta,
      },
      ...Class.prototype.state
    }

    // Define instance getter
    Object.defineProperty(Class.prototype, 'data', {
      get () {
        return this.state.data.json
      },
      set (value) {
        return this.setState(set(this.state, 'data.json', value))
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'meta', {
      get () {
        if (this._meta != null) return this._meta
        const {data, meta} = this.state
        return this._meta = metaToProps(cloneDeep(meta.json), data.json, this)
      },
      set (value) {
        return this._meta = value
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasData', {
      get () {
        return !isEmpty(this.state.data.json)
      },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasMeta', {
      get () {
        return !isEmpty(this.state.meta.json)
      },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'handleSubmit', {
      get () {
        if (this._handleSubmit != null) return this._handleSubmit
        return this._handleSubmit = this.props.handleSubmit(this.submit.bind(this))
      },
    })

    // Define instance method
    // Update meta.json
    Class.prototype.metaUpdate = function (value) {
      return this.setState(set(this.state, 'meta.json', value))
    }

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
      const {dispatch, form} = this.props
      dispatch(reset(form))
    }

    // Define instance method
    Class.prototype.submit = function (values) {
      return this.props.dispatch(stateAction(POPUP, ALERT, {
        items: [{
          title: 'Submitted Form with these values',
          content: <Json data={values}/>,
        }]
      }))
    }

    Class.prototype.UNSAFE_componentWillMount = function () {
      FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm.bind(this)
      FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates.bind(this)
      FIELD.FUNC[FIELD.ACTION.FETCH] = fetch
      if (UNSAFE_componentWillMount) UNSAFE_componentWillMount.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillUpdate = function (nextProps, nextState) {
      if (this.state !== nextState) this.meta = null
      if (UNSAFE_componentWillUpdate) UNSAFE_componentWillUpdate.apply(this, arguments)
    }

    return withForm({form, enableReinitialize: true, ...options})(Class)
  }
}
