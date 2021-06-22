import React, { Component } from 'react'
import Expand from 'react-ui-pack/Expand'
import JsonView from 'react-ui-pack/JsonView'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import View from 'react-ui-pack/View'
import Render from 'ui-renderer'
import { logRender } from 'utils-pack'
import data from './examples/_data.json'
import meta from './examples/_meta.json'
import listData from './examples/array-nested_data.json'
import decimalMeta from './examples/decimal_meta.json'
import dropdownMeta from './examples/dropdown_meta.json'
import exampleData from './examples/example_data.json'
import exampleMeta from './examples/example_meta'
import expandListMeta from './examples/expand-list_meta'
import inputMeta from './examples/input_meta'
import invalidArrayData from './examples/invalid-array_data'
import invalidArrayMeta from './examples/invalid-array_meta'
import listMeta from './examples/list_meta'
import piechartMeta from './examples/piechart_meta'
import showIfCondition from './examples/showIf'
import tabListMeta from './examples/tab-list_meta'
import tableNestedMeta from './examples/table-nested_meta'
import tableVerticalMeta from './examples/table-vertical_meta'
import { withUISetup } from './rules'

const examples = [
  {
    title: 'Decimal Points',
    data: exampleData,
    meta: decimalMeta,
  },
  {
    title: 'Dropdown',
    data: exampleData,
    meta: dropdownMeta,
  },
  {
    title: 'Dynamic Layout',
    data: exampleData,
    meta: exampleMeta,
  },
  {
    title: 'Dynamic List',
    data: listData,
    meta: listMeta,
  },
  {
    title: 'Expand List',
    data: listData,
    meta: expandListMeta,
  },
  {
    title: 'Tab List',
    data: listData,
    meta: tabListMeta,
  },
  {
    title: 'Table Nested within Table',
    data: listData,
    meta: tableNestedMeta,
  },
  {
    title: 'Table Rows as Columns (Vertical Layout)',
    data: listData,
    meta: tableVerticalMeta,
  },
  {
    title: 'Pie Chart',
    data,
    meta: piechartMeta,
  },
  {
    title: 'ShowIf Condition',
    data: exampleData,
    meta: showIfCondition,
  },
  {
    title: 'Input',
    data: exampleData,
    meta: inputMeta,
  },
  {
    title: 'Invalid Array Data',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  },
  {
    title: 'All Possible Configurations',
    data,
    meta,
  },
]

// todo: Enable json file download
/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class Examples extends Component {
  state = {
    activeIndex: null
  }

  toggleExpand = ({expanded, value}) => {
    this.setState({activeIndex: expanded ? value : null})
  }

  render () {
    const {activeIndex} = this.state
    return (
      <View className='app__examples bg-white border'>
        {examples.map(({data, meta, title}, i) => (
          <Expand
            key={title}
            index={i}
            expanded={i === activeIndex}
            title={title}
            onClick={this.toggleExpand}
            classNameLabel='inverted bg-inverse'
            classNameItems='bg-inverse'
          >
            {() => (
              <>
                <Example data={data} meta={meta} initialValues={data}/>
                <ScrollView className='padding-smaller bg-neutral inverted'>
                  <Row className='wrap spread'>
                    <View fill className='padding-smaller min-width-320'>
                      <h3>{'Meta.json'}</h3>
                      <JsonView data={meta} inverted/>
                    </View>
                    <View fill className='padding-smaller min-width-320'>
                      <h3>{'Data.json'}</h3>
                      <JsonView data={data} inverted/>
                    </View>
                  </Row>
                </ScrollView>
              </>
            )}
          </Expand>
        ))}
      </View>
    )
  }
}

@withUISetup()
@logRender
export class Example extends Component {
  state = {
    data: {
      json: this.props.data
    },
    meta: {
      json: this.props.meta
    }
  }

  render () {
    const {form, handleSubmit} = this.props
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={handleSubmit}>
          {this.hasData && this.hasMeta && <Render data={this.data} {...this.meta} form={form}/>}
        </form>
      </ScrollView>
    )
  }
}
