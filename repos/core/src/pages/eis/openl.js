import React, { Component } from 'react'
import { logRender } from '../../common/utils'
import Json from '../../components/Json'
import ScrollView from '../../components/ScrollView'
import Render from '../../components/views/Render'
import data from './data/_data'
import meta from './data/_meta'
import { transformConfig, withUISetup } from './rules'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@withUISetup({form: 'HOME', initialValues: data})
@logRender
export default class OpenL extends Component {
  state = {
    showMeta: false,
    data: {
      json: data,
    },
    meta: {
      json: transformConfig(meta),
    },
  }

  render () {
    const {meta, showMeta} = this.state
    return (
      <>
        <ScrollView fill className='fade-in bg-neutral'>
          <form onSubmit={this.handleSubmit}>
            <Render data={this.data} {...this.meta}/>
          </form>
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding bg-neutral inverted json-tree'>
          <Json data={meta.json} inverted/>
        </ScrollView>
        }
      </>
    )
  }
}
