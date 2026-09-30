import PropTypes from 'prop-types'
import React, { createContext, memo, useContext } from 'react'
import { Field } from 'react-final-form'
import { Checkbox } from '../../../components/Checkbox'
import { isRequired } from '../../../components/inputs/validationRules'
import { Active, isFunction } from '../../../utils'
import type { Translate } from '../../../utils/_envs'

/**
 * `Active.Field` is an `unknown` slot of the runtime registry, so it is re-typed below as an open prop
 * bag, the permissiveness its `.js` call sites already have.
 */
type UnconvertedComponent = React.ComponentType<Record<string, unknown>>

export type ToggleFieldProps = {
  // @Note: this component should not have parse/format/normalize,
  //        because you can map values explicitly with `valueTrue/False`
  name: string
  label?: string
  labelTrue?: string
  labelFalse?: string
  /** Overrides the field's own value when given */
  value?: boolean
  valueTrue?: unknown
  valueFalse?: unknown
  /** Called with the new value and `{name}`, after the form input */
  onChange?: (value: unknown, details: { name: string }) => void
  id?: string
  danger?: boolean
  translate?: Translate
  readonly?: boolean
  /** The engine's instance: read here, never handed to Field */
  instance?: unknown
  /** Everything else reaches Field and the Checkbox, as in JavaScript */
  [prop: string]: unknown
}

/** The part of react-final-form's field render props this component reads. */
type FieldRenderProps = { input: { value: unknown, onChange: (value: unknown) => void } }

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
const ToggleProps = createContext<ToggleFieldProps | null>(null)

function ToggleFieldInput ({ input }: FieldRenderProps) {
  // Always provided: ToggleField renders the Provider around the only Field that renders this.
  const toggle = useContext(ToggleProps) as ToggleFieldProps
  if (toggle.readonly && isRequired(input.value)) return null
  const {onChange, label, name, instance, translate = Active.translate, ...props} = toggle
  return (
    <Checkbox
      type='toggle'
      label={translate(label) || name}
      value={input.value}
      onChange={(value: unknown) => {
        input.onChange(value)
        isFunction(onChange) && onChange(value, { name })
      }}
      translate={translate}
      {...props} // allow forceful value override
    />
  )
}

// Rerender Field for all prop changes to update 'labelTrue/False'
function ToggleField (props: ToggleFieldProps) {
  // do not pass 'onChange' to Field because it fires event as argument
  const {onChange: _, instance, ...fieldProps} = props
  // Read at render, as `<Active.Field>` was: a test, or a host, may swap the registered Field.
  const Field = Active.Field as UnconvertedComponent
  return (
    <ToggleProps.Provider value={props}>
      <Field {...fieldProps} component={ToggleFieldInput}/>
    </ToggleProps.Provider>
  )
}

ToggleField.propTypes = {
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

// `memo` skips a render with shallow-equal props, as `PureComponent` did.
export default memo(ToggleField)
