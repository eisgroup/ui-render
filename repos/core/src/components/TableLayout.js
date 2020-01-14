import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { capitalize, hasListValue, isInList, isInString, pluralize } from '../common/utils'
import AnimateHeight from './AnimateHeight'
import Button from './Button'
import Checkbox from './Checkbox'
import Icon from './Icon'
import { renderFilters } from './renders'
import Row from './Row'
import TableView from './TableView'
import Text from './Text'
import View from './View'

/**
 * Table Layout with Filters and Options to Show/Hide Columns/Rows
 *
 * @Note: check <TableView> component for props documentation
 */
export default class TableLayout extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired, // i.e. one of 'AD', 'CLIENT', 'GAME', etc.
    filters: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired, // id of the column/row to be filtered
      value: PropTypes.any, // value that the column/row must include
      icon: PropTypes.string,
      placeholder: PropTypes.string,
      type: PropTypes.string, // one of 'text' or 'dropdown', by default is 'text' input
      // ...other input field props
    })).isRequired, // whether the view is for mobile
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired, // id of the column/row to be filtered
      onChange: PropTypes.func.isRequired, // callback on check state change
      hidden: PropTypes.bool, // whether the column/row should not be rendered (used as checked value)
    })),
    addNew: PropTypes.object, // React component used to render `+NEW ${type}` button
    className: PropTypes.string // css class names to add to the wrapping container
    // ...other <TableView> props
  }

  state = {
    isOpenOptions: false
  }

  toggleOptions = () => {
    const { isOpenOptions } = this.state
    this.setState({ isOpenOptions: !isOpenOptions })
  }

  /* Filter Out Table Data According to Filter Input Values  */
  filter = (items) => {
    const { filters } = this.props
    return items.filter((item) => {
      let result = true
      for (const { id, value } of filters) {
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
    const { options } = this.props
    if (!hasListValue(options)) return items
    return items.filter((item) => !options.find(({ id, hidden }) => hidden && item.id === id))
  }

  render () {
    const { type, filters, options, addNew, className, items, headers, ...props } = this.props
    const { isOpenOptions } = this.state
    const headersFiltered = this.filterHeader(headers)
    const itemsFiltered = this.filter(items)
    const total = `${items.length} ${pluralize(capitalize(type), items.length)}`
    const hasHiddenItem = itemsFiltered.length < items.length
    return (
      <View className={classNames('app__table--layout', className)}>
        <Row className='app__table--layout__header wrap middle justify'>
          <Row className='app__table__filters wrap middle'>
            {filters.map(renderFilters)}
            {options &&
            <Button className='transparent no-margin-left' onClick={this.toggleOptions}>
              <Icon className='margin-right-smaller' name={isOpenOptions ? 'chevron-up' : 'options'}/>OPTIONS
            </Button>
            }
          </Row>
          <Row className='app__table__stats wrap'>
            <Row className='app__table__summary'>
              {hasHiddenItem &&
              <>
                <Text>{itemsFiltered.length}</Text>
                <Text className='fade'>/</Text>
              </>
              }
              <Text className={classNames({ fade: hasHiddenItem })}>{total}</Text>
            </Row>
            {addNew}
          </Row>
        </Row>
        <AnimateHeight animateOpacity expanded={isOpenOptions}>
          <Row className='app__table__options wrap'>
            {options && options.map(({ hidden, ...props }, i) => (
              <Checkbox key={props.id || i} value={!hidden} {...props}/>
            ))}
          </Row>
        </AnimateHeight>
        <TableView className='app__table' headers={headersFiltered} items={itemsFiltered} {...props}/>
      </View>
    )
  }
}
