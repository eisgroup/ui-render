import { renderField } from 'modules-pack/form/renders'
import AutoSave from 'modules-pack/form/views/AutoSave'
import { NAME as POPUP, popupAlert } from 'modules-pack/popup'
import { stateAction } from 'modules-pack/redux'
import { FIELD } from 'modules-pack/variables'
import React from 'react'
import { cn } from 'react-ui-pack'
import Button from 'react-ui-pack/Button'
import PieChart from 'react-ui-pack/charts/PieChart'
import { Checkbox } from 'react-ui-pack/Checkbox'
import Counter from 'react-ui-pack/Counter'
import Dropdown from 'react-ui-pack/Dropdown'
import Expand from 'react-ui-pack/Expand'
import ExpandList from 'react-ui-pack/ExpandList'
import { OK } from 'react-ui-pack/inputs/validationRules'
import Json from 'react-ui-pack/JsonView'
import Label from 'react-ui-pack/Label'
import List from 'react-ui-pack/List'
import ProgressSteps from 'react-ui-pack/ProgressSteps'
import { renderFloat } from 'react-ui-pack/renders'
import Row from 'react-ui-pack/Row'
import Space from 'react-ui-pack/Space'
import TableView from 'react-ui-pack/TableView'
import TabList from 'react-ui-pack/TabList'
import Tabs from 'react-ui-pack/Tabs'
import Text from 'react-ui-pack/Text'
import TooltipPop from 'react-ui-pack/TooltipPop'
import View from 'react-ui-pack/View'
import Render, { mapProps } from 'ui-renderer'
import {
  Active,
  ALERT,
  debounce,
  get,
  hasObjectValue,
  isEqual,
  isList,
  isNumeric,
  isObject,
  isString,
  isTruthy,
  TIME_DURATION_INSTANT,
  toFlatList,
  toJSON
} from 'utils-pack'
import { _ } from 'utils-pack/translations'

/**
 * UI RENDERER COMPONENTS SETUP ================================================
 * Map Component props and Methods for recursive rendering
 * =============================================================================
 */

FIELD.TYPE = {
  AUTO_SUBMIT: 'AutoSubmit',
}

Render.Tooltip = TooltipPop

/**
 * Map UI Render props to final Rendering Component/s
 *
 * @param {String} view - component type (one of FIELD.TYPE values)
 * @param {Array} items - nested child component props
 * @param {Object|Array} data - global data object to be passed down to child components
 * @param {*} _data - local data object to be consumed by the component for rendering
 * @param {Boolean} debug - whether to use debug mode
 * @param {Boolean} relativeData - whether to retrieve values from local `_data`, defaults to global `data`
 * @param {Number|String} relativeIndex - used when component is rendered in array
 * @param {String} relativePath - path used to compute form input "name" attribute
 * @param {Object} form - react-final-form FormApi instance
 * @param {String|Object} [showIf] - whether to not render the component if it evaluates to truthy value
 * @param {Boolean} [hideOnEmpty] - whether to not render the component if it's value is null/undefined/empty string
 * @param {Function} [Render] - the recursive renderer
 * @param {String} [version] - of the config
 * @param {*} [props] - other component props
 * @returns {JSX.Element|*} React component
 */
