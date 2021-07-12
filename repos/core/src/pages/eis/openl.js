import React, { Component } from 'react'
import JsonView from 'react-ui-pack/JsonView'
import ScrollView from 'react-ui-pack/ScrollView'
import Text from 'react-ui-pack/Text'
import Render from 'ui-renderer'
import { logRender } from 'utils-pack'
import data from './examples/_data'
import meta from './examples/_meta'
import { withUISetup } from './rules'

// console.warn(toJSON(meta))
/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
// todo: adds docs about debug attribute
@withUISetup({initialValues: data, subscription: {pristine: true, valid: true}})
@logRender
export default class OpenL extends Component {
  state = {
    showMeta: false,
    data: {
      json: data,
    },
    meta: {
      json: meta,
    },
  }

  render () {
    const {form, handleSubmit} = this.props
    const {meta, showMeta} = this.state
    return (
      <>
        <ScrollView fill className='fade-in bg-neutral'>
          <Text className='h1 center padding bg-grey no-margin'>All Possible Configurations of The UI Render</Text>
          <form onSubmit={handleSubmit}>
            <Render data={this.data} {...this.meta} form={form}/>
          </form>
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding bg-neutral inverted json-tree'>
          <JsonView data={meta.json} inverted/>
        </ScrollView>
        }
      </>
    )
  }
}
