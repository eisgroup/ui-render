import { asField } from 'ui-modules-pack/form'
import { Dropdown } from 'ui-react-pack/Dropdown'

/**
 * Dropdown Field connected with react-final-form
 */
export default asField(Dropdown, {
  sanitize: (value, { multiple }) => {
    return value === '' ? (multiple ? [] : '') : value
  }})