Render.Component = function RenderComponent ({
  view, items, data, _data, debug, form, hideOnEmpty, showIf,
  relativeData, relativeIndex, relativePath, version,
  ...props
}) {
  /* todo: deprecated in v0.24.0 General hideOnEmpty logic */
  if (hideOnEmpty && !isTruthy(_data)) return null
  /* General showIf logic */
  if (showIf != null) {
    // UI Render should not 'Value Transform' `showIf` attribute
    if (isString(showIf)) {
      const __data = get((relativeData !== false && _data) || data, showIf)
      if (!isTruthy(__data)) return null
    } else if (hasObjectValue(showIf)) {
      const {name, relativeData, equal} = showIf
      const __data = (relativeData !== false && !name && _data) || get((relativeData !== false && _data) || data, name)
      if (equal !== undefined) {
        if (!isEqual(__data, equal)) return null
      } else {
        if (!isTruthy(__data)) return null
      }
    } else if (isObject(showIf)) {
      if (!isTruthy(_data)) return null
    }
  }

  switch (view) {
    case FIELD.TYPE.COL:
    case FIELD.TYPE.COL2:
    case FIELD.TYPE.COL3: {
      return <View {...props}>{items.map(Render)}</View>
    }

    case FIELD.TYPE.ROW:
    case FIELD.TYPE.ROW2: {
      return <Row {...props}>{items.map(Render)}</Row>
    }

    case FIELD.TYPE.LIST:
    case FIELD.TYPE.COL_LIST:
    case FIELD.TYPE.COL_LIST3: {
      return <List items={_data} {...props}/>
    }

    case FIELD.TYPE.ROW_LIST:
    case FIELD.TYPE.ROW_LIST2: {
      return <List items={_data} {...props} row/>
    }

    case FIELD.TYPE.AUTO_SUBMIT: {
      return <AutoSave {...props}/>
    }

    case FIELD.TYPE.CHECKBOX: {
      return <Checkbox {...props}/>
    }

    case FIELD.TYPE.EXPAND: {
      if (props.label != null && props.title == null) {
        props.title = props.label
        delete props.label
      }
      if (props.name != null && props.title == null) props.title = props.name
      if (items.length) props.children = () => items.map(Render)
      return <Expand {...props}/>
    }

    case FIELD.TYPE.EXPAND_LIST: {
      return <ExpandList items={_data} {...props}/>
    }

    case FIELD.TYPE.BUTTON: {
      if (items.length) props.children = items.map(Render)
      if (props.label != null && props.children == null) {
        props.children = props.label
        delete props.label
      }
      return <Button {...props}/>
    }

    case FIELD.TYPE.COUNTER: {
      return <Counter {...props}/>
    }

    case FIELD.TYPE.LABEL: {
      if (items.length) props.children = items.map(Render)
      if (hideOnEmpty && (props.children == null || props.children === '')) return null
      return <Label {...props}/>
    }

    case FIELD.TYPE.PIE_CHART: {
      const {mapItems, ...prop} = props
      if (mapItems) _data = mapProps(_data, mapItems, {debug})
      if (items.length) prop.children = items.map(Render)
      if (hideOnEmpty && !isTruthy(_data)) return null
      return <PieChart items={_data} {...prop}/>
    }

    case FIELD.TYPE.PROGRESS_STEPS: {
      const steps = items.map(({step, label, content, data, _data, ...info}, i) => {
        return {
          ...info,
          step: isObject(step) ? Render.call(this, {data, _data, debug, form, ...step}, i) : step,
          label: isObject(label) ? Render.call(this, {data, _data, debug, form, ...label}, i) : label,
          content: isObject(content) ? Render.bind(this, {data, _data, debug, form, ...content}, i) : content
        }
      })
      return <ProgressSteps items={steps} {...props}/>
    }

    case FIELD.TYPE.SPACE: {
      return <Space {...props}/>
    }

    case FIELD.TYPE.TABLE: {
      const {extraItems, filterItems, parentItem, group, ...table} = props
      if (!isList(_data)) _data = []

      // Matrix table headers and data transform
      if (group) {
        // `header` must exist as a single object, otherwise there is no way to group tables
        let {by: {id, label, renderLabel, ...groupByProps} = {}, header, extraHeader = {label: ''}} = group
        const errorTitle = `Incorrect config for ${view} with {name: "${props.name}"}!`
        if (id == null) popupAlert(errorTitle, `${view}.group.by must have 'id', got '${toJSON(group.by, null, 2)}'`)
        if (!header || header.id == null) {
          popupAlert(errorTitle, `${view}.group.header must have 'id', got '${toJSON(header, null, 2)}'`)
          header = {} // prevent breaking code
        }

        // First, check data to determine headers
        const groupsByValue = {}
        const rowsByCommonValue = {}
        for (const row of _data) {
          const {[id]: groupId, [header.id]: commonValue} = row
          if (groupId != null) groupsByValue[groupId] = groupId
          if (commonValue != null) rowsByCommonValue[commonValue] = [...(rowsByCommonValue[commonValue] || []), row]
        }
        const groupIds = Object.values(groupsByValue)
        if (groupIds.length) {

          // Transform headers
          const _headers = (props.headers || [])
          const newHeaders = toFlatList(groupIds.map(_id => _headers.map(({id, ...h}) => ({id: `${id}_${_id}`, ...h}))))
          table.headers = [header].concat(newHeaders)

          // Label grouped tables
          if (label != null && !hasObjectValue(label)) popupAlert(errorTitle,
            `${view}.group.by.label must resolve to object of labels by ${id} 'value', got '${toJSON(label, null, 2)}'`)
          const groupHeaders = groupIds.map(id => ({
            colSpan: _headers.length,
            label: label ? (renderLabel ? renderLabel(label[id]) : label[id]) : id,
            ...groupByProps,
          }))
          const newExtraHeaders = [
            [extraHeader].concat(groupHeaders)
          ]
          table.extraHeaders = (props.extraHeaders || []).concat(newExtraHeaders)

          // Transform data by grouping them with `commonValue`
          _data = Object.values(rowsByCommonValue).map(rows => {
            const item = {}
            rows.forEach(row => {
              const {[id]: groupId, [header.id]: commonValue, ..._item} = row
              item[header.id] = commonValue
              for (const key in _item) {
                item[`${key}_${groupId}`] = _item[key]
              }
            })
            return item
          })
        }
      }

      // Mixed array nested table data filtering
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

      // Table with custom rows
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
      if (hideOnEmpty && !isTruthy(_data)) return null
      return <TableView items={_data} {...table}/>
    }

    case FIELD.TYPE.TABS: {
      const tabs = items.map(({tab, _data, data}, i) => isObject(tab) ? Render.call(this, {
        data, _data, debug, form, ...tab
      }, i) : tab)
      const panels = items.map(({content, _data, data}, i) => isObject(content)
        ? Render.bind(this, {data, _data, debug, form, ...content}, i)
        : content
      )
      return <Tabs tabs={tabs} panels={panels} {...props}/>
    }

    case FIELD.TYPE.TAB_LIST: {
      return <TabList items={_data} {...props}/>
    }

    case FIELD.TYPE.TEXT:
    case FIELD.TYPE.TITLE: {
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
      if (hideOnEmpty && (props.children == null || props.children === '')) return null
      return <Text {...props}/>
    }

    case FIELD.TYPE.TOOLTIP: {
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
    }

    default: {
      const {mapOptions, removable, autoSubmit, ...input} = props
      const {readonly, disabled} = data || {}
      if (mapOptions) input.options = mapProps(input.options || [], mapOptions, {debug})
      if (relativeData !== false && relativePath != null && input.name) {
        input.name = `${relativePath}${relativeIndex != null ? `[${relativeIndex}]` : ''}.${input.name}`
      }
      // Render Dropdown separately, to avoid triggering form value changes
      if (view === FIELD.TYPE.DROPDOWN) {
        // proxy onChange to prevent event sent as second argument
        const {onChange, ...dropdown} = input
        return <Dropdown lazyLoad={false} onChange={onChange ? (value => onChange(value)) : undefined} {...dropdown}/>
      }

      // Form value changing fields should have 'Input' as view
      if (view === FIELD.TYPE.INPUT) {
        // eslint-disable-next-line default-case
        switch (input.type) {
          case 'select':
            view = FIELD.TYPE.SELECT
            break
          case 'slider':
            view = FIELD.TYPE.SLIDER
            break
          case 'toggle':
            view = FIELD.TYPE.TOGGLE
            break
        }
      }

      // Auto submit on changes
      if (autoSubmit) {
        const {onChange} = input
        const submit = debounce(form.submit, autoSubmit.delay >= 0 ? autoSubmit.delay : TIME_DURATION_INSTANT)
        input.onChange = (value) => {
          onChange && onChange(value)
          submit()
        }
      }

      // Input clearing
      if (removable) {
        const {onRemove} = input
        input.onRemove = (name) => {
          form.change(name, null)
          onRemove && onRemove(name)
          autoSubmit && input.onChange(null)
        }
      }

      // Validate type="number" with min/max
      if (input.type === 'number') {
        const {validate, min, max} = input
        if (min != null || max != null) input.validate = (value) => {
          if (min != null && value < min) return `Must be minimum ${min}`
          if (max != null && value > max) return `Must be maximum ${max}`
          return (validate && validate(value)) || OK
        }
      }

      return renderField({view, ...input, ...readonly && {readonly}, ...disabled && {disabled}})
    }
  }
}

