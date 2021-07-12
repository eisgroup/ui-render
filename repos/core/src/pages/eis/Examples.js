import React, { Component } from 'react'
import Expand from 'react-ui-pack/Expand'
import JsonView from 'react-ui-pack/JsonView'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import View from 'react-ui-pack/View'
import Render from 'ui-renderer'
import { logRender } from 'utils-pack'
import data from './examples/_data.json'
import meta from './examples/_meta'
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
import * as matrixTable from './examples/matrix_table'
import piechartMeta from './examples/piechart_meta'
import showIfCondition from './examples/showIf'
import tabListMeta from './examples/tab-list_meta'
import tableNestedMeta from './examples/table-nested_meta'
import tableVerticalMeta from './examples/table-vertical_meta'
import { withUISetup } from './rules'

const examples = [
  {
    title: 'Decimal Points',
    id: 'decimal',
    data: exampleData,
    meta: decimalMeta,
  },
  {
    title: 'Dropdown',
    id: 'dropdown',
    data: exampleData,
    meta: dropdownMeta,
  },
  {
    title: 'Dynamic Layout',
    id: 'layout',
    data: exampleData,
    meta: exampleMeta,
  },
  {
    title: 'Dynamic List',
    id: 'list',
    data: listData,
    meta: listMeta,
  },
  {
    title: 'Expand List',
    id: 'expandList',
    data: listData,
    meta: expandListMeta,
  },
  {
    title: 'Tab List',
    id: 'tabList',
    data: listData,
    meta: tabListMeta,
  },
  {
    title: 'Table Nested within Table',
    id: 'table',
    data: listData,
    meta: tableNestedMeta,
  },
  {
    title: 'Table Rows as Columns (Vertical Layout)',
    id: 'tableVertical',
    data: listData,
    meta: tableVerticalMeta,
  },
  {
    title: 'Table with Matrix Data',
    id: 'tableMatrix',
    data: matrixTable.data,
    meta: matrixTable.meta,
  },
  {
    title: 'Table with Matrix Data (minimum required config)',
    id: 'tableMatrixRequired',
    data: matrixTable.data,
    meta: matrixTable.metaRequired,
  },
  {
    title: 'Pie Chart',
    id: 'pieChart',
    data,
    meta: piechartMeta,
  },
  {
    title: 'Show If Condition',
    id: 'showIf',
    data: exampleData,
    meta: showIfCondition,
  },
  {
    title: 'Input',
    id: 'input',
    data: exampleData,
    meta: inputMeta,
  },
  {
    title: 'Invalid Array Data',
    id: 'invalidArray',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  },
  {
    title: 'All Possible Configurations',
    id: 'all',
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
        {examples.map(({data, meta, title, id}, i) => (
          <Expand
            id={id}
            key={title}
            index={i}
            expanded={i === activeIndex}
            title={title}
            onClick={this.toggleExpand}
            classNameLabel="inverted bg-inverse"
            classNameItems="bg-inverse"
          >
            {() => (
              <>
                <Example data={data} meta={meta} initialValues={data}/>
                <ScrollView className="padding-smaller bg-neutral inverted">
                  <Row className="wrap spread">
                    <View fill className="padding-smaller min-width-320">
                      <h3>{'Meta.json'}</h3>
                      <JsonView data={meta} inverted/>
                    </View>
                    <View fill className="padding-smaller min-width-320">
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
