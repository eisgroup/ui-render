import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ONE_DAY } from '../../common/constants'
import { fromTimeRanges, hasListValue, isEmpty, isEqual, removeNilValues, toTimeRange } from '../../common/utils'
import { date, hourMinute } from '../../modules/form/normalizers'
import Button from '../Button'
import Icon from '../Icon'
import Input from '../Input'
import Row from '../Row'
import Tooltip from '../Tooltip'
import View from '../View'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Dynamic list of Date with From and To time fields
 * -----------------------------------------------------------------------------
 */
export default class Dates extends Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.shape({ // TimeRangeInput
      from: PropTypes.number,
      to: PropTypes.number,
    })),
    onChange: PropTypes.func, // callback when input changes, only fires if input is valid
    validate: PropTypes.arrayOf(PropTypes.func), // list of validation functions to run on each time range
    readOnly: PropTypes.bool, // render as view only
  }

  state = {
    // `value` and `dates` must always sync in length to avoid update bugs
    value: hasListValue(this.props.value) ? this.props.value : [{}], // used when `this.props.value` is not controlled
    dates: fromTimeRanges(hasListValue(this.props.value) ? this.props.value : [{}]), // example: [{date: '22.02.2020', from: '19:00', to: '23:00'}]
    errors: {},
  }

  get inputProps () {
    const {
      required, disabled, info, float,
      onBlur, onFocus, onDrop, onDragStart,
    } = this.props
    return {
      required, disabled, info, float,
      onBlur, onFocus, onDrop, onDragStart,
    }
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (next.value && !isEqual(next.value, this.props.value))
      this.setState({...this.syncDatesValue(next.value)})
  }

  handleDeleteDate = (key) => {
    if (this.state.dates.length < 2) return
    const {value: [...value], dates: [...dates]} = this.state
    value.splice(key, 1)
    dates.splice(key, 1)
    this.setState({value, dates})
    this.syncOnChange(value)
  }

  handleAddDate = () => {
    let {value} = this.state
    const from = Math.max(...value.reduce((a, {from}) => a.concat(from), []).filter(v => !!v))
    const to = Math.max(...value.reduce((a, {to}) => a.concat(to), []).filter(v => !!v))
    const newDate = {}
    if (from > -Infinity) newDate.from = from + ONE_DAY
    if (to > -Infinity) newDate.to = to + ONE_DAY
    value = value.concat(newDate)
    this.update(value)
  }

  handleChangeDate = (data, i) => {
    const {value: [...value], dates: [...dates]} = this.state
    const key = data.id || i
    dates[key] = {...dates[key], ...removeNilValues(this.normalizeDate(data))}
    const val = toTimeRange(dates[key])

    // Validate input
    const errors = this.validate(val, key, {...this.state, dates})

    // Only update value when `date` and at least `from` or `to` is completed/deleted (allowing editing between)
    if (!errors[key] && (
      ((val.from || !data.from) && value[key].from !== val.from) ||
      ((val.to || !data.to) && value[key].to !== val.to)
    )) {
      value[key] = val
      return this.update(value, dates[key], key)
    }

    // Else, simply change state for controlled input text to update
    this.setState({dates, errors})
  }

  normalizeDate = (data) => {
    const result = {...data}
    if (result.date) result.date = date(result.date)
    if (result.from) result.from = hourMinute(result.from)
    if (result.to) result.to = hourMinute(result.to)
    return result
  }

  /**
   * Compute Errors for given Date value and string representation objects
   * @returns {Object} errors - new object with errors added/cleared for given `key`
   */
  validate = (value, key, {dates, errors} = this.state) => {
    const {from, to} = value || {}
    errors = {...errors}
    delete errors[key]
    const error = (this.props.validateField || []).map(func => func(value)).filter(v => !!v)[0]
    if (error) errors[key] = {date: error}
    if (to <= from) {
      errors[key] = {...errors[key]}
      if (dates[key].to) errors[key].from = `before ${dates[key].to}`
      if (dates[key].from) errors[key].to = `or after ${dates[key].from}`
    }
    return errors
  }

  update = (value, data, key) => {
    const dates = fromTimeRanges(value)
    if (data && data.date && !data.from && !data.to) dates[key] = data // keep entered `date` for user while editing
    let errors = {}
    dates.forEach((date, i) => {
      const key = date.id || i
      errors = this.validate(value[key] || {}, key, {dates, errors})
    })
    this.setState({...this.syncDatesValue(value, dates, 1), errors})
    this.syncOnChange(value)
  }

  syncDatesValue = (value, dates, replace = 0) => {
    const result = {value: [...value], dates: [...dates || fromTimeRanges(value)]}
    this.state.dates.forEach((data, i) => { // keep entered dates without time in state
      if (data.date && !data.from && !data.to && !result.dates.find(({date}) => date === data.date)) {
        result.dates.splice(i, replace, data)
        result.value.splice(i, replace, {})
      }
    })
    return result
  }

  syncOnChange = (value) => {
    if (!this.props.onChange) return
    const val = value.filter(val => !isEmpty(val))
    if (val.length) this.props.onChange(val)
  }

  renderDate = ({date, from, to, id}, i, items) => {
    const {readOnly} = this.props
    const dateProps = this.inputProps
    if (readOnly) dateProps.disabled = true
    const {required, ...timeProps} = dateProps
    const {disabled} = dateProps
    const key = id || i
    const error = this.state.errors[key] || {}
    if (this.state.dates.length > 1 && !readOnly) {
      dateProps.icon = 'delete'
      dateProps.onClickIcon = () => this.handleDeleteDate(key)
    }
    return (
      <Row key={key} className='app__fields--date__item bottom wrap'>
        <Row className='justify max-width-360'>
          <Input id={`date-${key}`} label='Date' placeholder='dd.mm.yyyy' stickyPlaceholder {...dateProps}
                 className='app__fields--date__item__date'
                 onChange={(date) => this.handleChangeDate({date}, key)}
                 value={date}
                 error={!disabled && (error.date || (items.length - 1 === i && this.props.error))}
          />
          <Input id={`from-${key}`} label='From' placeholder='hh:mm' stickyPlaceholder {...timeProps}
                 className={'app__fields--date__item__time' + ((readOnly && !from) ? ' invisible' : '')}
                 onChange={(from) => this.handleChangeDate({from}, key)}
                 value={from}
                 error={!disabled && error.from}
          ><Tooltip top>Start Time</Tooltip>
          </Input>
          <Input id={`to-${key}`} label='To' placeholder='hh:mm' stickyPlaceholder {...timeProps}
                 className={'app__fields--date__item__time' + ((readOnly && !to) ? ' invisible' : '')}
                 onChange={(to) => this.handleChangeDate({to}, key)}
                 value={to}
                 error={!disabled && error.to}
          ><Tooltip top>End Time</Tooltip>
          </Input>
        </Row>
      </Row>
    )
  }

  render () {
    const {placeholder = 'Add Dates', readOnly, className, style} = this.props
    const {dates} = this.state
    return (
      <View className={classNames('app__input--dates middle', className)} style={style}>
        {dates.map(this.renderDate)}
        {!readOnly &&
        <View className='left'>
          <Button className='small round transparent margin-v' onClick={this.handleAddDate}>
            <Icon name='plus-circle' className='margin-right-smaller'/>
            {placeholder}
          </Button>
        </View>
        }
      </View>
    )
  }
}
