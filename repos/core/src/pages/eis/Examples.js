import React, { Component } from 'react'
import Expand from 'react-ui-pack/Expand'
import JsonView from 'react-ui-pack/JsonView'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import View from 'react-ui-pack/View'
import { logRender } from 'utils-pack'
import data from './examples/_data.json'
import meta from './examples/_meta.json'
import listData from './examples/array-nested_data.json'
import dropdownMeta from './examples/dropdown_meta.json'
import exampleData from './examples/example_data.json'
import exampleMeta from './examples/example_meta.json'
import expandListMeta from './examples/expand-list_meta.json'
import invalidArrayData from './examples/invalid-array_data.json'
import invalidArrayMeta from './examples/invalid-array_meta.json'
import listMeta from './examples/list_meta.json'
import piechartMeta from './examples/piechart_meta.json'
import tabListMeta from './examples/tab-list_meta.json'
import tableNestedMeta from './examples/table-nested_meta.json'
import Render from './Render'
import { withUISetup } from './rules'

const examples = [
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
    title: 'Invalid Array Data',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  },
  {
    title: 'Pie Chart',
    data,
    meta: piechartMeta,
  },
  {
    title: 'All Possible Configurations',
    data,
    meta,
  },
]

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
                      <h3>{'Data.json'}</h3>
                      <JsonView data={data} inverted/>
                    </View>
                    <View fill className='padding-smaller min-width-320'>
                      <h3>{'Meta.json'}</h3>
                      <JsonView data={meta} inverted/>
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

@withUISetup({form: 'Example'})
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
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta && <Render data={this.data} {...this.meta}/>}
        </form>
      </ScrollView>
    )
  }
}