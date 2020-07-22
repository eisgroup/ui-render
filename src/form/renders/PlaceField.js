import { NAME as POPUP } from 'modules-pack/popup'
import { connect, stateAction } from 'modules-pack/redux'
import React, { Component } from 'react'
import Place from 'react-ui-pack/inputs/Place'
import { isRequired } from 'react-ui-pack/inputs/validationRules'
import { Field } from 'redux-form'
import { ALERT, isFunction } from 'utils-pack'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapDispatchToProps = (dispatch) => ({
  actions: {
    popupAlert: (message) => dispatch(stateAction(POPUP, ALERT, {
      items: [{
        title: 'An Error Has Occurred!',
        content: message,
        closeLabel: 'Ok'  // optional
      }]
    })),
  }
})
// @withGql({
//   query: {
//     query, variables: {
//       apiKey: {
//         api: API_PLACES,
//         provider: API_PROVIDER_GOOGLE,
//         platform: API_PLATFORM_WEB,
//       }
//     }
//   }
// })
const PlaceContainer = connect(null, mapDispatchToProps)(Place)
export default class PlaceField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, error: errorMessage, ...props} = this.props
    return (
      <PlaceContainer
        {...input}
        value={input.value ? input.value : undefined}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(value)
        }}
        error={touched && error && (errorMessage || error)}
        {...props}
      />
    )
  }

  render () {
    const {name, disabled, validate} = this.props
    return <Field {...{name, disabled, validate}} component={this.input}/>
  }
}
