import React, { Component } from 'react'
import Expand from 'react-ui-pack/Expand'
import JsonView from 'react-ui-pack/JsonView'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import View from 'react-ui-pack/View'
import { logRender } from 'utils-pack'
import data from './examples/_data.json'
import meta from './examples/_meta.json'
import invalidArrayData from './examples/invalid-array_data.json'
import invalidArrayMeta from './examples/invalid-array_meta.json'
import Render from './Render'
import { withUISetup } from './rules'

const examples = [
  {
    title: 'All Possible Configurations',
    data,
    meta,
  },
  {
    title: 'Invalid Array Data',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  }
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
