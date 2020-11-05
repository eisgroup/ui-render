import AutoSave from 'modules-pack/form/views/AutoSave'
import React, { Component } from 'react'
import JsonView from 'react-ui-pack/JsonView'
import ScrollView from 'react-ui-pack/ScrollView'
import Text from 'react-ui-pack/Text'
import { logRender } from 'utils-pack'
import data from './examples/_data'
import meta from './examples/_meta'
import Render from './Render'
import { withUISetup } from './rules'

// console.warn(toJSON(meta))
/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
// todo: adds docs about debug attribute
// todo: fix Dropdown causing form submit
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
    const {meta, showMeta} = this.state
    return (
      <>
        <ScrollView fill className='fade-in bg-neutral'>
          <Text className='h1 center padding bg-grey no-margin'>All Possible Configurations of The UI Renderer</Text>
          <form onSubmit={this.props.handleSubmit}>
            <Render data={this.data} {...this.meta}/>
            <AutoSave save={save} partial showLoader/>
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const save = async values => {
  console.warn('Saving', values)
  await sleep(2000)
}
