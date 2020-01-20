import React, { Fragment } from 'react'
import { isList } from '../../../common/utils'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import Row from '../../../components/Row'
import Slider from '../../../components/Slider'
import Text from '../../../components/Text'
import Tooltip from '../../../components/Tooltip'
import View from '../../../components/View'
import { SliderField } from '../inputs'

/**
 * FORM FIELD RENDERERS ========================================================
 * =============================================================================
 */

/**
 * Render a Single or Range Slider Horizontally with Label
 *
 * @param {String} name - input name
 * @param {String} [id] - slider ID, defaults to `name`
 * @param {String} [label] - slider label, defaults to `id`
 * @param {Function} [onRemove] - callback on slider delete
 * @param {String|Node} [tooltip] - to display when hovering over label
 * @param {Object} [tooltipProps] - unused, removing from tooltip layout
 * @param {String} [unit] - slider value unit
 * @param {Function} [render] - function to render value, receives `value` as first argument
 * @param {Boolean} [readOnly] - whether to render slider for viewing only
 * @param {*} [props] - other input props, like `min`, `max`,...
 * @returns {Object} - React Component
 */
export function SliderLabeled ({name, id = name, label = id, onRemove, tooltip, tooltipProps, unit, render, readOnly, ...props}) {
  const Slide = readOnly ? Slider : SliderField
  if (readOnly) props.disabled = true
  return (
    <View key={id} className='app__slider--wrap'>
      <Row className='app__slider__label--wrap bottom fill-width padding-bottom-smaller'>
        <Text className='app__slider__label'>
          {label}
        </Text>
        {onRemove &&
        <Button circle className='app__slider__remove small' onClick={() => onRemove(id)}><Icon
          name='delete'/></Button>
        }
        {tooltip && <Tooltip top>{tooltip}</Tooltip>}
      </Row>
      <Slide
        name={name}
        step={1}
        pushable={1}
        allowCross={false}
        className='margin-bottom-smaller'
        render={(value) => <Text className='app__slider__values'>
          {(render && render(value)) || (isList(value)
              ? (
                <Fragment>
                  {value[0]}
                  <Text className='fade margin-h-smaller'>-</Text>
                  {value[1]}{props.max === value[1] ? '+' : ''} {unit}
                </Fragment>
              )
              : (
                <Fragment>
                  {value}{props.max === value ? '+' : ''} {unit}
                </Fragment>
              )
          )}
        </Text>}
        {...props}
      />
    </View>
  )
}

/**
 * Render a Single or Range Slider Horizontally with Tooltip
 *
 * @param {String} name - input name
 * @param {String} [id] - slider ID, defaults to `name`
 * @param {String} [label] - slider label, defaults to `id`
 * @param {Function} [onRemove] - callback on slider delete
 * @param {*} [render] - unused, only here for convenience when passing props to different type of slider
 * @param {String} [unit] - slider value unit
 * @param {*} [props] - other input props, like `min`, `max`,...
 * @returns {Object} - React Component
 */
export function SliderTooltipField ({name, id = name, label = id, onRemove, render, ...props}) {
  return (
    <View key={id} className='app__slider--wrap'>
      <SliderField
        name={name}
        step={1}
        pushable={1}
        allowCross={false}
        tooltipProps={{}}
        className='margin-top-largest margin-bottom-smaller'
        {...props}
      />
      <View className='position-bottom-right padding-v-small margin-v-smallest'>
        {onRemove &&
        <Button circle className='small transparent margin-h-small'
                onClick={() => onRemove(id)}><Icon name='delete'/></Button>}
      </View>
      <Text className='app__slider__label'>{label}</Text>
    </View>
  )
}

/* Vertical Slider with Tooltip */
export function SliderVerticalSizeField ({name, id = name, label = id, onRemove, ...props}) {
  return (
    <View className='app__filters__size'>
      <Text className='app__slider__label'>{label}</Text>
      <SliderField
        vertical
        name={name}
        step={1}
        pushable={1}
        allowCross={false}
        tooltipProps={{}}
        unit=' cm'
        {...props}
      />
    </View>
  )
}
