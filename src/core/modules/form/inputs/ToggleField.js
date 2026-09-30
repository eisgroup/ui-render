import PropTypes from 'prop-types'
import React, { createContext, memo, useContext } from 'react'
import { Field } from 'react-final-form'
import { Checkbox } from '../../../components/Checkbox'
import { isRequired } from '../../../components/inputs/validationRules'
import { Active, isFunction } from '../../../utils'

if (!Active.Field) Active.Field = Field

/**
 * Toggle Field connected with react-final-form
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
// The class handed Field `this.input`: one function per instance, so Field's component type never changed,
// that read the LATEST `this.props` -- all of them, including `onChange` and `instance`, which Field itself is
// not given, and `value`, which overrides the field's own. One module-level component keeps the type stable,
// and a context hands it those props without passing them through Field.
const ToggleProps = createContext(null)

function ToggleFieldInput ({ input }) {
  const toggle = useContext(ToggleProps)
  if (toggle.readonly && isRequired(input.value)) return null
  const {onChange, label, name, instance, translate = Active.translate, ...props} = toggle
  return (
    <Checkbox
      type='toggle'
      label={translate(label) || name}
      value={input.value}
      onChange={value => {
        input.onChange(value)
        isFunction(onChange) && onChange(value, { name })
      }}
      translate={translate}
      {...props} // allow forceful value override
    />
  )
}

// Rerender Field for all prop changes to update 'labelTrue/False'
function ToggleField (props) {
  // do not pass 'onChange' to Field because it fires event as argument
  const {onChange: _, instance, ...fieldProps} = props
  return (
    <ToggleProps.Provider value={props}>
      <Active.Field {...fieldProps} component={ToggleFieldInput}/>
    </ToggleProps.Provider>
  )
}

// `memo` skips a render with shallow-equal props, as `PureComponent` did.
const MemoToggleField = memo(ToggleField)

MemoToggleField.propTypes = {
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
  translate: PropTypes.func,
  // @Note: see <Checkbox> component for docs
}

export default MemoToggleField
