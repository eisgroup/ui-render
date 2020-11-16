import { renderField } from 'modules-pack/form/renders'
import AutoSave from 'modules-pack/form/views/AutoSave'
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
import Label from 'react-ui-pack/Label'
import List from 'react-ui-pack/List'
import ProgressSteps from 'react-ui-pack/ProgressSteps'
import Row from 'react-ui-pack/Row'
import Space from 'react-ui-pack/Space'
import TableView from 'react-ui-pack/TableView'
import TabList from 'react-ui-pack/TabList'
import Tabs from 'react-ui-pack/Tabs'
import Text from 'react-ui-pack/Text'
import TooltipPop from 'react-ui-pack/TooltipPop'
import View from 'react-ui-pack/View'
import { Active, get, isList, isObject, toList } from 'utils-pack'

/**
 * UI RENDERER COMPONENTS SETUP ================================================
 * Map Component props for recursive rendering
 * =============================================================================
 */

FIELD.TYPE = {
  AUTOSAVE: 'AutoSave',
}

/**
 * Map UI Renderer props to final Rendering Component/s
 *
 * @param {String} view - component type (one of FIELD.TYPE values)
 * @param {Array} items - nested child component props
 * @param {Object|Array} data - global data object to be passed down to child components
 * @param {*} _data - local data object to be consumed by the component for rendering
 * @param {Boolean} debug - whether to use debug mode
 * @param {Boolean} relativeData - whether to retrieve values from local `_data`, defaults to global `data`
 * @param {Number|String} relativeIndex - used when component is rendered in array
 * @param {String} relativePath - path used to compute form input "name" attribute
 * @param {Form|Object} form - react-final-form
 * @param {Function} [Render] - the recursive renderer
 * @param {*} [props] - other component props
 * @returns {JSX.Element|*} React component
 */
export default function RenderComponent ({
  view, items, data, _data, debug, form,
  relativeData, relativeIndex, relativePath,
  Render = Active.Render,
  ...props
}) {
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

    case FIELD.TYPE.AUTOSAVE: {
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
      return <Label {...props}/>
    }

    case FIELD.TYPE.PIE_CHART: {
      const {mapItems, ...prop} = props
      if (mapItems) _data = mapProps(_data, mapItems, {debug})
      if (items.length) prop.children = items.map(Render)
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
      const {extraItems, filterItems, parentItem, hideOnEmpty, ...table} = props
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
      if (hideOnEmpty && !_data.length) return null
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
      return <Tabs items={tabs} panels={panels} {...props}/>
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
      const {mapOptions, removable, ...input} = props
      if (mapOptions) input.options = mapProps(input.options || [], mapOptions, {debug})
      if (relativeData && relativePath != null && input.name) {
        input.name = `${relativePath}${relativeIndex != null ? `[${relativeIndex}]` : ''}.${input.name}`
      }
      // Render Dropdown separately, to avoid triggering form value changes
      if (view === FIELD.TYPE.DROPDOWN) {
        // proxy onChange to prevent event sent as second argument
        const {onChange, ...dropdown} = input
        return <Dropdown onChange={onChange ? (value => onChange(value)) : undefined} {...dropdown}/>
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

      // Input clearing
      if (removable) {
        const {onRemove} = input
        input.onRemove = (name) => {
          form.change(name, null)
          onRemove && onRemove(name)
        }
      }

      return renderField({view, ...input})
    }
  }
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
