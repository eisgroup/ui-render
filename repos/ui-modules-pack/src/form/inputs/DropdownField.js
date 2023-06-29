import { asField } from 'ui-modules-pack/form'
import React from 'react'
import { Dropdown } from 'ui-react-pack/Dropdown'

/**
 * Dropdown Field connected with react-final-form or redux-form
 */
export default asField(Dropdown, {
  sanitize: (value, { multiple }) => {
    return value === '' ? (multiple ? [] : '') : value
  }})
