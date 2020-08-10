import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { cleanList, FORMAT_DATE, isEqual } from 'utils-pack'
import { formatTime, timestampFromDate } from 'utils-pack/time'
import Input from '../Input'
import { date } from './normalizers'
import { dateMonthYear } from './validationRules'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Date Input that takes Timestamp as value, and formats it as date string for humans (ex. dd.mm.yyyy)
 * -----------------------------------------------------------------------------
 */
export default class DateInput extends PureComponent {
  static propTypes = {
    value: PropTypes.number, // Timestamp
    onChange: PropTypes.func, // callback when input changes
  }

  static defaultProps = {
    normalize: date,
    validate: [dateMonthYear],
    format: FORMAT_DATE,
    placeholder: FORMAT_DATE,
  }

  state = {
    value: this.props.value, // used to detect changes in `this.props.value`
    date: this.props.value ? formatTime(this.props.value, this.props.format) : '', // example: '22.02.2020'
    errors: [],
    touched: false,
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (next.value && !isEqual(next.value, this.state.value)) {
      return {value: next.value, date: formatTime(next.value, next.format)}
    }
    return null
  }

  handleChange = (val) => {
    const {normalize, validate, onChange} = this.props
    const date = normalize(val)
    const errors = cleanList(validate.map(v => v(date)))
    const value = errors.length ? null : timestampFromDate(date)
    this.setState({value, date, errors})
    onChange && onChange(value)
  }

  render () {
    const {className, style, normalize: _, validate: __, format: ___, error, touched, ...props} = this.props
    const {date, errors} = this.state
    return (
      <Input
        {...props}
        className={className}
        style={style}
        value={date}
        error={touched && (error || errors.join(', '))}
        onChange={this.handleChange}
      />
    )
  }
}
