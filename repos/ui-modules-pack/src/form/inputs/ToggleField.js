import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import { Checkbox } from 'ui-react-pack/Checkbox'
import { isRequired } from 'ui-react-pack/inputs/validationRules'
import { Active, isFunction } from 'ui-utils-pack'

if (!Active.Field) Active.Field = Field

/**
 * Toggle Field connected with react-final-form or redux-form
 * @note: do not use `asField` because this component needs all props passed to Field for proper updates.
 * @example:
 *  [FIELD.ID.TOGGLE]: {
 *    name: 'tier',
 *    valueTrue: TIER.PUBLIC._, // optional, defaults to `true`
 *    valueFalse: TIER.PRIVATE._, // optional, defaults to `false`
 *    get labelTrue () {return TIER.PUBLIC.name},
 *    get labelFalse () {return TIER.PRIVATE.name},
 *    get readonly () {return !hasStaffOrHigherAuth(Active.user.role)},
 *    get tooltip () {return _.MESSAGE},
 *    view: FIELD.TYPE.TOGGLE,
 *  }
 */
export default class ToggleField extends PureComponent {
  static propTypes = {
    // @Note: this component should not have parse/format/normalize,
    //        because you can map values explicitly with `valueTrue/False`
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    labelTrue: PropTypes.string,
    labelFalse: PropTypes.string,
    value: PropTypes.bool,
    valueTrue: PropTypes.any,
    valueFalse: PropTypes.any,
    onChange: PropTypes.func,
    id: PropTypes.string,
    danger: PropTypes.bool,
    // @Note: see <Checkbox> component for docs
  }
  input = ({input}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, label, name, instance, ...props} = this.props
    return (
      <Checkbox
        type='toggle'
        label={label || name}
        value={input.value}
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(value, { name })
        }}
        {...props} // allow forceful value override
      />
    )
  }

  // Rerender Field for all prop changes to update 'labelTrue/False'
  render = () => {
    // do not pass 'onChange' to Field because it fires event as argument
    const {onChange: _, instance, ...props} = this.props
    return <Active.Field {...props} component={this.input}/>
  }
}