/**
 * Render Value Function Getter
 *
 * @param {String} Name - one of FIELD.TYPE definitions
 * @returns {Function} renderer - that takes value as the first argument, and renders value in desired format
 */
Render.Method = function RenderMethod (Name) {
  switch (Name) {
    case FIELD.RENDER.CURRENCY:
      return (val, index, {id, decimals = 2, symbol = '$', className, style, ...props} = {}) => (isNumeric(val)
          ? <Row className={className} style={style}>
            <Text className="margin-right-smallest">{symbol}</Text>
            {renderFloat(val, decimals, props)}
          </Row>
          : null
      )
    case FIELD.RENDER.DOUBLE5:
      return (val, index, {id, decimals, ...props} = {}) => isNumeric(val) ? renderFloat(val, 5, props) : null
    case FIELD.RENDER.FLOAT:
      return (val, index, {id, decimals, ...props} = {}) => isNumeric(val) ? renderFloat(val, decimals, props) : null
    case FIELD.RENDER.PERCENT:
      return (val, index, {id, decimals, className, style, ...props} = {}) => (isNumeric(val)
          ? <Row className={className} style={style}>
            {renderFloat(Number(val) * 100, decimals, props)}
            <Text className="margin-left-smallest">%</Text>
          </Row>
          : null
      )
    case FIELD.RENDER.TITLE_n_INPUT:
      return (val, index, {id, ...props} = {}) => <Row {...props}><Text>{val}</Text></Row>
    default:
      return (val) => <Text>{val}</Text>
  }
}

/**
 * Error handling when something breaks because of mis-configured meta.json
 */
Render.onError = ({err, errInfo, props}) => Active.store.dispatch(stateAction(POPUP, ALERT, {
  items: [
    {
      title: `${Render.name} Error!`,
      content: <View>
        <Text className="h5">{_.ERROR_MESSAGE}</Text>
        <Text className="p">{String(err)}</Text>
        <Text className="h5 padding-top">{_.DATA_CAUSING_ERROR}</Text>
        <View style={{textAlign: 'left'}}>
          <Json data={props}/>
        </View>
        <Text className="h5 padding-top">{_.ERROR_INFO}</Text>
        <View style={{textAlign: 'left'}}>
          <Json data={errInfo}/>
        </View>
      </View>
    }
  ]
}))
