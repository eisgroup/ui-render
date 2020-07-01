import classNames from 'classnames'
import { capitalize, hasListValue, isInList, isInString, pluralize } from 'dux-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import AnimateHeight from './AnimateHeight'
import Button from './Button'
import Checkbox from './Checkbox'
import Icon from './Icon'
import Row from './Row'
import TableView from './TableView'
import Text from './Text'
import View from './View'

/**
 * Table Layout with Filters and Options to Show/Hide Columns/Rows
 *
 * @Note: check <TableView> component for props documentation
 */
export default class TableWithFilters extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired, // id of the column/row to be filtered
      view: PropTypes.string, // renderer to use, one of FIELD.TYPE
      value: PropTypes.any, // value that the column/row must include
      icon: PropTypes.string,
      placeholder: PropTypes.string,
      type: PropTypes.string, // input type, default is 'text'
      // ...other input field props
    })),
    // Table options (example: toggling which headers to show)
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired, // id of the column/row to be toggled
      onChange: PropTypes.func.isRequired, // callback on check state change
      hidden: PropTypes.bool, // whether the column/row should not be rendered (used as checked value)
    })),
    kind: PropTypes.string, // type of data, used for displaying total count of items
    addNew: PropTypes.object, // React component used to render `+NEW ${kind}` button
    className: PropTypes.string // css class names to add to the wrapping container
    // ...other <TableView> props
  }

  static defaultProps = {
    kind: 'item',
  }

  state = {
    isOpenOptions: false
  }

  toggleOptions = () => {
    const {isOpenOptions} = this.state
    this.setState({isOpenOptions: !isOpenOptions})
  }

  /* Filter Out Table Data According to Filter Input Values  */
  filter = (items) => {
    const {filters} = this.props
    if (!filters) return items
    return items.filter((item) => {
      let result = true
      for (const i in filters) {
        const {id, value} = filters[i]
        if (!value) continue

        // When filter is a list of values, check that the item's value is in the list
        if (hasListValue(value)) {
          result = isInList(value, item[id])
        }
        // When the filter is a string, check that the item's value contains the filter string
        else if (typeof value === 'string') {
          result = isInString(String(item[id]).toLowerCase(), value.toLowerCase())
        }

        // Exit loop early if mismatch encountered
        if (!result) return result
      }
      return result
    })
  }

  /* Filter Out Hidden Table Headers According to Checked OPTIONS */
  filterHeader = (items) => {
    const {options} = this.props
    if (!hasListValue(options)) return items
    return items.filter((item) => !options.find(({id, hidden}) => hidden && item.id === id))
  }

  renderFilter = (field, i) => {
    // todo: add dynamic field renderer
    return Render({done: false, ...field}, i)
  }

  renderFilters = () => {
    const {filters, options} = this.props
    const {isOpenOptions} = this.state
    if (!filters) return null
    return (
      <Row className='app__table__filters wrap middle'>
        {filters.map(this.renderFilter)}
        {options &&
        <Button className='transparent no-margin-left' onClick={this.toggleOptions}>
          <Icon className='margin-right-smaller' name={isOpenOptions ? 'chevron-up' : 'options'}/>OPTIONS
        </Button>
        }
      </Row>
    )
  }

  renderStats = () => {
    const {kind, addNew, items} = this.props
    const total = `${items.length} ${pluralize(capitalize(kind), items.length)}`
    const hasHiddenItem = this.items.length < items.length
    return (
      <Row className='app__table__stats wrap'>
        <Row className='app__table__summary'>
          {hasHiddenItem &&
          <>
            <Text>{this.items.length}</Text>
            <Text className='fade'>/</Text>
          </>
          }
          <Text className={classNames({fade: hasHiddenItem})}>{total}</Text>
        </Row>
        {addNew}
      </Row>

    )
  }

  render () {
    const {kind, filters, options, addNew, className, items, headers, ...props} = this.props
    const {isOpenOptions} = this.state
    const headersFiltered = this.filterHeader(headers)
    this.items = this.filter(items)
    return (
      <View className={classNames('app__table--layout', className)}>
        <Row className='app__table--layout__header wrap middle justify'>
          {this.renderFilters()}
          {this.renderStats()}
        </Row>
        {!!options &&
        <AnimateHeight animateOpacity expanded={isOpenOptions}>
          <Row className='app__table__options wrap'>
            {options && options.map(({hidden, ...props}, i) => (
              <Checkbox key={props.id || i} value={!hidden} {...props}/>
            ))}
          </Row>
        </AnimateHeight>
        }
        <TableView className='app__table' headers={headersFiltered} items={this.items} {...props}/>
      </View>
    )
  }
}
