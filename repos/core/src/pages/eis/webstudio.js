import React, { Component } from 'react'
import { logRender } from '../../common/utils'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import Render from '../../components/views/Render'
import data from './data/_data'
import meta from './data/_meta'
import { transformConfig, withUISetup } from './rules'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@withUISetup({form: 'WebStudio'})
@logRender
export default class Webstudio extends Component {
  state = {
    data: {
      json: data,
    },
    meta: {
      json: transformConfig(meta),
    },
  }

  render () {
    const {data} = this.state
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta
            ? <Render data={data.json} {...this.meta}/>
            : <Placeholder><Text className='h1 error'>Missing *_data.json or *_meta.json</Text></Placeholder>
          }
        </form>
      </ScrollView>
    )
  }
}
