import PropTypes from 'prop-types'
import React, { Fragment, PureComponent } from 'react'
import Text from 'react-ui-pack/Text'
import { isList } from 'utils-pack'
import Fields from './Fields'
import { SliderLabeled } from './renderers'

/**
 * Slider Fields with Levels, with dropdown search input to add and remove fields (ex. Languages)
 */
export default class FieldsWithLevel extends PureComponent {
  static propTypes = {
    kind: PropTypes.string.isRequired, // type of definition to use - TYPE.key enum ['lang', 'phone', etc.]
    level: PropTypes.object.isRequired, // Definition of Level by _ (ex. DEFINITION_BY_VAL.LANGUAGE_LEVEL)
    options: PropTypes.arrayOf(PropTypes.shape({ // Dropdown options (ex. OPTIONS.LANGUAGE.items)
      text: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })).isRequired,
    name: PropTypes.string, // input name prefix for redux form (ex. `lang.`), defaults to given `kind`
    renderField: PropTypes.func, // function to render each Slider field
    min: PropTypes.number.isRequired, // Slider's minimum value
    max: PropTypes.number.isRequired, // Slider's maximum value
    unit: PropTypes.string, // value unit
    // ...other props to pass to <Slider/> component
  }

  static defaultProps = {
    renderField: SliderLabeled,
    dispatchChangeOnMount: true, // for SliderField to set value initially when added
  }

  // RENDERS -------------------------------------------------------------------
  renderSlider = (field, i, onRemove) => {
    const {lang, kind, name, level, options, renderField, min = 1, max = 5, unit, ...props} = this.props
    const {value, text} = field
    const id = name ? `${name}.${value}` : `${kind}.${value}`
    // Prepare props for <SliderLabeled> or <SliderTooltip> component
    return renderField({
      name: id,
      id: value,
      label: text,
      onRemove,
      min,
      max,
      unit,
      // Label layout
      render: (value) => isList(value)
        ? (
          <>
            {(level[value[0]] || {}).name}
            <Text className="fade margin-h-smaller">-</Text>
            {(level[value[1]] || {}).name} {unit}
          </>
        )
        : (
          <>
            {(level[value] || {}).name} {unit}
          </>
        ),
      // Tooltip layout
      tooltipProps: {
        render: (value) => <Fragment>{level[value]} {unit}</Fragment>
      },
      ...props
    })
  }

  render () {
    const {level: _, ...props} = this.props
    return <Fields {...props} renderField={this.renderSlider}/>
  }
}
